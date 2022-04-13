const
    inYear = op.inValueInt("Year"),
    inMonth = op.inValueInt("Month"),
    inDay = op.inValueInt("Day"),
    inHour = op.inValueInt("Hour"),
    inMinute = op.inValueInt("Minute"),
    outTimestamp = op.outNumber("Timestamp");

inYear.onChange =
inMonth.onChange =
inDay.onChange =
inHour.onChange =
inMinute.onChange = setDate;

function setDate()
{
    const d = new Date();

    const datum = new Date(Date.UTC(
        inYear.get(),
        inMonth.get() - 1,
        inDay.get(),
        inHour.get(),
        inMinute.get()
    ) + d.getTimezoneOffset() * 60 * 1000);

    outTimestamp.set(datum.getTime());
}
