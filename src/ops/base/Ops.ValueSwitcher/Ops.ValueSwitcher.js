op.name="ValueSwitcher";

var triggers=[];

var currentVal=op.outValue("Value");
var oldVal=op.outValue("Last Value");

var triggered=op.outFunction("Triggered");

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
    var newExe=op.addInPort(new Port(op,"Trigger "+i,OP_PORT_TYPE_FUNCTION));
    newExe.slot=i;
    newExe.onTriggered=onTrigger.bind(newExe);
    var newVal=op.addInPort(new Port(op,"Value "+i,OP_PORT_TYPE_VALUE));
    inVals.push( newVal );
}
