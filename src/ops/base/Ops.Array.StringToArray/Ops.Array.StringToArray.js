const
    text = op.inStringEditor("text", "1,2,3"),
    separator = op.inValueString("separator", ","),
    toNumber = op.inValueBool("Numbers", true),
    parsed = op.outTrigger("Parsed"),
    arr = op.outArray("array"),
    len = op.outNumber("length");

text.onChange =
    separator.onChange =
    toNumber.onChange = parse;

parse();

function parse()
{
    if (!text.get()) return;

    let r = text.get().split(separator.get());
    len.set(r.length);

    if (toNumber.get())
        for (let i = 0; i < r.length; i++)
            r[i] = Number(r[i]);

    arr.setRef(r);
    parsed.trigger();
}
