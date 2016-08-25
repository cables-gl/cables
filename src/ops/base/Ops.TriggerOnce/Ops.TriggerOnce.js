op.name="TriggerOnce";

var exe=this.addOutPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));


exe.trigger();