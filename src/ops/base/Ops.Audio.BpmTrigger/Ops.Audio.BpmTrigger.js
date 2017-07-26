op.name="BpmTrigger";


var trigger=op.inFunction("trigger");

var inBpm=op.inValue("BPM",120);
var inOffset=op.inValue("Offset",0);

var next=op.outFunction("trigger");
var outBeat=op.outValue("beat num");
var outPerc=op.outValue("percent");

var beatDuration=0;

inBpm.onChange=updateBpm;
updateBpm();

function updateBpm()
{
    beatDuration=60/inBpm.get();
}


trigger.onTriggered=function()
{
    var time=op.patch.timer.getTime()+inOffset.get();
    var beat=Math.round(time/beatDuration);
    
    outPerc.set( -1*(time-((beat+1)*beatDuration) )/beatDuration );
    
    outBeat.set(beat);
    
};