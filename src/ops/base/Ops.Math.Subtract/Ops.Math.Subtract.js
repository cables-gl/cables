Op.apply(this, arguments);
var self=this;

this.name='subtract';
this.result=this.addOutPort(new Port(this,"result"));
this.number1=this.addInPort(new Port(this,"number1"));
this.number2=this.addInPort(new Port(this,"number2"));

function exec()
{
    self.updateAnims();
    var v=parseFloat(self.number1.get())-parseFloat(self.number2.get());
    if(!isNaN(v)) self.result.set( v );
}

this.number1.onValueChanged=exec;
this.number2.onValueChanged=exec;

this.number1.set(1);
this.number2.set(1);
