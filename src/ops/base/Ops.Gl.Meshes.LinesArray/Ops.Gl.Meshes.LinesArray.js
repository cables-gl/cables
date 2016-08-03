
op.name='LineArray';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var width=op.addInPort(new Port(op,"width"));
var height=op.addInPort(new Port(op,"height"));
var pivotX=op.addInPort(new Port(op,"pivot x",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","left","right"]} ));
var pivotY=op.addInPort(new Port(op,"pivot y",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","top","bottom"]} ));
var nColumns=op.addInPort(new Port(op,"num columns"));
var nRows=op.addInPort(new Port(op,"num rows"));
var axis=op.addInPort(new Port(op,"axis",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["xy","xz"]} ));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
axis.set('xy');
pivotX.set('center');
pivotY.set('center');

width.set(1.0);
height.set(1.0);
nRows.set(10);
nColumns.set(10);

var meshes=[];

axis.onValueChanged=rebuild;
pivotX.onValueChanged=rebuild;
pivotY.onValueChanged=rebuild;
width.onValueChanged=rebuild;
height.onValueChanged=rebuild;
nRows.onValueChanged=rebuild;
nColumns.onValueChanged=rebuild;
rebuild();

render.onTriggered=function()
{
    for(var i=0;i<meshes.length;i++) meshes[i].render(cgl.getShader());
    trigger.trigger();
};

function rebuild()
{
    var x=0;
    var y=0;

    if(pivotX.get()=='center') x=0;
    if(pivotX.get()=='right') x=-width.get()/2;
    if(pivotX.get()=='left') x=+width.get()/2;

    if(pivotY.get()=='center') y=0;
    if(pivotY.get()=='top') y=-height.get()/2;
    if(pivotY.get()=='bottom') y=+height.get()/2;

    var numRows=parseInt(nRows.get(),10);
    var numColumns=parseInt(nColumns.get(),10);

    var stepColumn=width.get()/numColumns;
    var stepRow=height.get()/numRows;

    var c,r;
    meshes.length=0;

    var vx,vy,vz;
    var verts=[];
    var tc=[];
    var indices=[];
    var count=0;

    function addMesh()
    {
        var geom=new CGL.Geometry();
        geom.vertices=verts;
        geom.texCoords=tc;
        geom.verticesIndices=indices;
        
        var mesh=new CGL.Mesh(cgl, geom, cgl.gl.LINES);
        mesh.setGeom(geom);
        meshes.push(mesh);

        verts.length=0;
        tc.length=0;
        indices.length=0;
        count=0;
    }

    for(r=numRows;r>=0;r--)
    {
        var lvx=null,lvy=null,lvz=null;

        for(c=numColumns;c>=0;c--)
        {
            vx = c * stepColumn - width.get()  / 2 + x;
            vy = r * stepRow    - height.get() / 2 + y;
            vz=0.0;

            if(axis.get()=='xz') 
            {
                vz=vy;
                vy= 0.0 ;
            }
            if(axis.get()=='xy') vz=0.0;

            if(lvx!==null)
            {
                verts.push( lvx );
                verts.push( lvy );
                verts.push( lvz );
    
                verts.push( vx );
                verts.push( vy );
                verts.push( vz );
    
                tc.push( c/numColumns );
                tc.push( 1.0-r/numRows );

                tc.push( c/numColumns );
                tc.push( 1.0-r/numRows );
    
                indices.push(count);
                count++;
                indices.push(count);
                count++;
            }
            
            if(count>64000)
            {
                addMesh();
            }

            lvx=vx;
            lvy=vy;
            lvz=vz;
        }
    }
    
    addMesh();

    console.log(meshes.length,' meshes');


}
