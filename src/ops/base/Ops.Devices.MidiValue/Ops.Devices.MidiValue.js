var cgl=this.patch.cgl;
var self=this;
this.name='MidiValue';
var exec=this.addInPort(new Port(this,"exec",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var note=this.addInPort(new Port(this,"note"));
note.set(1);

var learn=this.addInPort(new Port(this,"learn",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var value=this.addOutPort(new Port(this,"value"));
value.set(0);

var learning=false;

exec.onTriggered=function()
{
    if(!cgl.frameStore.midi) return;
    
    if(learning && cgl.frameStore.lastMidiNote!=-1)
    {
        note.set(cgl.frameStore.lastMidiNote);
        learning=false;
        
        if(CABLES.UI)
        {
            self.uiAttr({info:'bound to note: ' + note.get()});
            gui.patch().showOpParams(self);
        }
    }

    if(cgl.frameStore.midi[note.get()])
    {
        value.set(cgl.frameStore.midi[note.get()].v);
        cgl.frameStore.midi[note.get()]=null;
        trigger.trigger();
    }
};

learn.onTriggered=function()
{
    learning=true;
    cgl.frameStore.lastMidiNote=-1;
};