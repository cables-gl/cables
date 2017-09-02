op.name='Smaller';

var number1 = op.addInPort(new Port(this, "number1"));
var number2 = op.addInPort(new Port(this,"number2"));
var result = op.addOutPort(new Port(this, "result"));

var exec= function() {
    result.set( number1.get() < number2.get() );
};

number1.onValueChanged = exec;
number2.onValueChanged = exec;
exec();
