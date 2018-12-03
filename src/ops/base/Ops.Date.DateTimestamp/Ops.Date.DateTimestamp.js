const
    inYear=op.inValueInt("Year"),
    inMonth=op.inValueInt("Month"),
    inDay=op.inValueInt("Day"),
    inHour=op.inValueInt("Hour"),
    inMinute=op.inValueInt("Minute");

inYear.onChange=
inMonth.onChange=
inDay.onChange=
inHour.onChange=
inMinute.onChange=setDate;

var outTimestamp=op.outValue("Timestamp");

function setDate()
{
    var d=new Date();

    var datum = new Date(Date.UTC(
        inYear.get(),
        inMonth.get()-1,
        inDay.get(),
        inHour.get(),
        inMinute.get()
        )+d.getTimezoneOffset()*60*1000);

    // console.log(datum);
    outTimestamp.set(datum.getTime());
}


