var eventIn=op.addInPort(new Port(this,"Event Input",OP_PORT_TYPE_OBJECT));

var note=op.addInPort(new Port(this,"note"));
var channel=op.inValueInt("Channel",0);
var learn=op.addInPort(new Port(this,"learn",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var eventOut=op.addOutPort(new Port(this,"Event Output",OP_PORT_TYPE_OBJECT));
var value=op.addOutPort(new Port(this,"value"));

note.set(60);
value.set(0);

var learning=false;
learn.onTriggered=function(){ learning=true; };
op.onLoaded=initMidiValue;

var lastEvent=null;

function setMidiValue()
{
    if(lastEvent && lastEvent.output)
    {
        var noteOnMessage = [0xB0, note.get(), parseInt(value.get()*127,10)];
        lastEvent.output.send( noteOnMessage );
        return true;
    }
    return false;
}

function initMidiValue()
{
    if(!setMidiValue()) setTimeout(initMidiValue,300);
}

eventIn.onValueChanged=function()
{
    var event=eventIn.get();
    if(!event)return;
    if(learning)
    {
        note.set(event.note);
        channel.set(event.channel);
        learning=false;
        
        if(CABLES.UI)
        {
            op.uiAttr({info:'bound to note: ' + note.get()});
            gui.patch().showOpParams(op);
        }
    }

    if(event.note==note.get() && event.channel==channel.get())
    {
        value.set(event.velocity);
    }
    
    eventOut.set(event);
    lastEvent=event;
};

