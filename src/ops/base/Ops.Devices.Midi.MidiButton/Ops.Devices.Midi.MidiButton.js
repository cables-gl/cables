
op.name='Midi Push Button';
var eventIn=op.addInPort(new Port(op,"Event Input",OP_PORT_TYPE_OBJECT));
var note=op.addInPort(new Port(op,"note"));
var learn=op.addInPort(new Port(op,"learn",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var eventOut=op.addOutPort(new Port(op,"Event Output",OP_PORT_TYPE_OBJECT));
var outPressed=op.addOutPort(new Port(op,"pressed"));

var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));

var lights=op.addInPort(new Port(op,"Light",OP_PORT_TYPE_VALUE,{display:'bool'}));

note.set(1);
var learning=false;
var lastValue=-1;
learn.onTriggered=function(){learning=true;};

eventIn.onValueChanged=function()
{
    var event=eventIn.get();    
    if(learning)
    {
        note.set(event.note);
        learning=false;
        
        console.log('bound '+event.note);
        
        if(CABLES.UI)
        {
            op.uiAttr({info:'bound to note: ' + note.get()});
            gui.patch().showOpParams(op);
        }
    }

    if(note.get()==event.note)
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

