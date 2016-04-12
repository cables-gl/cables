op.name = "IsEven";

var number = this.addInPort(new Port(this, "number1"));
var result = this.addOutPort(new Port(this, "result"));

var exec= function() {
    result.set(!( number.get() & 1 ));
};

number.onValueChanged = exec;
exec();
