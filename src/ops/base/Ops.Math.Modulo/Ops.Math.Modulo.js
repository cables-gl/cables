op.name='Modulo';
var result=op.addOutPort(new Port(op,"result"));
var number1=op.addInPort(new Port(op,"number1"));
var number2=op.addInPort(new Port(op,"number2"));
var pingpong=op.addInPort(new Port(op,"pingpong",OP_PORT_TYPE_VALUE,{display:'bool'}));


var doPingPong=false;

function exec()
{
    var n2=number2.get();
    var n1=number1.get();

    if(doPingPong)
    {
        var r=n1 % n2*2;
        if(r>n2) result.set( n2 * 2.0-r );
            else result.set(r);
        return;
    }
    else
    {
        var re=n1 % n2;
        if(re!=re) re=0;
        result.set(re);
    }
}

number1.onChange=exec;
number2.onChange=exec;

number1.set(1);
number2.set(2);

pingpong.onValueChange(
    function()
    {
        doPingPong=pingpong.get();
    });
