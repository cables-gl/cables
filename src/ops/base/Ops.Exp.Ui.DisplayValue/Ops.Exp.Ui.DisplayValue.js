const v = op.inValueFloat("value");
const result = op.outValue("result");

v.onChange = exec;

function exec()
{
    let title = "Value";

    if (v.isLinked())title = v.links[0].getOtherPort(v).name;

    op.setUiAttrib({ "extendTitle": String(v.get()), "title": String(title) });

    result.set(v.get());
}
