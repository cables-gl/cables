const
    inEle=op.inObject("Element"),
    inProperty=op.inValueString("Property"),
    inValue=op.inValue("Value"),
    inValueSuffix=op.inValueString("Value Suffix",'px'),
    outEle=op.outObject("HTML Element");

inProperty.onChange=update;
inValue.onChange=update;
inValueSuffix.onChange=update;
var ele=null;

inEle.onChange=inEle.onLinkChanged=function()
{
    if(ele && ele.style)
    {
        ele.style[inProperty.get()]='initial';
    }
    update();
};

function update()
{
    ele=inEle.get();
    if(ele && ele.style)
    {
        var str=inValue.get()+inValueSuffix.get();
        ele.style[inProperty.get()]=str;
    }

    outEle.set(inEle.get());
}