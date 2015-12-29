Op.apply(this, arguments);
var self=this;

this.name='sequence';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

this.triggers=[];

for(var i=0;i<10;i++)
{
    this.triggers.push( this.addOutPort(new Port(this,"trigger "+i,OP_PORT_TYPE_FUNCTION)) );
}

this.exe.onTriggered=function()
{
    for(var i=0;i<self.triggers.length;i++)
        self.triggers[i].trigger();
};
