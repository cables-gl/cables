const
    result=op.outValue("result"),
    number1=op.inValueFloat("number"),
    decPlaces=op.inValueFloat("Decimal Places",0);

number1.onChange=decPlaces.onChange=exec;

function exec()
{
    var decm=Math.pow(10,decPlaces.get());
    result.set(Math.round(number1.get()*decm)/decm);
}

