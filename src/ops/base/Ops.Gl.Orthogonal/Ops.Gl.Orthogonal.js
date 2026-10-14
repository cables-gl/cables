const
    render=op.inTrigger('render'),
    trigger=op.outTrigger('trigger'),
    boundsLeft=op.inFloat("left",-2),
    boundsRight=op.inFloat("right",2),
    boundsBottom=op.inFloat("bottom",-2),
    boundsTop=op.inFloat("top",2),
    zNear=op.inFloat("frustum near",0.01),
    zFar=op.inFloat("frustum far",100);

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
