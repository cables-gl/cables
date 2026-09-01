const
    inMat = op.inArray("Matrix"),
    inName = op.inString("Name", ""),
    outValue = op.outObject("value");

let uni = null;
let uniformBuffer;
let needInit = true;
const defaultName = "uMat" + CABLES.simpleId();

/* minimalcore:start */

inName.setUiAttribs({ "hidePort": true });
updateUi();

/* minimalcore:end */
inMat.onChange = () =>
{
    if (uni) uni.setValue(inMat.get());
};

inName.onChange = () =>
{
    updateUi();
    uni = null;
};

function updateUi()
{

    /* minimalcore:start */

    op.setUiAttrib({ "extendTitle": inName.get() });

    /* minimalcore:end */
}

function update(shader, bindings)
{
    const name = inName.get() || defaultName;

    if (!uni)
    {
        op.shaderNode.srcUni = "uniform " + "mat4" + " " + name + ";";
        op.shaderNode.name = op.shaderNode.resultVarName = inName.get() || defaultName;

        op.shaderNode.results[0].type = "mat4";
    }

    if (!uni && shader)
    {
        uni = new CGL.Uniform(shader, "m4", name);
        uni.setValue(inMat.get());
        op.updateGraph();
    }
}

new CABLES.ShaderGraphOp(this,
    {
        "type": "existingvar",
        "name": inName.get() || defaultName,
        "title": "name",
        "update": update,
        "params": [],
        "results": [{ "type": "mat4", "port": outValue }],
        "resultVarName": inName.get() || defaultName
    });
update();
