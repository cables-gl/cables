const
    inVal=op.inValue("Delta Value"),
    defVal=op.inValue("Default Value",0),
    inReset=op.inTriggerButton("Reset"),
    inLimit=op.inValueBool("Limit",false),
    inMin=op.inValue("Min",0),
    inMax=op.inValue("Max",100),
    inMul=op.inValue("Multiply",1);

inVal.changeAlways=true;

var value=0;
var outVal=op.outValue("Absolute Value");
inLimit.onChange=updateLimit;
updateLimit();

function resetValue()
{
    value=defVal.get();
    outVal.set(value);

}

defVal.onChange=resetValue;
inReset.onTriggered=resetValue;

function updateLimit()
{
    if(!inLimit.get())
    {
        inMin.setUiAttribs({greyout:true});
        inMax.setUiAttribs({greyout:true});
    }
    else
    {
        inMin.setUiAttribs({greyout:false});
        inMax.setUiAttribs({greyout:false});
    }
}


inVal.onChange=function()
{
    value+=inVal.get()*inMul.get();

    if(inLimit.get())
    {
        if(value<inMin.get())value=inMin.get();
        if(value>inMax.get())value=inMax.get();
    }

    outVal.set(value);
};
