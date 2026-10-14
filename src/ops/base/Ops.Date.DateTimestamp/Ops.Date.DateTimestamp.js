const
    inYear = op.inInt("Year"),
    inMonth = op.inInt("Month"),
    inDay = op.inInt("Day"),
    inHour = op.inInt("Hour"),
    inMinute = op.inInt("Minute"),
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
