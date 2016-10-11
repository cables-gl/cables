op.name='Interval';

var interval=op.inValue('interval');
var trigger=op.outFunction('trigger');

interval.set(1000);
var timeOutId=-1;

function exec()
{
    if(timeOutId!=-1)return;

    timeOutId=setTimeout(function()
    {
        timeOutId=-1;
        trigger.trigger();
        exec();
    },
    interval.get() );
}

interval.onValueChanged=exec;

exec();