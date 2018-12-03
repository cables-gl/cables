
var number = op.addInPort(new CABLES.Port(op, "number1"));
var result = op.addOutPort(new CABLES.Port(op, "result"));

var exec= function() {
    result.set(!( number.get() & 1 ));
};

number.onChange=exec;
exec();
