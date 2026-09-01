const
    inMat = op.inArray("Matrix"),
    inType = op.inSwitch("Type", ["float", "vec2", "vec4"], "float"),
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

inType.onChange =
    inName.onChange =
    () =>
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
        op.shaderNode.srcUni = "uniform " + "vec4[99]" + " " + name + ";";
        op.shaderNode.name = op.shaderNode.resultVarName = inName.get() || defaultName;
        op.shaderNode.results[0].type = "array";
    }

    if (!uni && shader)
    {
        let t = "f[]";
        if (inType.get() == "vec2") t = "2f[]";
        if (inType.get() == "vec3") t = "3f[]";
        if (inType.get() == "vec4") t = "4f[]";
        uni = new CGL.Uniform(shader, t, name);
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
        "results": [{ "type": "array", "port": outValue }],
        "resultVarName": inName.get() || defaultName
    });

update();
