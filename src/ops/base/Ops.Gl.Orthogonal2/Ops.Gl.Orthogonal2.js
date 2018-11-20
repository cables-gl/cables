const
    render=op.inTrigger('render'),
    bounds=op.inValue("bounds",2),
    zNear=op.inValue("frustum near",0.01),
    zFar=op.inValue("frustum far",100),
    trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;

render.onTriggered=function()
{
    var ratio=cgl.canvasHeight/cgl.canvasWidth;

    cgl.pushPMatrix();
    mat4.ortho(
        cgl.pMatrix,
        -bounds.get(),
        bounds.get(),
        -bounds.get()*ratio,
        bounds.get()*ratio,
        parseFloat(zNear.get()),
        parseFloat(zFar.get())
        );

    trigger.trigger();
    cgl.popPMatrix();
};
