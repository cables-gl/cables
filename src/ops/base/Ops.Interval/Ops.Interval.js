Op.apply(this, arguments);

this.name='Interval';
this.timeOutId=-1;
this.interval=this.addInPort(new Port(this,"interval"));
this.interval.val=1000;
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.exec=function()
{
    if(this.timeOutId!=-1)return;
    var self=this;

    this.timeOutId=setTimeout(function()
    {
        self.timeOutId=-1;
        self.trigger.trigger();
        self.exec();
    },
    this.interval.val );
};

this.exec();