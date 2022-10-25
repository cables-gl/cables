const
    number1 = op.inValueFloat("number"),
    decPlaces = op.inInt("Decimal Places", 0),
    result = op.outNumber("result");

let decm = 0;

number1.onChange = exec;
decPlaces.onChange = updateDecm;

updateDecm();

function updateDecm()
{
    decm = Math.pow(10, decPlaces.get());
    exec();
}

function exec()
{
    result.set(Math.round(number1.get() * decm) / decm);
}
