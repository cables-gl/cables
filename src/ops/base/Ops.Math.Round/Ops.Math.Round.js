const result=op.outValue("result");
var number1=op.addInPort(new CABLES.Port(op,"number"));
var decPlaces=op.addInPort(new CABLES.Port(op,"Decimal Places"));

decPlaces.set(0);

function exec()
{
    var decm=Math.pow(10,decPlaces.get());
    result.set(Math.round(number1.get()*decm)/decm);
}

number1.onChange=exec;
decPlaces.onChange=exec;
