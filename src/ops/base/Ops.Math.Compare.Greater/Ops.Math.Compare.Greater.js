this.name='Greater';
var result=this.addOutPort(new Port(this,"result"));
var number1=this.addInPort(new Port(this,"number1"));
var number2=this.addInPort(new Port(this,"number2"));

function exec()
{
    result.val=number1.get()>number2.get();
}

number1.onValueChanged=exec;
number2.onValueChanged=exec;
