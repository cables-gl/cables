var eventIn=op.inObject("Event Input");

var triggerTick=op.outFunction("Beat");

var triggerStart=op.outFunction("Start");

var outSubTick=op.outValue("Sub Tick");
var triggerSub=op.outFunction("Sub Beat");

var clockStart = 0b11111010;
var clockTick = 0b11111000;
var tickCount = 0;

var lastBeat=0;
// var beatCountStart=0;

var outBPM=op.outValue("BPM");
var outBeatDuration=op.outValue("Tick Duration");


eventIn.onValueChanged=function()
{
    if(!eventIn.get())return;

    var data=eventIn.get().data;

    // var data = _event.data;
    var isTick = data[0] == clockTick;
    var isStart = data[0] == clockStart;
    
    if (isStart)
    {
        tickCount = 0;
        triggerStart.trigger();
    }
    else if (isTick)
    {
        if (tickCount==0)
        {
            if(lastBeat!=0)
            {
                var diff=CABLES.now()-lastBeat;
                var bpm=60*1000/diff;
                outBPM.set(Math.round(bpm));
                outBeatDuration.set(60/bpm/4);
            }

            lastBeat=CABLES.now();
            triggerTick.trigger();
        }
        if (tickCount%6==0 )triggerSub.trigger();
        
        tickCount++;
        
        if (tickCount%24 == 0) tickCount = 0;
    }
    
    outSubTick.set(tickCount);

    
};

