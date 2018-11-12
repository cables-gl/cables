const
    render=op.inTrigger('render'),
    trigger=op.outTrigger('trigger'),
    boundsLeft=op.inValue("left",-2),
    boundsRight=op.inValue("right",2),
    boundsBottom=op.inValue("bottom",-2),
    boundsTop=op.inValue("top",2),
    zNear=op.inValue("frustum near",0.01),
    zFar=op.inValue("frustum far",100);

const cgl=op.patch.cgl;

render.onTriggered=function()
{
    var ratio=1;

    cgl.pushPMatrix();
    mat4.ortho(
        cgl.pMatrix,
        boundsLeft.get()*ratio,
        boundsRight.get()*ratio,
        boundsBottom.get()*ratio,
        boundsTop.get()*ratio,
        parseFloat(zNear.get()),
        parseFloat(zFar.get())
        );

    trigger.trigger();
    cgl.popPMatrix();
};
