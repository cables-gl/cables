const
    v = op.inArray("Array In", ""),
    result = op.outArray("Array Out");

op.setUiAttribs({ "display": "reroute" });
v.onChange = exec;

v.onLinkChanged = () =>
{
    v.copyLinkedUiAttrib("stride", result);
};

function exec()
{
    result.setRef(v.get());
}
