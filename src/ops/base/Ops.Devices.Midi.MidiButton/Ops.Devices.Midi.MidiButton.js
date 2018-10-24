
var eventIn=op.addInPort(new CABLES.Port(op,"Event Input",CABLES.OP_PORT_TYPE_OBJECT));
var note=op.addInPort(new CABLES.Port(op,"note"));
var channel=op.inValueInt("Channel",0);
var learn=op.addInPort(new CABLES.Port(op,"learn",CABLES.OP_PORT_TYPE_FUNCTION,{display:'button'}));

var eventOut=op.addOutPort(new CABLES.Port(op,"Event Output",CABLES.OP_PORT_TYPE_OBJECT));
var outPressed=op.addOutPort(new CABLES.Port(op,"pressed"));

var trigger=op.addOutPort(new CABLES.Port(op,"Trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var lights=op.addInPort(new CABLES.Port(op,"Light",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));

note.set(1);
var learning=false;
var lastValue=-1;
learn.onTriggered=function(){learning=true;};

eventIn.onValueChanged=function()
{
    var event=eventIn.get();
    if(!event)return;
    if(learning)
    {
        channel.set(event.channel);
        note.set(event.note);
        learning=false;
        
        if(CABLES.UI)
        {
            op.uiAttr({info:'bound to note: ' + note.get()});
            gui.patch().showOpParams(op);
        }
    }

    if(note.get()==event.note && event.channel==channel.get())
    {
        var v=event.velocity;
        if(v===0)
        {
            if(lights.get())event.output.send( [0x90, note.get(), 0] );
            outPressed.set(false);
        }
        if(v==1)
        {
            if(lights.get())event.output.send( [0x90, note.get(), 120] );
            outPressed.set(true);
            trigger.trigger();
        }
        
    }
    eventOut.set(event);
};

