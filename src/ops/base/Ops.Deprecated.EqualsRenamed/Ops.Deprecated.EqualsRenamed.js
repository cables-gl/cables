this.name="Ops.user.tim.Equals";

var result = this.addOutPort(new CABLES.Port(this,"result"));
var number1 = this.addInPort(new CABLES.Port(this,"number1"));
var number2 =this.addInPort(new CABLES.Port(this,"number2"));

number1.set(1);
number2.set(1);

var exec = function() {
    result.set( number1.get() == number2.get() );
};

number1.onValueChanged = exec;
number2.onValueChanged = exec;
exec();