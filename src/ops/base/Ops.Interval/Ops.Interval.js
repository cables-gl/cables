op.name='Interval';

var interval=op.addInPort(new Port(op,"interval"));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

interval.set(1000);
var timeOutId=-1;

exec=function()
{
    if(timeOutId!=-1)return;

    timeOutId=setTimeout(function()
    {
        timeOutId=-1;
        trigger.trigger();
        exec();
    },
    interval.get() );
};

exec();