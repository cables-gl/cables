const inTimestamp = op.inValue("Timestamp");
const inDate = op.inObject("Date");
const inFormat = op.inString("Format", "YYYY-MM-DD");
const outString = op.outString("StringDate");

inTimestamp.onChange = function ()
{
    const ts = inTimestamp.get();
    update(new Date(ts));
};
inDate.onChange = function ()
{
    const date = inDate.get();
    update(date);
};
inFormat.onChange = function ()
{
    update(new Date());
};

function update(date)
{
    const m = moment(date);
    const f = inFormat.get();
    outString.set(m.format(f));
}
