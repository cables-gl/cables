const
    inEle=op.inObject("Element"),
    inProperty=op.inString("Property"),
    inValue=op.inFloat("Value"),
    inValueSuffix=op.inString("Value Suffix",'px'),
    outEle=op.outObject("HTML Element");

op.setPortGroup("Element",[inEle]);
op.setPortGroup("Attributes",[inProperty,inValue,inValueSuffix]);

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