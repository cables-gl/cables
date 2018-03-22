var idx=op.inValueInt("Index");
var inDur=op.inValue("Duration",0.5);

var anim=new CABLES.TL.Anim();
anim.createPort(op,"easing");

var resultTime1=op.outValue("Time 1");
var resultFade=op.outValue("Time Fade");
var resultTime2=op.outValue("Time 2");

var startTime=0;
var valuePorts=[];
var oldIdx=-1;

idx.onChange=setIndex;

for(var i=0;i<10;i++)
{
    var p=op.inValue("Value "+i);
    valuePorts.push( p );
    p.onChange=update;
}

setIndex();

function update()
{
    if(!valuePorts[oldIdx]) return;

    resultTime1.set(valuePorts[oldIdx].get());
    resultTime2.set(valuePorts[idx.get()].get());
    var fade=anim.getValue(CABLES.now()/1000);
    resultFade.set(fade);
}

function setIndex()
{
    var now=(CABLES.now())/1000;
    var startTime=now;
    anim.clear();
    
    if(oldIdx==-1)oldIdx=idx.get();

    anim.setValue(now,0);
    anim.setValue(now+inDur.get(),1,
        function()
        {
            oldIdx=idx.get();
            var now=(CABLES.now())/1000;
            anim.setValue(now,0);
        });
    update();
}
