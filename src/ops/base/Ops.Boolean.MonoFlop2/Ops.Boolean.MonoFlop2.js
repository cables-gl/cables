
var update=op.inFunctionButton("update");
// var trigger=op.inFunctionButton("Trigger");
var duration=op.inValue("Duration",1);
var valueTrue=op.inValue("Value True",1);
var valueFalse=op.inValue("Value False",0);

var result=op.outValue("Result",false);

var nextTime=-1;


valueTrue.onChange=function()
{
    result.set(valueTrue.get());
    nextTime=CABLES.now()+duration.get()*1000;
};

update.onTriggered=doUpdate;

function doUpdate()
{
    if(CABLES.now()>nextTime)
    {
        result.set(valueFalse.get());
    }


}