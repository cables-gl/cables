const
    inType = op.inSwitch("Type", ["float", "vec2", "vec4"], "float"),
    inX = op.inFloat("X"),
    inY = op.inFloat("Y"),
    inZ = op.inFloat("Z"),
    inW = op.inFloat("W", 1),
    inName = op.inString("Name", "");

const outValue = op.outObject("value");

let binding = null;
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
        binding = null;
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

function update(mgpu, bindings)
{
    // const mgpu = op.patch.frameStore.mgpu;
    if (!binding)
    {

        const layout = {
            "visibility": mgpu.stage,
            "buffer": { "type": "uniform" }
        };
        uniformBuffer = mgpu.device.createBuffer(
            {
                "size": uniformArray.byteLength,
                "usage": GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });

        let typestr = inType.get();
        if (typestr.startsWith("vec")) typestr += "f";
        else typestr = "f32";
        binding = {
            "header": "var<uniform> " + (inName.get() || defaultName) + " : " + typestr + ";",
            "resource": { "buffer": uniformBuffer },
            "layout": layout
        };

        op.shaderNode.name = op.shaderNode.resultVarName = inName.get() || defaultName;
        op.shaderNode.results[0].type = inType.get();
        op.updateGraph();

        mgpu.rebuildShaderModule = "new uniform binding: " + inName.get();
    }

    uniformArray[0] = inX.get();
    uniformArray[1] = inY.get();
    uniformArray[2] = inZ.get();
    uniformArray[3] = inW.get();

    mgpu.device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    if (binding) bindings.push(binding);
}

new CABLES.ShaderGraphOp(this,
    {
        "type": "existingvar",
        "name": inName.get() || defaultName,
        "title": "name",
        "update": update,
        "params": [],
        "results": [{ "type": "float", "port": outValue }],
        "resultVarName": inName.get() || defaultName
    });
