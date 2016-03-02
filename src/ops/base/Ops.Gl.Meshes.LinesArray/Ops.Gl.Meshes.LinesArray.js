var cgl=this.patch.cgl;

this.name='rectangle';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var width=this.addInPort(new Port(this,"width"));
var height=this.addInPort(new Port(this,"height"));

var pivotX=this.addInPort(new Port(this,"pivot x",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","left","right"]} ));
var pivotY=this.addInPort(new Port(this,"pivot y",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","top","bottom"]} ));

var nColumns=this.addInPort(new Port(this,"num columns"));
var nRows=this.addInPort(new Port(this,"num rows"));

var axis=this.addInPort(new Port(this,"axis",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["xy","xz"]} ));
axis.set('xy');
pivotX.set('center');
pivotY.set('center');

width.set(1.0);
height.set(1.0);

nRows.set(1);
nColumns.set(1);

var meshes=[];

render.onTriggered=function()
{
    var shader=cgl.getShader();
    oldPrim=shader.glPrimitive;
    shader.glPrimitive=cgl.gl.LINE_STRIP;

    for(var i=0;i<meshes.length;i++)
        meshes[i].render(shader);
    
    shader.glPrimitive=oldPrim;
    
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

    for(r=0;r<=numRows;r++)
    {
        var verts=[];
        var tc=[];
        var indices=[];

        for(c=0;c<=numColumns;c++)
        {
            verts.push( c*stepColumn    - width.get()/2+x );
            if(axis.get()=='xz') verts.push( 0.0 );
            verts.push( r*stepRow       - height.get()/2+y );
            if(axis.get()=='xy') verts.push( 0.0 );

            tc.push( c/numColumns );
            tc.push( 1.0-r/numRows );
            
            indices.push(c);
        }

        var geom=new CGL.Geometry();
        geom.vertices=verts;
        geom.texCoords=tc;
        geom.verticesIndices=indices;
    
        var mesh=new CGL.Mesh(cgl,geom);
        mesh.setGeom(geom);
        meshes.push(mesh);
    }


}
rebuild();

axis.onValueChanged=rebuild;
pivotX.onValueChanged=rebuild;
pivotY.onValueChanged=rebuild;
width.onValueChanged=rebuild;
height.onValueChanged=rebuild;
nRows.onValueChanged=rebuild;
nColumns.onValueChanged=rebuild;

