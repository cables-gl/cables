var exec=op.inTrigger("Exec");
var range=op.inValue("Range Radius",1);
var attraction=op.inValue("attraction");
var angle=op.inValue("Angle");
var show=op.inValueBool("Show");
var posX=op.inValue("Pos X");
var posY=op.inValue("Pos Y");
var posZ=op.inValue("Pos Z");

var next=op.outTrigger("next");

var forceObj={};
var mesh=null;
var pos=[0,0,0];
var cgl=op.patch.cgl;

range.onChange=updateForceObject;
attraction.onChange=updateForceObject;
angle.onChange=updateForceObject;
posX.onChange=updateForceObject;
posY.onChange=updateForceObject;
posZ.onChange=updateForceObject;

function updateForceObject()
{
    forceObj.range=range.get();
    forceObj.attraction=attraction.get();
    forceObj.angle=angle.get();
    forceObj.pos=pos;
}

op.onDelete=function()
{

};

var mark=new CGL.Marker(cgl);

exec.onTriggered=function()
{
    if(show.get())
    {
        cgl.pushModelMatrix();

        // if(!mesh)mesh=new CGL.WirePoint(cgl);
        mat4.translate(cgl.mMatrix,cgl.mMatrix,[posX.get(),posY.get(),posZ.get()]);
        // mesh.render(cgl,range.get()*2);
        mark.draw(cgl);
        cgl.popModelMatrix();
    }

    // vec3.transformMat4(pos, [posX.get(),posY.get(),posZ.get()], cgl.mMatrix);
    pos=[posX.get(),posY.get(),posZ.get()];

    updateForceObject();

    CABLES.forceFieldForces=CABLES.forceFieldForces||[];
    CABLES.forceFieldForces.push(forceObj);

    next.trigger();

    CABLES.forceFieldForces.pop();

    if(CABLES.UI && gui.patch().isCurrentOp(op))
        gui.setTransformGizmo(
            {
                posX:posX,
                posY:posY,
                posZ:posZ,
            });
};
