Op.apply(this, arguments);
var self=this;

this.name='if true then';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

this.bool=this.addInPort(new Port(this,"boolean"));
this.bool.set(false);

this.triggerThen=this.addOutPort(new Port(this,"then",OP_PORT_TYPE_FUNCTION));
this.triggerElse=this.addOutPort(new Port(this,"else",OP_PORT_TYPE_FUNCTION));

function exec()
{
    if(self.bool.get() || self.bool.get()>=1 )
    {
        self.triggerThen.trigger();
    }
    else
    {
        self.triggerElse.trigger();
    }
}

this.bool.onValueChanged=exec;
this.exe.onTriggered=exec;
