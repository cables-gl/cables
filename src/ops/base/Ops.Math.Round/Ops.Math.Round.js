op.name='Round';
var result=op.addOutPort(new Port(op,"result"));
var number1=op.addInPort(new Port(op,"number"));
var decPlaces=op.addInPort(new Port(op,"Decimal Places"));

decPlaces.set(2);

function exec()
{
    var decm=Math.pow(10,decPlaces.get());
    result.set(Math.round(number1.get()*decm)/decm);
}

number1.onValueChanged=exec;
