const
    render=op.inTrigger('render'),
    shearX=op.inValueFloat("shearX",0.5),
    shearY=op.inValueFloat("shearY"),
    trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shearMatrix = mat4.create();

shearY.onChange=shearX.onChange=update;

function update()
{
    mat4.identity(shearMatrix);
    shearMatrix[1]=Math.tan(shearX.get());
    shearMatrix[4]=Math.tan(shearY.get());
}

render.onTriggered=function()
{
    cgl.pushModelMatrix();

    mat4.multiply(cgl.mMatrix,cgl.mMatrix,shearMatrix);
    trigger.trigger();

    cgl.popModelMatrix();
};

