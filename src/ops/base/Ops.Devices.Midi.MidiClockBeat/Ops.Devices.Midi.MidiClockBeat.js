var eventIn=op.inObject("Event Input");

var triggerTick=op.outFunction("Beat");

var outSubTick=op.outValue("Sub Tick");
var triggerSub=op.outFunction("Sub Beat");

var clockStart = 0b11111010;
var clockTick = 0b11111000;
var tickCount = 0;


eventIn.onValueChanged=function()
{
    if(!eventIn.get())return;
    var data=eventIn.get().data;

    // var data = _event.data;
    var isTick = data[0] == clockTick;
    var isStart = data[0] == clockStart;
    
    if (isStart) {
        tickCount = 0;
    }
    else if (isTick) {
        if (tickCount==0) triggerTick.trigger();
        if (tickCount%6==0 )triggerSub.trigger();
        
        tickCount++;
        
        if (tickCount%24 == 0) tickCount = 0;
        
    }
    
    outSubTick.set(tickCount);

    
};

