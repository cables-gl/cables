const
    v = op.inString("value", ""),
    result = op.outString("String");

v.onChange = exec;

let wasLinked = false;

op.setUiAttribs({ "display": "reroute" });

function exec()
{
    result.set(v.get());
}
