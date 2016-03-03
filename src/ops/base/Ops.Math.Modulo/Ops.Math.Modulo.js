Op.apply(this, arguments);
var self=this;

this.name='Modulo';
var result=this.addOutPort(new Port(this,"result"));
var number1=this.addInPort(new Port(this,"number1"));
var number2=this.addInPort(new Port(this,"number2"));
var pingpong=this.addInPort(new Port(this,"pingpong",OP_PORT_TYPE_VALUE,{display:'bool'}));

var doPingPong=false;

function exec()
{
    self.updateAnims();

    if(doPingPong)
    {
        result.set(number1.get() % number2.get()*2);
        if(result.get()>number2.get()) result.set( number2.get() * 2.0-result.get() );
        return;
    }

    result.set(number1.get() % number2.get() );
}

number1.onValueChange(exec);
number2.onValueChange(exec);

number1.set(1);
number2.set(2);

pingpong.onValueChange(
    function()
    {
        doPingPong=pingpong.get();
    });
