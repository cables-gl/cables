const
    v = op.inValueFloat("value"),
    result = op.outNumber("result");

v.onChange = exec;

let wasLinked = false;

op.setUiAttribs({ "display": "reroute" });

function exec()
{
    result.set(v.get());
}

v.onLinkChanged =
result.onLinkChanged = () =>
{
//     if(!wasLinked) wasLinked=v.isLinked() && result.isLinked();
//     if(wasLinked && (!v.isLinked() || !result.isLinked())) op.patch.deleteOp(op.id);
// console.log("waslinked",wasLinked)
};
