const
    v = op.inObject("Array In", ""),
    result = op.outObject("Array Out");

op.setUiAttribs({ "display": "reroute" });
v.onChange = exec;

result.onLinkChanged =
v.onLinkChanged = () =>
{
    v.copyLinkedUiAttrib("objType", result);
};

function exec()
{
    result.setRef(v.get());
}
