const
    result = op.outValue("result"),
    number1 = op.inValueFloat("number"),
    decPlaces = op.inInt("Decimal Places", 0);

number1.onChange = exec;
let decm = 0;

decPlaces.onChange = () =>
{
    decm = Math.pow(10, decPlaces.get());
    exec();
};

function exec()
{
    result.set(Math.round(number1.get() * decm) / decm);
}
