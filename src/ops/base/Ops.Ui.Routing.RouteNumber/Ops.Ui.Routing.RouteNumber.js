const
    v = op.inFloat("value"),
    result = op.outNumber("result");

v.onChange = exec;

let wasLinked = false;

/* minimalcore:start */
op.setUiAttribs({ "display": "reroute" });

/* minimalcore:end */

function exec()
{
    result.set(v.get());
}
