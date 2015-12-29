Op.apply(this, arguments);
var self=this;

this.name='CallsPerSecond';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.cps=this.addOutPort(new Port(this,"cps",OP_PORT_TYPE_VALUE));

this.timeStart=0;
this.cpsCount=0;

this.exe.onTriggered=function()
{
    if(self.timeStart===0)self.timeStart=Date.now();
    var now = Date.now();

    if(now-self.timeStart>1000)
    {
        self.timeStart=Date.now();
        self.cps.set(self.cpsCount);
        self.cpsCount=0;
    }

    self.cpsCount++;
};