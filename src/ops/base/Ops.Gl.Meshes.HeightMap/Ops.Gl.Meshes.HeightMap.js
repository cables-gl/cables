op.name="HeightMap";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'image' } ));

var extrude=op.addInPort(new Port(op,"extrude",OP_PORT_TYPE_VALUE));
var mWidth=op.addInPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var mHeight=op.addInPort(new Port(op,"height",OP_PORT_TYPE_VALUE));
var nRows=op.addInPort(new Port(op,"rows",OP_PORT_TYPE_VALUE));
var nColumns=op.addInPort(new Port(op,"columns",OP_PORT_TYPE_VALUE));
var sliceTex=op.addInPort(new Port(op,"texCoords slice",OP_PORT_TYPE_VALUE,{display:'bool'}));
var flat=op.addInPort(new Port(op,"flat",OP_PORT_TYPE_VALUE,{display:'bool'}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var outGeom=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));
outGeom.ignoreValueSerialize=true;


extrude.set(1);
mHeight.set(3.0);
mWidth.set(3.0);
nRows.set(20);
nColumns.set(20);

var geom=new CGL.Geometry();
var mesh=null;
var cgl=op.patch.cgl;
var image = new Image();

render.onTriggered=function()
{
    if(mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

extrude.onValueChanged=rebuildGeom;
mHeight.onValueChanged=rebuildGeom;
mWidth.onValueChanged=rebuildGeom;
nRows.onValueChanged=rebuildGeom;
nColumns.onValueChanged=rebuildGeom;
flat.onValueChanged=rebuildGeom;

filename.onValueChanged=reload;

function rebuildGeom()
{
    geom.clear();

    var verts=[];
    var tc=[];
    var indices=[];

    var width=image.width;
    var height=image.height;
    var canvas = document.createElement('canvas');
    var ctx=canvas.getContext('2d');
    canvas.width=width;
    canvas.height=height;
    ctx.drawImage(image, 0, 0);

    var meshWidth=mWidth.get();
    var meshHeight=mHeight.get();

    var count=0;
    
    var vertStepX=meshWidth/width;
    var vertStepY=meshHeight/height;

    var numRows=parseFloat(nRows.get());
    var numColumns=parseFloat(nColumns.get());
    var rowStepX=width/numColumns;
    var rowStepY=height/numRows;
    var heightMul=extrude.get()*0.001;

    var stepRow=meshWidth/numRows;
    var stepColumn=meshHeight/numColumns;
    
    var cycleTex=0;
    var oldh=0;



    for(r=0;r<=numRows;r++)
    {
        for(c=0;c<=numColumns;c++)
        {
            var h = ctx.getImageData(Math.round(c*rowStepX), Math.round(r*rowStepY), 1, 1).data[1]*heightMul;
            // verts.push( c*stepColumn    - meshWidth/2 );
            // verts.push( r*stepRow       - meshHeight/2 );
            verts.push( c*stepColumn );
            verts.push( r*stepRow );
            verts.push( h );

            if(sliceTex.get())
            {
                if(h!=oldh)
                {
                    if(c%2==0) tc.push( 0.5 );
                    else tc.push( 1 );

                    tc.push( 1.0-r/numRows );
                }
                else
                {
                    tc.push( 1 );
                    tc.push( 0 );
                }
                oldh=h;
            }
            else
            {
                tc.push( c/numColumns );
                tc.push( 1.0-r/numRows );
            }
        }
    }

    for(c=0;c<numColumns;c++)
    {
        for(r=0;r<numRows;r++)
        {
            var ind = c+(numColumns+1)*r;
            var v1=ind;
            var v2=ind+1;
            var v3=ind+numColumns+1;
            var v4=ind+1+numColumns+1;

            indices.push(v1);
            indices.push(v2);
            indices.push(v3);

            indices.push(v2);
            indices.push(v3);
            indices.push(v4);
        }
    }

    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    if(flat.get())geom.unIndex();
    geom.calculateNormals({"forceZUp":true});
    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
    mesh.setGeom(geom);
    outGeom.set(null);
    outGeom.set(geom);
}

function reload()
{
    image.crossOrigin = '';
    var url=op.patch.getFilePath(filename.get());

    var loadingId=op.patch.loading.start('heightmapImage',url);

    image.onabort=image.onerror=function(e)
    {
        op.patch.loading.finished(loadingId);
        op.log('error loading heightmap image...');
    };

    image.onload=function(e)
    {
        rebuildGeom();
        op.patch.loading.finished(loadingId);
    };
    image.src = url;
}

