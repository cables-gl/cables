const result=op.outValue("result");
const number1=op.inValueFloat("number1");
const number2=op.inValueFloat("number2");
const pingpong=op.inValueBool("pingpong");

// pointer to function
var calculateFunction = calculateModule;

number1.onChange=exec;
number2.onChange=exec;

number1.set(1);
number2.set(2);

pingpong.onChange=updatePingPong;

function exec()
{
    var n2=number2.get();
    var n1=number1.get();

    result.set( calculateFunction(n1, n2) );
    return;
}

function calculateModule(n1, n2) {
    var re = ((n1%n2)+n2)%n2;
    if(re!=re) re=0;
    return re;
}

function calculatePingPong(n1, n2) {
    var r = ((n1%n2)+n2)%n2*2;
    if(r>n2) return n2 * 2.0-r;
    else return r;
}

function updatePingPong()
{
    if (pingpong.get()) calculateFunction = calculatePingPong;
    else calculateFunction = calculateModule;
}

