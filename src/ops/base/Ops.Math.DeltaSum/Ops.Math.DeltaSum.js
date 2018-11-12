const inVal=op.inValue("Delta Value");
const defVal=op.inValue("Default Value",0);
const inReset=op.inTriggerButton("Reset");
const inLimit=op.inValueBool("Limit",false);
const inMin=op.inValue("Min",0);
const inMax=op.inValue("Max",100);
const inMul=op.inValue("Multiply",1);

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
        inMin.setUiAttribs({hidePort:true,greyout:true});
        inMax.setUiAttribs({hidePort:true,greyout:true});
    }
    else
    {
        inMin.setUiAttribs({hidePort:false,greyout:false});
        inMax.setUiAttribs({hidePort:false,greyout:false});
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
