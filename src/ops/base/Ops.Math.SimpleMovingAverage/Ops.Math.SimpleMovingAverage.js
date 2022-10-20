const
    val = op.inValue("Value"),
    num = op.inValueInt("Number of Values", 10),
    result = op.outNumber("Result");

val.changeAlways = true;
let buffer = [];
let index = 0;

num.onChange = init;
init();

function init()
{
    let n = Math.abs(Math.floor(num.get()));
    buffer.length = n;

    for (let i = 0; i < buffer.length; i++)buffer[i] = null;
    index = 0;
}

val.onChange = function ()
{
    index++;
    if (index >= buffer.length)index = 0;
    buffer[index] = val.get();

    let avg = 0;
    let divide = 0;
    for (let i = 0; i < buffer.length; i++)
    {
        if (buffer[i] !== null) // ignore zeroes
        {
            avg += buffer[i];
            divide++;
        }
    }

    result.set(avg / divide || 1);
};
