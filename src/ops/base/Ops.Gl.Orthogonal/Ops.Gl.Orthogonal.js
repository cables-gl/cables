const render=op.inTrigger('render');
const trigger=op.outTrigger('trigger');
const boundsLeft=op.inValue("left",-2);
const boundsRight=op.inValue("right",2);
const boundsBottom=op.inValue("bottom",-2);
const boundsTop=op.inValue("top",2);
const zNear=op.inValue("frustum near",0.01);
const zFar=op.inValue("frustum far",100);

const cgl=op.patch.cgl;

render.onTriggered=function()
{
    var ratio=1;

    cgl.pushPMatrix();
    mat4.ortho(cgl.pMatrix,
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
