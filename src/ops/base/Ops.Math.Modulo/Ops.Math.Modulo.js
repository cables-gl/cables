op.name='Modulo';
var result=op.addOutPort(new Port(op,"result"));
var number1=op.addInPort(new Port(op,"number1"));
var number2=op.addInPort(new Port(op,"number2"));
var pingpong=op.addInPort(new Port(op,"pingpong",OP_PORT_TYPE_VALUE,{display:'bool'}));

var doPingPong=false;

function exec()
{
    var n2=parseFloat(number2.get());
    var n1=parseFloat(number1.get());

    if(doPingPong)
    {
        var r=n1 % n2*2;
        if(r>n2) result.set( n2 * 2.0-r );
        else result.set(r);
        return;
    }
    else
    {
        if(n2===0)n2=0.00001;
        if(n1===0)n1=0.00001;
        result.set(n1 % n2 );
    }
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
