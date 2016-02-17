var cgl=this.patch.cgl;

this.name='rectangle';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var width=this.addInPort(new Port(this,"width"));
var height=this.addInPort(new Port(this,"height"));

var pivotX=this.addInPort(new Port(this,"pivot x",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","left","right"]} ));
var pivotY=this.addInPort(new Port(this,"pivot y",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","top","bottom"]} ));

pivotX.set('center');
pivotY.set('center');

width.set(1.0);
height.set(1.0);

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

    geom.vertices = [
         width.get()/2+x,  height.get()/2+y,  0.0,
        -width.get()/2+x,  height.get()/2+y,  0.0,
         width.get()/2+x, -height.get()/2+y,  0.0,
        -width.get()/2+x, -height.get()/2+y,  0.0
    ];

    geom.texCoords = [
         1.0, 0.0,
         0.0, 0.0,
         1.0, 1.0,
         0.0, 1.0
    ];

    geom.verticesIndices = [
        0, 1, 2,
        2, 1, 3
    ];

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
    mesh.setGeom(geom);
}
rebuild();

pivotX.onValueChanged=rebuild;
pivotY.onValueChanged=rebuild;
width.onValueChanged=rebuild;
height.onValueChanged=rebuild;