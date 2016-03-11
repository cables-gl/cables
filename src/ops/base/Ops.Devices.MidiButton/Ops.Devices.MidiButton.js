var cgl=this.patch.cgl;
var self=this;

this.name='Midi Push Button';
var exec=this.addInPort(new Port(this,"exec",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var note=this.addInPort(new Port(this,"note"));
note.set(1);

var learn=this.addInPort(new Port(this,"learn",OP_PORT_TYPE_FUNCTION,{display:'button'}));
var outPressed=this.addOutPort(new Port(this,"pressed"));

var learning=false;
var lastValue=-1;

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

    if(cgl.frameStore.midi.notes[note.get()])
    {
        var v=cgl.frameStore.midi.notes[note.get()].v;
        console.log("v",v);
        if(v===0)
        {
            outPressed.set(false);
        }
        if(v==1)
        {
            outPressed.set(true);
            // console.log('button trigger!@');
            trigger.trigger();
        }
    }
};

learn.onTriggered=function()
{
    learning=true;
    cgl.frameStore.lastMidiNote=-1;
};