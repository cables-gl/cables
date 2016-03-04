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

    var n2=parseFloat(number2.get());
    var n1=parseFloat(number1.get());
    
    if(n2===0)n2=0.001;
    if(n1===0)n1=0.001;

    if(doPingPong)
    {
        result.set(n1 % n2*2);
        if(result.get()>n2) result.set( n2 * 2.0-result.get() );
        return;
    }

    result.set(n1 % n2 );
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
