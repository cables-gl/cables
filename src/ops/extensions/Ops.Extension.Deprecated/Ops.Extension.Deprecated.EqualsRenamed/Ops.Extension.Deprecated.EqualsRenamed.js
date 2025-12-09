this.name = "Ops.user.tim.Equals";

let result = this.addOutPort(new CABLES.Port(this, "result"));
let number1 = this.addInPort(new CABLES.Port(this, "number1"));
let number2 = this.addInPort(new CABLES.Port(this, "number2"));

number1.set(1);
number2.set(1);

let exec = function ()
{
    result.set(number1.get() == number2.get());
};

number1.onChange = exec;
number2.onChange = exec;
exec();
