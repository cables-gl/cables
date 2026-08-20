const
    v = op.inFloat("value"),
    result = op.outNumber("result");

v.onChange = exec;

let isLinked = false;
v.onLinkChanged = () =>
{

    /* minimalcore:start */
    if (!isLinked && v.isLinked()) op.setUiAttribs({ "extendTitle": null });

    /* minimalcore:end */

    isLinked = v.isLinked();
};

function exec()
{

    /* minimalcore:start */
    if (CABLES.UI && !isLinked) op.setUiAttribs({ "extendTitle": Math.round(10000 * v.get()) / 10000 });

    /* minimalcore:end */

    result.set(Number(v.get()));
}
