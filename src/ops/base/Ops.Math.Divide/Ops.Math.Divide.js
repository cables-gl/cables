const number1 = op.addInPort(new CABLES.Port(op, "number1"));
const number2 = op.addInPort(new CABLES.Port(op, "number2"));
const result = op.addOutPort(new CABLES.Port(op, "result"));

const exec = function() {
    result.set( number1.get() / number2.get() );
};

number1.set(1);
number2.set(1);

number1.onValueChanged = exec;
number2.onValueChanged = exec;
exec();
