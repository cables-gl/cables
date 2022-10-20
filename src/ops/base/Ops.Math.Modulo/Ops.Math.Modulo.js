const
    number1 = op.inValueFloat("number1", 1),
    number2 = op.inValueFloat("number2", 2),
    pingpong = op.inValueBool("pingpong"),
    result = op.outNumber("result");

let calculateFunction = calculateModule;

number1.onChange =
number2.onChange = exec;

pingpong.onChange = updatePingPong;

exec();

function exec()
{
    let n2 = number2.get();
    let n1 = number1.get();

    result.set(calculateFunction(n1, n2));
}

function calculateModule(n1, n2)
{
    let re = ((n1 % n2) + n2) % n2;
    if (re != re) re = 0;
    return re;
}

function calculatePingPong(i, n)
{
    let cycle = 2 * n;
    i %= cycle;
    if (i >= n) return cycle - i;
    else return i;
}

function updatePingPong()
{
    if (pingpong.get()) calculateFunction = calculatePingPong;
    else calculateFunction = calculateModule;
}
