const
    v = op.inFloat("value"),
    result = op.outNumber("result");

v.onChange = exec;

let wasLinked = false;

op.setUiAttribs({ "display": "reroute" });

function exec()
{
    result.set(v.get());
}
