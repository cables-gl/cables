const
    inTexture = op.inTexture("texture"),

    inName = op.inString("Name", "");

const outValue = op.outObject("value");

let uni = null;
let uniformBuffer;
const defaultName = "unif" + CABLES.simpleId();

/* minimalcore:start */

inName.setUiAttribs({ "hidePort": true });
updateUi();

/* minimalcore:end */
inTexture.onChange = () =>
{
    if (uni) uni.setTex;
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

    outValue.setUiAttribs({ "objType": "sg_texture" });

    /* minimalcore:end */
}

function update(shader, bindings)
{
    // const mgpu = op.patch.frameStore.mgpu;
    if (!uni)
    {

        const name = inName.get() || defaultName;
        uni = new CGL.Uniform(shader, "t", name);

        op.shaderNode.srcUni = "uniform " + "sampler2D" + " " + name + ";";

        op.shaderNode.name = op.shaderNode.resultVarName = inName.get() || defaultName;
        op.shaderNode.results[0].type = "texture";

        op.updateGraph();
    }
    if (uni && inTexture.get()) shader.pushTexture(uni, inTexture.get().tex);

}

new CABLES.ShaderGraphOp(this,
    {
        "type": "existingvar",
        "name": inName.get() || defaultName,
        "title": "name",
        "update": update,
        "params": [],
        "results": [{ "type": "vec4", "port": outValue }],
        "resultVarName": inName.get() || defaultName
    });
