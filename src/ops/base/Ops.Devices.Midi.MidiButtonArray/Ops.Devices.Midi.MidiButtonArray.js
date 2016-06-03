
op.name='MidiButtonArray';
var eventIn=op.addInPort(new Port(op,"Event Input",OP_PORT_TYPE_OBJECT));

var note=op.addInPort(new Port(op,"Note Start"));
var learn=op.addInPort(new Port(op,"Learn Start",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var noteEnd=op.addInPort(new Port(op,"Note End"));
var learnEnd=op.addInPort(new Port(op,"Learn End",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var lights=op.addInPort(new Port(op,"Light",OP_PORT_TYPE_VALUE,{display:'bool'}));


var eventOut=op.addOutPort(new Port(op,"Event Output",OP_PORT_TYPE_OBJECT));

var lastIndex=op.addOutPort(new Port(op,"Last Index"));
var numButtons=op.addOutPort(new Port(op,"Num Buttons"));

var values=op.addOutPort(new Port(op, "Buttons",OP_PORT_TYPE_ARRAY));
values.ignoreValueSerialize=true;

note.set(60);
noteEnd.set(68);
lastIndex.set(false);
note.onValueChanged=initArray;
noteEnd.onValueChanged=initArray;

learn.onTriggered=function(){learning=true;};
learnEnd.onTriggered=function(){learningEnd=true;};

var learning=false;
var learningEnd=false;
var lastValue=-1;
var buttons=[];
var lastEvent=null;

function setButtonState(i,v)
{
    buttons[i]=v;
    values.set(buttons);
    lastIndex.set(i);
    if(lights.get())
    {
        var noteOnMessage = [0x90, note.get()+i, 0];
        if(v>0) noteOnMessage = [0x90, note.get()+i, 120];
        
        if(lastEvent && lastEvent.output) lastEvent.output.send( noteOnMessage );
    }

    
}

function initArray()
{
    if(!noteEnd.get() || !note.get())return;
    var num=noteEnd.get()-note.get();
    if(num<0)return;
    buttons.length=num;
    numButtons.set(num);
    for(var i=0;i<num;i++) setButtonState(i,0);
    values.set(buttons);
}

eventIn.onValueChanged=function()
{
    var event=eventIn.get();
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


