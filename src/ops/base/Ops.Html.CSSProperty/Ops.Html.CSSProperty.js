const inEle=op.inObject("Element");
const inProperty=op.inValueString("Property");
const inValue=op.inValue("Value");
const inValueSuffix=op.inValueString("Value Suffix",'px');
const outEle=op.outObject("HTML Element");

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