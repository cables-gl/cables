var eventIn=op.inObject("Event Input");
var note=op.addInPort(new CABLES.Port(op,"note"));
var channel=op.inValueInt("Channel",0);
var learn=op.inTriggerButton("learn");
var eventOut=op.outObject("Event Output");

var value=op.addOutPort(new CABLES.Port(op,"pressed"));

learn.onTriggered=function(){ learning=true; };
value.set(false);
note.set(1);

var learning=false;
var lastValue=-1;


eventIn.onChange=function()
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
            op.uiAttr({info:'Bound to note: ' + note.get()});
            gui.patch().showOpParams(op);
        }
    }

    if(note.get()==event.note && event.channel==channel.get())
    {
        var v=event.velocity;

        if(v==1 && lastValue!=1)
        {
            value.set(!value.get());
            var noteOnMessage = [0x90, note.get(), 0];
            if(value.get()) noteOnMessage = [0x90, note.get(), 120];

            event.output.send( noteOnMessage );
        }
        lastValue=v;
    }
    eventOut.set(event);
};

