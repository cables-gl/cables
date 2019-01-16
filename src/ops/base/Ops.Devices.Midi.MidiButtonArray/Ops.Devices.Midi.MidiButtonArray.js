
op.name='MidiButtonArray';
var eventIn=op.addInPort(new CABLES.Port(op,"Event Input",CABLES.OP_PORT_TYPE_OBJECT));

var note=op.addInPort(new CABLES.Port(op,"Note Start"));
var learn=op.addInPort(new CABLES.Port(op,"Learn Start",CABLES.OP_PORT_TYPE_FUNCTION,{display:'button'}));

var noteEnd=op.addInPort(new CABLES.Port(op,"Note End"));
var learnEnd=op.addInPort(new CABLES.Port(op,"Learn End",CABLES.OP_PORT_TYPE_FUNCTION,{display:'button'}));

var lights=op.addInPort(new CABLES.Port(op,"Light",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var toggle=op.inValueBool("Toggle");

var inValue=op.inValue("Button Value",1);

var eventOut=op.addOutPort(new CABLES.Port(op,"Event Output",CABLES.OP_PORT_TYPE_OBJECT));

var lastIndex=op.addOutPort(new CABLES.Port(op,"Last Index"));
var numButtons=op.addOutPort(new CABLES.Port(op,"Num Buttons"));

var values=op.addOutPort(new CABLES.Port(op, "Buttons",CABLES.OP_PORT_TYPE_ARRAY));

var inClear=op.inTriggerButton("Clear");

var inEnabled=op.inValueBool("enabled",true);

values.ignoreValueSerialize=true;

note.set(60);
noteEnd.set(68);
lastIndex.set(false);
note.onChange=initArray;
noteEnd.onChange=initArray;

learn.onTriggered=function(){learning=true;};
learnEnd.onTriggered=function(){learningEnd=true;};

var learning=false;
var learningEnd=false;
var lastValue=-1;
var buttons=[];
var lastEvent=null;

function setButtonState(i,v)
{
    if(toggle.get())
    {
        if(v!=0)
        {
            if(!buttons[i]) buttons[i]=inValue.get();
                else buttons[i]=0;
        }
    }
    else
    {
        buttons[i]=v;
    }
    lastIndex.set(i);
    values.set(null);
    values.set(buttons);
    //lastIndex.set(i);
    if(lights.get())
    {
        var noteOnMessage = [0x90, note.get()+i, 0];
        if(buttons[i]>0) noteOnMessage = [0x90, note.get()+i, 120];

        if(lastEvent && lastEvent.output) lastEvent.output.send( noteOnMessage );
    }
}

function initArray()
{
    // if(!noteEnd.get() || !note.get())return;
    var num=noteEnd.get()-note.get();
    if(num<0)return;
    buttons.length=num;
    numButtons.set(num);
    for(var i=0;i<num;i++)
    {
        setButtonState(i,0);
        buttons[i]=0;
    }

    values.set(buttons);
}

eventIn.onChange=function()
{
    if(!inEnabled.get())return;
    var event=eventIn.get();
    if(!event)return;
    if(learning)
    {
        note.set(event.note);
        learning=false;

        if(CABLES.UI)
        {
            op.uiAttr({info:'bound to note: ' + note.get()});
            gui.patch().showOpParams(op);
        }
    }

    if(learningEnd)
    {
        noteEnd.set(event.note);
        learningEnd=false;

        if(CABLES.UI)
        {
            op.uiAttr({info:'bound to note: ' + note.get()});
            gui.patch().showOpParams(op);
        }
    }

    for(var i=note.get();i<=noteEnd.get();i++)
    {
        if(event.note==i)
        {
            var v=event.velocity;
            setButtonState(i-note.get(),v);
        }
    }
    lastEvent=event;
    eventOut.set(event);
};

inClear.onTriggered=function()
{
    initArray();
};
