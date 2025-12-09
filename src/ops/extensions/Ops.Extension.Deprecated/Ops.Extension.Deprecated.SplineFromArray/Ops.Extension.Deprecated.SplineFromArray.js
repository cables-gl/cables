let render = op.inTrigger("render");
let inIndex = op.inValue("index");
let inPoints = op.inArray("points");
let dimensions = op.inValueSelect("Dimensions", ["1", "3"], 3);
let trigger = op.addOutPort(new CABLES.Port(op, "Next", CABLES.OP_PORT_TYPE_FUNCTION));

let cgl = op.patch.cgl;
let splines = [];

let Spline = function ()
{
    this.mesh = null;
    this.points = [];
    this.geom = new CGL.Geometry("splinefromarray");
    this.oldLength = 0;
};

inPoints.onChange = function ()
{
    let indx = Math.floor(inIndex.get());
    let pointArr = inPoints.get();
    if (!pointArr) return;
    if (indx < 0) return;

    if (!splines[indx])
    {
        splines[indx] = new Spline();
    }
    bufferData(splines[indx], pointArr);
};

render.onTriggered = function ()
{
    let indx = Math.floor(inIndex.get());
    if (indx >= splines.length) return;
    if (!splines[indx] || !splines[indx].mesh) return;
    let shader = cgl.getShader();
    if (!shader) return;
    cgl.pushModelMatrix();
    let oldPrim = shader.glPrimitive;
    shader.glPrimitive = cgl.gl.LINE_STRIP;
    // shader.glPrimitive=cgl.gl.POINTS;
    // cgl.gl.lineWidth(14);

    // for(var i=0;i<splines.length;i++)

    if (inPoints.get() && inPoints.get().length > 0)
        splines[indx].mesh.render(shader);

    shader.glPrimitive = oldPrim;

    cgl.popModelMatrix();

    trigger.trigger();
};

let dataBuffer = new Float32Array();

function bufferData(spline, pointArr)
{
    if (!pointArr || pointArr.length == 0) return;
    if (!spline.geom)
    {
        spline.geom = new CGL.Geometry("splinefromarray");
        // spline.geom.setPointVertices(pointArr);
    }
    if (!spline.mesh)
    {
        spline.mesh = new CGL.Mesh(cgl, spline.geom);
    }

    if (dimensions.get() == 3)
    {
        spline.geom.vertices = pointArr;
    }
    else
    if (dimensions.get() == 1)
    {
        if (Math.floor(pointArr.length) * 3 != dataBuffer.length)
        {
            dataBuffer = new Float32Array(Math.floor(pointArr.length * 3));
            for (var i = 0; i < dataBuffer.length; i += 3)
            {
                dataBuffer[i + 0] = i;
                dataBuffer[i + 1] = 0;
                dataBuffer[i + 2] = 0;
            }
        }

        for (var i = 0; i < dataBuffer.length; i += 3)
        {
            dataBuffer[i + 1] = pointArr[i];
        }

        spline.geom.vertices = dataBuffer;
    }
    spline.mesh.updateVertices(spline.geom);
}
