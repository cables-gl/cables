let exec = op.inTrigger("Exec");
let range = op.inValue("Range Radius", 1);
let attraction = op.inValue("attraction");
let angle = op.inValue("Angle");
let show = op.inValueBool("Show");
let posX = op.inValue("Pos X");
let posY = op.inValue("Pos Y");
let posZ = op.inValue("Pos Z");

let next = op.outTrigger("next");

let forceObj = {};
let mesh = null;
let pos = [0, 0, 0];
let cgl = op.patch.cgl;

range.onChange = updateForceObject;
attraction.onChange = updateForceObject;
angle.onChange = updateForceObject;
posX.onChange = updateForceObject;
posY.onChange = updateForceObject;
posZ.onChange = updateForceObject;

function updateForceObject()
{
    forceObj.range = range.get();
    forceObj.attraction = attraction.get();
    forceObj.angle = angle.get();
    forceObj.pos = pos;
}

op.onDelete = function ()
{

};

let mark = new CGL.Marker(cgl);

exec.onTriggered = function ()
{
    if (show.get())
    {
        cgl.pushModelMatrix();

        // if(!mesh)mesh=new CGL.WirePoint(cgl);
        mat4.translate(cgl.mMatrix, cgl.mMatrix, [posX.get(), posY.get(), posZ.get()]);
        // mesh.render(cgl,range.get()*2);
        mark.draw(cgl);
        cgl.popModelMatrix();
    }

    // vec3.transformMat4(pos, [posX.get(),posY.get(),posZ.get()], cgl.mMatrix);
    pos = [posX.get(), posY.get(), posZ.get()];

    updateForceObject();

    CABLES.forceFieldForces = CABLES.forceFieldForces || [];
    CABLES.forceFieldForces.push(forceObj);

    next.trigger();

    CABLES.forceFieldForces.pop();

    if (op.isCurrentUiOp())
        gui.setTransformGizmo(
            {
                posX,
                posY,
                posZ,
            });
};
