const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inType = op.inSwitch("Type", ["float", "vec2", "vec4"], "float"),
    inX = op.inFloat("X"),
    inY = op.inFloat("Y"),
    inZ = op.inFloat("Z"),
    inW = op.inFloat("W", 1),
    next = op.outTrigger("Next");

let binding = null;
let uniformBuffer;
const uniformArray = new Float32Array([0, 0, 0, 0]);

/* minimalcore:start */
inX.setUiAttribs({ "colorPick": false });
updateUi();

/* minimalcore:end */

inName.onChange =
    inType.onChange =
    exec.onLinkChange = () =>
    {
        updateUi();
        binding = null;
    };

function updateUi()
{

    /* minimalcore:start */

    op.setUiAttrib({ "extendTitle": inType.get() + " " + inName.get() });

    inY.setUiAttribs({ "greyout": !inType.get().startsWith("vec") });
    inZ.setUiAttribs({ "greyout": inType.get() != "vec4" });
    inW.setUiAttribs({ "greyout": inType.get() != "vec4" });

    inX.setUiAttribs({ "colorPick": inType.get() == "vec4" });

    /* minimalcore:end */
}

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!binding)
    {

        const layout = {
            "visibility": mgpu.stage,
            "buffer":
            {
                "type": "uniform"
            }
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
            "header": "var<uniform> " + inName.get() + " : " + typestr + ";",
            "resource": { "buffer": uniformBuffer },
            "layout": layout
        };

        op.shaderNode.name = op.shaderNode.resultVarName = inName.get();
        op.shaderNode.result.type = inType.get();
        op.shaderNode.result.port.setRef({});

        mgpu.rebuildShaderModule = "new uniform binding: " + inName.get();
    }

    uniformArray[0] = inX.get();
    uniformArray[1] = inY.get();
    uniformArray[2] = inZ.get();
    uniformArray[3] = inW.get();

    mgpu.device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    mgpu.bindings.push(binding);

    next.trigger();
};

new CABLES.ShaderGraphOp(this,
    {
        "type": "existingvar",
        "name": "myfloat",
        "title": "name",
        "params": [],
        "result": { "type": "float", "port": op.outObject("value") },
        "resultVarName": "myfloat"
    });
