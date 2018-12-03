
var exec=op.inTrigger("exec");
var next=op.outTrigger("next");
var timeUsed=op.outValue("Time used");
var outTImes=op.outArray("Times");

var times=[];
times.length=100;
for(var i=0;i<times.length;i++)
{
    times[i]=0;
}


var count=0;
outTImes.set(times);

exec.onTriggered=function()
{
    var start=performance.now();
    next.trigger();
    var end=performance.now();
    
    var l=end-start;
    times[count]=l;
    count++;
    if(count>=100)count=0;
    
    timeUsed.set(l);
    outTImes.set(null);
    outTImes.set(times);
    
};