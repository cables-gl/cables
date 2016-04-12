this.name='Round';
var result=this.addOutPort(new Port(this,"result"));
var number1=this.addInPort(new Port(this,"number"));

function exec()
{
    result.set(Math.round(number1.get()));
}

number1.onValueChanged=exec;
