this.name='Repeat 2d';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var numx=this.addInPort(new Port(this,"num x"));
var numy=this.addInPort(new Port(this,"num y"));
var mul=this.addInPort(new Port(this,"mul"));
mul.set(1);
numx.set(5);
numy.set(5);

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var idxx=this.addOutPort(new Port(this,"x"));
var idxy=this.addOutPort(new Port(this,"y"));
var idx=this.addOutPort(new Port(this,"index"));

exe.onTriggered=function()
{
    var m=mul.get();
    for(var y=numy.get()-1;y>-1;y--)
    {
        idxy.set(y*m);
        for(var x=numx.get()-1;x>-1;x--)
        {
            idxx.set(x*m);
            idx.set(x+y*numx.get());
            trigger.trigger();
        }
    }
};
