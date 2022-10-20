const number = op.inValueFloat("number");
const result = op.outNumber("result");

number.onChange = function ()
{
    let r = Math.log(number.get());
    if (isNaN(r))r = 0;
    result.set(r);
};
