Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='And';

this.bool0=this.addInPort(new Port(this,"bool 1",OP_PORT_TYPE_VALUE));
this.bool1=this.addInPort(new Port(this,"bool 2",OP_PORT_TYPE_VALUE));

this.result=this.addOutPort(new Port(this,"result",OP_PORT_TYPE_VALUE));

function exec()
{
    self.result.set( self.bool1.get() && self.bool0.get() );
}

this.bool0.onValueChanged=exec;
this.bool1.onValueChanged=exec;

