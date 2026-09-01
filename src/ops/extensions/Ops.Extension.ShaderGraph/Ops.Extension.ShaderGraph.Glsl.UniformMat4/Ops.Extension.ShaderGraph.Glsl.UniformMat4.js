const
    inMat = op.inArray("Matrix"),

    inName = op.inString("Name", "");

const outValue = op.outObject("value");

let uni = null;
let uniformBuffer;
const defaultName = "unif" + CABLES.simpleId();

/* minimalcore:start */

inName.setUiAttribs({ "hidePort": true });
updateUi();

/* minimalcore:end */
inMat.onChange = () =>
{
    // console.log("11",uni);
    if (uni) uni.setValue(inMat.get());
};

inName.onChange =
    () =>
    {
        updateUi();

        uni = null;
        op.shaderNode.name = op.shaderNode.resultVarName = inName.get() || defaultName;
    };

function updateUi()
{

    /* minimalcore:start */

    op.setUiAttrib({ "extendTitle": inName.get() });

    /* minimalcore:end */
}

function update(shader, bindings)
{
    // const mgpu = op.patch.frameStore.mgpu;
    if (!uni)
    {

        const name = inName.get() || defaultName;
        uni = new CGL.Uniform(shader, "m4", name);

        op.shaderNode.srcUni = "uniform " + "mat4" + " " + name + ";";

        op.shaderNode.name = op.shaderNode.resultVarName = inName.get() || defaultName;
        op.shaderNode.results[0].type = "texture";

        op.updateGraph();
    }
    // if (uni && inMat.get()) shader.pushTexture(uni, inMat.get().tex);

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
