Op.apply(this, arguments);
this.name="HeightMap";

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'image' } ));


var extrude=this.addInPort(new Port(this,"extrude",OP_PORT_TYPE_VALUE));
extrude.set(1);

var mWidth=this.addInPort(new Port(this,"width",OP_PORT_TYPE_VALUE));
var mHeight=this.addInPort(new Port(this,"height",OP_PORT_TYPE_VALUE));

var nRows=this.addInPort(new Port(this,"rows",OP_PORT_TYPE_VALUE));
var nColumns=this.addInPort(new Port(this,"columns",OP_PORT_TYPE_VALUE));


var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

mHeight.set(3.0);
mWidth.set(3.0);
nRows.set(20);
nColumns.set(20);

var geom=new CGL.Geometry();
var mesh=null;
var cgl=this.patch.cgl;
var image = new Image();

render.onTriggered=function()
{
    if(mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};


var rebuildGeom=function()
{
    geom.clear();

    var verts=[];
    var tc=[];
    var indices=[];

    var width=image.width;
    var height=image.height;
    console.log('img ',width,height);
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

    for(r=0;r<=numRows;r++)
    {
        for(c=0;c<=numColumns;c++)
        {
            var h = ctx.getImageData(c*rowStepY, r*rowStepX, 1, 1).data[1]*heightMul;

            verts.push( c*stepColumn    - meshWidth/2 );
            verts.push( r*stepRow       - meshHeight/2 );
            verts.push( h );

            tc.push( c/numColumns );
            tc.push( 1.0-r/numRows );
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

    console.log('count',count);
    console.log('indices',indices.length);
    console.log('verts',verts.length/3);
    
    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    geom.calcNormals();

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
    mesh.setGeom(geom);
    
}

var reload=function()
{
    
    image.crossOrigin = '';

    image.onabort=image.onerror=function(e)
    {
        console.log('error loading image...');
    };

    image.onload=function(e)
    {
        rebuildGeom();
    };
    image.src = filename.get();

};

extrude.onValueChange(rebuildGeom);
mHeight.onValueChange(rebuildGeom);
mWidth.onValueChange(rebuildGeom);
nRows.onValueChange(rebuildGeom);
nColumns.onValueChange(rebuildGeom);

filename.onValueChange(reload);

