const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inType = op.inSwitch("Type", ["f32", "vec2f", "vec4f"], "f32"),
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

        binding = null;
    };

function updateUi()
{

    /* minimalcore:start */

    op.setUiAttrib({ "extendTitle": inType.get() + " " + inName.get() });

    inY.setUiAttribs({ "greyout": !inType.get().startsWith("vec") });
    inZ.setUiAttribs({ "greyout": inType.get() != "vec4f" });
    inW.setUiAttribs({ "greyout": inType.get() != "vec4f" });

    inX.setUiAttribs({ "colorPick": inType.get() == "vec4f" });

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

        binding = {
            "header": "var<uniform> " + inName.get() + " : " + inType.get() + ";",
            "resource": { "buffer": uniformBuffer },
            "layout": layout
        };

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
