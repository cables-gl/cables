var cgl=op.patch.cgl;

op.name='MidiButtonArray';
var exec=op.addInPort(new Port(op,"exec",OP_PORT_TYPE_FUNCTION));

var note=op.addInPort(new Port(op,"Note Start"));
var noteEnd=op.addInPort(new Port(op,"Note End"));

var learn=op.addInPort(new Port(op,"Learn Start",OP_PORT_TYPE_FUNCTION,{display:'button'}));
var learnEnd=op.addInPort(new Port(op,"Learn End",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var lastIndex=op.addOutPort(new Port(op,"Last Index"));
var numButtons=op.addOutPort(new Port(op,"Num Buttons"));

var values=op.addOutPort(new Port(op, "Buttons",OP_PORT_TYPE_ARRAY));
values.ignoreValueSerialize=true;

note.set(60);
noteEnd.set(68);
lastIndex.set(false);
note.onValueChanged=initArray;
noteEnd.onValueChanged=initArray;

var learning=false;
var learningEnd=false;
var lastValue=-1;
var buttons=[];

function setButtonState(i,v)
{
    buttons[i]=v;
    values.set(buttons);
    lastIndex.set(i);
    var noteOnMessage = [0x90, note.get()+i, 0];
    if(v>0) noteOnMessage = [0x90, note.get()+i, 120];

    if(cgl.frameStore.midi && cgl.frameStore.midi.out) cgl.frameStore.midi.out.send( noteOnMessage );
}

function initArray()
{
    var num=noteEnd.get()-note.get();
    if(num<0)return;
    buttons.length=num;
    numButtons.set(num);
    for(var i=0;i<num;i++) setButtonState(i,0);
    values.set(buttons);
}

exec.onTriggered=function()
{
    if(!cgl.frameStore.midi) return;
    
    if(learning && cgl.frameStore.lastMidiNote!=-1)
    {
        note.set(cgl.frameStore.lastMidiNote);
        learning=false;
        
        if(CABLES.UI)
        {
            op.uiAttr({info:'bound to note: ' + note.get()});
            gui.patch().showOpParams(op);
        }
    }

    if(learningEnd && cgl.frameStore.lastMidiNote!=-1)
    {
        noteEnd.set(cgl.frameStore.lastMidiNote);
        learningEnd=false;
        
        if(CABLES.UI)
        {
            op.uiAttr({info:'bound to note: ' + note.get()});
            gui.patch().showOpParams(op);
        }
    }

    for(var i=note.get();i<=noteEnd.get();i++)
    {
        if(cgl.frameStore.midi.notes[i])
        {
            var v=cgl.frameStore.midi.notes[i].v;
            setButtonState(i-note.get(),v);
        }
    }

};


learn.onTriggered=function()
{
    learning=true;
    cgl.frameStore.lastMidiNote=-1;
};

learnEnd.onTriggered=function()
{
    learningEnd=true;
    cgl.frameStore.lastMidiNote=-1;
};
