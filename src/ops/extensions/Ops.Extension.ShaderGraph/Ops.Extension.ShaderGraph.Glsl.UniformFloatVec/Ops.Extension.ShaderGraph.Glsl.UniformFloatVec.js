const
    inType = op.inSwitch("Type", ["float", "vec2", "vec4"], "vec4"),
    inX = op.inFloat("X"),
    inY = op.inFloat("Y"),
    inZ = op.inFloat("Z"),
    inW = op.inFloat("W", 1),
    inName = op.inString("Name", "");

const outValue = op.outObject("value");

let uni = null;
let uniformBuffer;
const uniformArray = new Float32Array([0, 0, 0, 0]);
const defaultName = "unif" + CABLES.simpleId();

/* minimalcore:start */

inName.setUiAttribs({ "hidePort": true });
inX.setUiAttribs({ "colorPick": false });
inType.setUiAttribs({ "hidePort": true });
updateUi();

/* minimalcore:end */

inName.onChange =
    inType.onChange = () =>
    {
        updateUi();

        uni = null;
        op.shaderNode.name = op.shaderNode.resultVarName = inName.get() || defaultName;
    };

function updateUi()
{

    /* minimalcore:start */

    op.setUiAttrib({ "extendTitle": inType.get() + " " + inName.get() });

    inY.setUiAttribs({ "greyout": !inType.get().startsWith("vec") });
    inZ.setUiAttribs({ "greyout": inType.get() != "vec4" });
    inW.setUiAttribs({ "greyout": inType.get() != "vec4" });

    inX.setUiAttribs({ "colorPick": inType.get() == "vec4" });

    outValue.setUiAttribs({ "objType": "sg_" + inType.get() });

    /* minimalcore:end */
}

function update(shader, bindings)
{
    // const mgpu = op.patch.frameStore.mgpu;
    if (!uni)
    {

        const name = inName.get() || defaultName;
        // binding=new CGL.Uniform()

        let uniType = "f";
        if (inType.get() == "vec4") uniType = "4f";
        if (inType.get() == "vec3") uniType = "3f";
        if (inType.get() == "vec2") uniType = "2f";
        if (uniType == "f") uni = new CGL.Uniform(shader, uniType, name, inX); // why needed, bug in cgl_uniform
        else uni = new CGL.Uniform(shader, uniType, name, inX, inY, inZ, inW);

        op.shaderNode.srcUni = "uniform " + inType.get() + " " + name + ";";

        op.shaderNode.name = op.shaderNode.resultVarName = inName.get() || defaultName;
        op.shaderNode.results[0].type = inType.get();

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
        "results": [{ "type": "vec4", "port": outValue }],
        "resultVarName": inName.get() || defaultName
    });
