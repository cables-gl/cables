op.name = "IsEven";

var number = op.addInPort(new Port(op, "number1"));
var result = op.addOutPort(new Port(op, "result"));

var exec= function() {
    result.set(!( number.get() & 1 ));
};

number.onValueChanged = exec;
exec();
