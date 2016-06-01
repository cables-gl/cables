op.name='MidiSendBool';

var eventIn=op.addInPort(new Port(this,"Event Input",OP_PORT_TYPE_OBJECT));
var value=op.addInPort(new Port(this,"Value",OP_PORT_TYPE_VALUE,{"display":"bool"}));
var note=op.addInPort(new Port(op,"note"));
var learn=op.addInPort(new Port(op,"learn",OP_PORT_TYPE_FUNCTION,{display:'button'}));
var isControllCMd=op.addInPort(new Port(this,"Controll Value",OP_PORT_TYPE_VALUE,{"display":"bool"}));

var eventOut=op.addOutPort(new Port(this,"Event Output",OP_PORT_TYPE_OBJECT));

note.set(1);
var learning=false;
learn.onTriggered=function(){learning=true;};

value.onValueChanged=setValue;

function setValue()
{
    var event=eventIn.get();

    if(event.output)
    {
        var cmd=0x90;
        if(isControllCMd.get())cmd=0xb0;

        if(value.get()) event.output.send( [cmd, note.get(), 127] );
            else event.output.send( [cmd, note.get(), 0] );
    }
}

eventIn.onValueChanged=function()
{
    var event=eventIn.get();
    if(learning)
    {
        console.log(event.note);
        note.set(event.note);
        learning=false;

        if(event.cmd==11)isControllCMd.set(true);
            else isControllCMd.set(false);

        setValue();

        if(CABLES.UI)
        {
            op.uiAttr({info:'bound to note: ' + note.get()});
            gui.patch().showOpParams(op);
        }
    }

    eventOut.set(eventIn.get());
};
