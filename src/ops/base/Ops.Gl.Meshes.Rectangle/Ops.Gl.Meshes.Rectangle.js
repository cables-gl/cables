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

var geom=new CGL.Geometry();
var mesh=null;

render.onTriggered=function()
{
    mesh.render(cgl.getShader());
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

    var verts=[];
    var tc=[];
    var indices=[];

    var numRows=parseInt(nRows.get(),10);
    var numColumns=parseInt(nColumns.get(),10);
    
    var stepColumn=width.get()/numColumns;
    var stepRow=height.get()/numRows;
    
    var c,r;

    for(r=0;r<=numRows;r++)
    {
        for(c=0;c<=numColumns;c++)
        {
            verts.push( c*stepColumn    - width.get()/2+x );
            if(axis.get()=='xz') verts.push( 0.0 );
            verts.push( r*stepRow       - height.get()/2+y );
            if(axis.get()=='xy') verts.push( 0.0 );

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
            indices.push(v3);
            indices.push(v2);

            indices.push(v2);
            indices.push(v3);
            indices.push(v4);
            // console.log(f3);
        }
    }

    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    // geom.vertices = [
    //      width.get()/2+x,  height.get()/2+y,  0.0,
    //     -width.get()/2+x,  height.get()/2+y,  0.0,
    //      width.get()/2+x, -height.get()/2+y,  0.0,
    //     -width.get()/2+x, -height.get()/2+y,  0.0
    // ];

    // geom.texCoords = [
    //      1.0, 0.0,
    //      0.0, 0.0,
    //      1.0, 1.0,
    //      0.0, 1.0
    // ];

    // geom.verticesIndices = [
    //     0, 1, 2,
    //     2, 1, 3
    // ];

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
    mesh.setGeom(geom);
}
rebuild();

axis.onValueChanged=rebuild;
pivotX.onValueChanged=rebuild;
pivotY.onValueChanged=rebuild;
width.onValueChanged=rebuild;
height.onValueChanged=rebuild;
nRows.onValueChanged=rebuild;
nColumns.onValueChanged=rebuild;