op.name='SmoothStep';
var result=op.addOutPort(new Port(op,"result"));
var number=op.addInPort(new Port(op,"number"));
var min=op.addInPort(new Port(op,"min"));
var max=op.addInPort(new Port(op,"max"));

var subAdd=0;

function exec()
{
    // todo negative min ?

    var x = Math.max(0, Math.min(1, (number.get()-min.get())/(max.get()-min.get())));
    result.set( x*x*(3 - 2*x) ); // smoothstep
}

min.set(0);
max.set(1);
number.set(0);

number.onValueChanged=exec;
max.onValueChanged=exec;
min.onValueChanged=exec;

exec();
