const
    ts1 = op.inValue("Timestamp 1"),
    ts2 = op.inValue("Timestamp 2"),
    stopAtZero = op.inValueBool("Stop at 0"),
    outYear = op.outNumber("Year"),
    outMonth = op.outNumber("Month"),
    outDay = op.outNumber("Day"),
    outHours = op.outNumber("Hours"),
    outMinutes = op.outNumber("Minutes"),
    outSeconds = op.outNumber("Seconds"),
    outMilliSeconds = op.outNumber("Milliseconds"),
    outDiff = op.outNumber("Diff");

ts1.onChange = update;
ts2.onChange = update;

function update()
{
    let d = new Date(ts1.get() - ts2.get());
    outDiff.set(d.getTime());
    if (stopAtZero.get())
    {
        if (d.getTime() < 0)d = new Date(0);
    }

    outMilliSeconds.set(d.getMilliseconds());
    outSeconds.set(d.getSeconds());
    outMinutes.set(d.getMinutes());
    outHours.set(d.getHours() - 1);
    outDay.set(d.getDate() - 1);
    outMonth.set(d.getMonth());
    outYear.set(d.getFullYear() - 1970);
}
