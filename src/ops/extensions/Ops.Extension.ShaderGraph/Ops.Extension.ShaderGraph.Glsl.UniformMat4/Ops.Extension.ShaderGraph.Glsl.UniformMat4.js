const
    inMat = op.inArray("Matrix"),
    inName = op.inString("Name", ""),
    outValue = op.outObject("value");

let uni = null;
let uniformBuffer;
let needInit = true;
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

    // const mgpu = op.patch.frameStore.mgpu;
    if (!uni && shader)
    {

        uni = new CGL.Uniform(shader, "m4", name);

        uni.setValue(inMat.get());

        console.log("namiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiie", op.shaderNode.srcUni);
        // op.shaderNode.srcUni = "uniform " + "mat4" + " " + name + ";";

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
update();
