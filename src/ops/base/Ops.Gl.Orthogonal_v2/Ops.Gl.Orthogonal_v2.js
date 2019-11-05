const
    render=op.inTrigger('render'),
    bounds=op.inValue("bounds",2),
    fixAxis=op.inSwitch("Axis",["X","Y"],"X"),
    zNear=op.inValue("frustum near",0.01),
    zFar=op.inValue("frustum far",100),
    trigger=op.outTrigger('trigger'),
    outRatio=op.outValue("Ratio"),
    outWidth=op.outValue("Width"),
    outHeight=op.outValue("Height")
    ;

const cgl=op.patch.cgl;

render.onTriggered=function()
{
    const vp=cgl.getViewPort();

    if(fixAxis.get()=="X")
    {
        const ratio=vp[3]/vp[2];

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

        outWidth.set(bounds.get()*2);
        outHeight.set(bounds.get()*ratio*2);
        outRatio.set(ratio);
    }
    else
    {
        const ratio=vp[2]/vp[3];

        cgl.pushPMatrix();
        mat4.ortho(
            cgl.pMatrix,
            -bounds.get()*ratio,
            bounds.get()*ratio,
            -bounds.get(),
            bounds.get(),
            parseFloat(zNear.get()),
            parseFloat(zFar.get())
            );

        outWidth.set(bounds.get()*ratio*2);
        outHeight.set(bounds.get()*2);
        outRatio.set(ratio);
    }

    trigger.trigger();
    cgl.popPMatrix();
};


