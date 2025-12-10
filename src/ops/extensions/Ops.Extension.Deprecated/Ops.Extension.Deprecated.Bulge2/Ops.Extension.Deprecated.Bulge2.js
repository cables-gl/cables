let render = op.inTrigger("render");
let trigger = op.outTrigger("Trigger");
let amount = op.inValue("Amount", 300);
let height = op.inValue("Height", 2);
let inArr = op.inArray("Spline");

let uniAmount = null, uniHeight = null, uniPoints = null;
let cgl = op.patch.cgl;
let shader = null;
let mod = null;

let pointArray = new Float32Array(99);
let updateUniformPoints = false;

inArr.onChange = function ()
{
    updateUniformPoints = true;

    var arr = inArr.get();
    if (arr)
    {
        pointArray = arr.slice(0);
        var arr = [];
        let min = 999999, max = -999999;
        for (var i = 0; i < pointArray.length; i += 3)
        {
            min = Math.min(min, pointArray[i + 1]);
            max = Math.max(max, pointArray[i + 1]);
        }

        let d = Math.abs(min + max);

        for (var i = 0; i < pointArray.length; i += 3)
        {
            pointArray[i + 1] /= d;
            pointArray[i + 1] = Math.abs(pointArray[i + 1]);
        }
    }
};

function removeModule()
{
    if (shader && mod)
    {
        shader.removeModule(mod);
        shader = null;
    }
}

render.onLinkChanged = removeModule;
render.onTriggered = function ()
{
    if (cgl.getShader() != shader)
    {
        if (shader) removeModule();
        shader = cgl.getShader();
        mod = shader.addModule(
            {
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": attachments.bulge_head_vert || "",
                "srcBodyVert": attachments.bulge_vert || ""
            });

        uniAmount = new CGL.Uniform(shader, "f", mod.prefix + "amount", amount);
        uniHeight = new CGL.Uniform(shader, "f", mod.prefix + "height", height);
        uniPoints = new CGL.Uniform(shader, "3f[]", mod.prefix + "points", new Float32Array([0, 0, 0]));
        shader.define("NUM_BULGE_POINTS", Math.floor(1));
    }

    if (updateUniformPoints && uniPoints && pointArray)
    {
        // if(!shader.hasDefine("PATHFOLLOW_POINTS"))shader.define('PATHFOLLOW_POINTS',pointArray.length/3);
        if (shader.getDefine("NUM_BULGE_POINTS") < Math.floor(pointArray.length / 3))
        {
            console.log(shader.getDefine("NUM_BULGE_POINTS"));
            shader.define("NUM_BULGE_POINTS", Math.floor(pointArray.length / 3));
        }

        uniPoints.setValue(pointArray); // todo: better as float32 array !!
        updateUniformPoints = false;
    }
    trigger.trigger();
};
