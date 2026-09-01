const
    inTexture = op.inTexture("texture"),
    inName = op.inString("Name", ""),
    outValue = op.outObject("value");

let uni = null;
let uniformBuffer;
const defaultName = "unif" + CABLES.simpleId();

/* minimalcore:start */

inName.setUiAttribs({ "hidePort": true });
updateUi();

/* minimalcore:end */
// inTexture.onChange = () =>
// {
//     if (uni) uni.setTex;
// };

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
    const name = inName.get() || defaultName;
    if (!uni)
    {

        op.shaderNode.srcUni = "uniform " + "sampler2D" + " " + name + ";";
        op.shaderNode.name = op.shaderNode.resultVarName = inName.get() || defaultName;
        op.shaderNode.results[0].type = "texture";
    }

    if (!uni && shader)
    {
        uni = new CGL.Uniform(shader, "t", name);

        if (shader && uni && inTexture.get())
        {
            shader.pushTexture(uni, inTexture.get().tex);
        }

        op.updateGraph();
    }
    if (uni && inTexture.get()) shader.pushTexture(uni, inTexture.get().tex);
    else console.log("not possible to push texture");

}

new CABLES.ShaderGraphOp(this,
    {
        "type": "existingvar",
        "name": inName.get() || defaultName,
        "update": update,
        "params": [],
        "results": [{ "type": "texture", "port": outValue }],
        "resultVarName": inName.get() || defaultName
    });
update();
