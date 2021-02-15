const
    inEle=op.inObject("Element",null,"element"),
    inTransX=op.inFloat("Translate X",0),
    inTransY=op.inFloat("Translate Y",0),
    inScale=op.inFloat("Scale",1),
    inRot=op.inFloat("Rot Z",0);

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Translate", [inTransY, inTransX]);


inTransX.onChange =
inTransY.onChange =
inScale.onChange =
inRot.onChange =
    update;


let ele = null;

inEle.onChange = inEle.onLinkChanged = function ()
{
    if (ele && ele.style)
    {
        ele.style.transform = "initial";
    }
    update();
};


function update()
{
    ele = inEle.get();
    if (ele && ele.style)
    {
        let str = "";

        if(inTransY.get() || inTransX.get())
            str+="translate("+inTransX.get()+"px , "+inTransY.get()+"px) ";

        if(inScale.get()!=1.0)
            str+="scale("+inScale.get()+") ";

        if(inRot.get()!=0.0)
            str+="rotateZ("+inRot.get()+"deg) ";

        try
        {
            ele.style.transform = str;
        }
        catch (e)
        {
            op.error(e);
        }
    }
    else
    {
        setTimeout(update, 50);
    }

    // outEle.set(inEle.get());
}
