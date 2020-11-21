// DateCalc

const inTimestamp = op.inValue("timestamp");
const inDiff = op.inInt("difference");
const diffType = op.inDropDown("type", ["years", "months", "days", "hours", "minutes", "seconds"]);
const inTrigger = op.inTrigger("update");

const outDate = op.outObject("Date");
const outResult = op.outValue("Timestamp");
inTimestamp.onChange = update;
inDiff.onChange = update;
diffType.onChange = update;
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
