Op.apply(this, arguments);
var self=this;

this.name='if true then';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

var boolean=this.addInPort(new Port(this,"boolean"));
boolean.set(false);

var triggerThen=this.addOutPort(new Port(this,"then",OP_PORT_TYPE_FUNCTION));
var triggerElse=this.addOutPort(new Port(this,"else",OP_PORT_TYPE_FUNCTION));

function execBool()
{
    if(exe.isLinked())return;
    exec();
}

function exec()
{
    if(boolean.get() || boolean.get()>=1 )
    {
        triggerThen.trigger();
    }
    else
    {
        triggerElse.trigger();
    }
}

boolean.onValueChanged=execBool;
exe.onTriggered=exec;
