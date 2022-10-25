const
    inTimestamp = op.inValue("timestamp"),
    inDiff = op.inInt("difference"),
    diffType = op.inDropDown("type", ["years", "months", "days", "hours", "minutes", "seconds"]),
    inTrigger = op.inTrigger("update"),

    outDate = op.outObject("Date"),
    outResult = op.outNumber("Timestamp");

inTimestamp.onChange =
    inDiff.onChange =
    diffType.onChange =
    inTrigger.onChange = update;

function update()
{
    let ts = inTimestamp.get();
    if (!inTimestamp.isLinked())
    {
        ts = Date.now();
    }
    const diff = inDiff.get();
    const date = new Date(ts);
    switch (diffType.get())
    {
    case "years":
        date.setYear(date.getYear() + diff);
        break;
    case "months":
        date.setMonth(date.getMonth() + diff);
        break;
    case "days":
        date.setDate(date.getDate() + diff);
        break;
    case "hours":
        date.setHours(date.getHours() + diff);
        break;
    case "minutes":
        date.setMinutes(date.getMinutes() + diff);
        break;
    case "seconds":
        date.setSeconds(date.getSeconds() + diff);
        break;

    default:
            // code
    }
    outResult.set(date.getTime());
    outDate.set(date);
}
