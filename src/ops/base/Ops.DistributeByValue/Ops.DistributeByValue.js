this.name='distribute by value';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

var number=this.addInPort(new Port(this,"number"));
number.set(0);

var max=this.addInPort(new Port(this,"max"));
max.set(1);

var numOut=this.addInPort(new Port(this,"num outputs"));
numOut.set(2);

var num=this.addInPort(new Port(this,"num",OP_PORT_TYPE_VALUE));
num.set(0);

var triggers=[];
var numTriggers=10;

var trigger=function()
{
    var s=parseFloat(parseFloat(max.get()))/parseFloat(numOut.get());
    var index=Math.floor(parseFloat(number.get())/s);
    
    num.set(index);
    
    // console.log(index);
    if(!isNaN(index) && index<numTriggers)
    {
        triggers[index].trigger();
        
    }
    // for(var i=0;i<triggers.length;i++) triggers[i].trigger();
};

exe.onTriggered=trigger;


for(var i=0;i<numTriggers;i++)
{
    triggers.push( this.addOutPort(new Port(this,"trigger "+i,OP_PORT_TYPE_FUNCTION)) );
    

    
}
