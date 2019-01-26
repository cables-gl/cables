
const result=op.outValue("result");
const number1=op.inValueFloat("number1");
const number2=op.inValueFloat("number2");
const pingpong=op.inValueBool("pingpong");

var doPingPong=false;

number1.onChange=exec;
number2.onChange=exec;

number1.set(1);
number2.set(2);

pingpong.onChange=updatePingPong;

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

function updatePingPong()
{
    doPingPong=pingpong.get();
}
