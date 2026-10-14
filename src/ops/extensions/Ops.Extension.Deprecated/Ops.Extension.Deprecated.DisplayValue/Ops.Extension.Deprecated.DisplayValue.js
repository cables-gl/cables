const v = op.inFloat("value");
const result = op.outNumber("result");

v.onChange = exec;

function exec()
{
    let title = "Value";

    if (v.isLinked())title = v.links[0].getOtherPort(v).name;

    op.setUiAttrib({ "extendTitle": String(v.get()), "title": String(title) });

    result.set(v.get());
}
