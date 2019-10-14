var text=op.inStringEditor("text");
var inRestart=op.inTriggerButton("Restart");
var speed=op.inValue("Speed",500);
var speedVariation=op.inValueSlider("Speed Variation");
const showCursor=op.inBool("Show Cursor",true);

var outText=op.outString("Result");
var outChanged=op.outTrigger("Changed");
var outFinished=op.outTrigger("Finished");

outText.set('  \n  ');
var pos=0;
var updateInterval=0;
var cursorblink=true;
var finished=false;

function setNewTimeout()
{
    clearTimeout(updateInterval);
    var ms=speed.get()*(Math.random()*(speedVariation.get()*2-1));
    if(text.get() && pos>text.get().length)ms=speed.get();
    updateInterval=setTimeout(update,speed.get()+ms);
}

inRestart.onTriggered=function()
{
    finished=false;
    pos=0;
    setNewTimeout();
};

function update()
{
    if(!text.get() || text.get()==='' || text.get()==='0' ||text.get()=='0' )
    {
        outText.set(' ');
        return;
    }

    var t=text.get().substring(0,pos);
    cursorblink=!cursorblink;

    if(pos>text.get().length && cursorblink)
    {
        if(showCursor.get())
        {
            // t+=' ';
            // pos++;
        }

        if(!finished)
        {
            outFinished.trigger();
            finished=true;
        }
    }
    else
    {
        finished=false;
        if(showCursor.get())
        {
            t+='_';
        }
        pos++;
    }

    outText.set( t );
    outChanged.trigger();
    setNewTimeout();
}

text.onChange=function()
{
    finished=false;
    pos=0;
    setNewTimeout();
    outText.set('');
};



