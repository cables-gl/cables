const currentVal=op.outValue("Value"),
    oldVal=op.outValue("Last Value"),
    triggered=op.outTrigger("Triggered");

var triggers=[];
var inVals=[];
var inExes=[];

function onTrigger()
{
    oldVal.set(currentVal.get());
    currentVal.set( inVals[this.slot].get() );
    triggered.trigger();
}

var num=8;
for(var i=0;i<num;i++)
{
    var newExe=op.inTrigger("Trigger "+i);
    newExe.slot=i;
    newExe.onTriggered=onTrigger.bind(newExe);
    var newVal=op.inValueFloat("Value "+i);
    inVals.push( newVal );
}

var defaultVal = op.inValueString("Default Value");

currentVal.set(defaultVal.get());
oldVal.set(defaultVal.get());

defaultVal.onChange = function(){
    oldVal.set(currentVal.get());
    currentVal.set(defaultVal.get());
};


