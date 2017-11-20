op.name="StringTyper";

var text=op.addInPort(new Port(op,"text",OP_PORT_TYPE_VALUE,{type:'string',display:'editor'}));
var inRestart=op.inFunctionButton("Restart");
var speed=op.inValue("Speed",500);
var speedVariation=op.inValueSlider("Speed Variation");

var outText=op.outValueString("Result");
var outChanged=op.outFunction("Changed");
var outFinished=op.outFunction("Finished");

outText.set('  \n  ');

var pos=0;
var updateInterval=0;
var cursorblink=true;

function setNewTimeout()
{
    clearTimeout(updateInterval);
    var ms=speed.get()*(Math.random()*(speedVariation.get()*2-1));
    if(pos>text.get().length)ms=speed.get();
    updateInterval=setTimeout(update,speed.get()+ms);
}

inRestart.onTriggered=function()
{
    pos=0;
    setNewTimeout();
};

function update()
{
    if(!text.get() || text.get()==='' || text.get()==='0' ||text.get()=='0' )
    {
        outText.set( ' ' );
        return;
    }
    
    
    
    var t=text.get().substring(0,pos);
    cursorblink=!cursorblink;

    if(pos>text.get().length && cursorblink)
    {

    }
    else
    {
        t+='_';
        pos++;
    }

    outText.set( t );
    outChanged.trigger();
    setNewTimeout();
}

text.onChange=function()
{
    pos=0;
    setNewTimeout();
};
