Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;
this.name='MidiValue';
this.exec=this.addInPort(new Port(this,"exec",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.note=this.addInPort(new Port(this,"note"));
this.note.set(8);

this.value=this.addOutPort(new Port(this,"value"));
this.value.set(0);

this.exec.onTriggered=function()
{
    if(!cgl.frameStore.midi) return;

    if(cgl.frameStore.midi[self.note.get()])
    {
        self.value.set(cgl.frameStore.midi[self.note.get()].v);
    }
    self.trigger.trigger();

};

