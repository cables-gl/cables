const
    inTs = op.inFloat("Timestamp"),
    result = op.outString("ISO Date");

inTs.onChange = () =>
{
    const d = new Date(inTs.get()).toISOString();
    result.set(d);
};
