const
    render = op.inTrigger("render"),
    duration = op.inFloat("Duration ", 10),
    offset = op.inValueFloat("offset"),
    inTime = op.inValue("Time", 0),
    segments = op.inValueInt("segments", 40),
    radius = op.inValueFloat("radius", 1),
    mulX = op.inValueFloat("mulX", 1),
    mulY = op.inValueFloat("mulY", 1),
    // percent=op.inValueSlider("percent"),
    trigger = op.outTrigger("trigger"),
    index = op.outValue("index"),
    outX = op.outValue("X"),
    outY = op.outValue("Y");

op.setPortGroup("Time", [duration, offset, inTime]);

const cgl = op.patch.cgl;
const animX = new CABLES.Anim();
const animY = new CABLES.Anim();
const pos = [];
animX.loop = true;
animY.loop = true;

segments.onChange = calc;

calc();

render.onTriggered = function ()
{
    cgl.pushModelMatrix();

    let time = inTime.get() / duration.get();// +Math.round(segments.get())*0.1*percent.get();

    time += offset.get();

    let x = animX.getValue(time) * mulX.get() * radius.get();
    let y = animY.getValue(time) * mulY.get() * radius.get();

    outX.set(x);
    outY.set(y);

    mat4.translate(cgl.mMatrix, cgl.mMatrix, [x, y, 0]);

    trigger.trigger();

    cgl.popModelMatrix();
};

function calc()
{
    pos.length = 0;
    let i = 0, degInRad = 0;
    animX.clear();
    animY.clear();

    for (i = 0; i <= Math.round(segments.get()); i++)
    {
        index.set(i);
        degInRad = (360 / Math.round(segments.get())) * i * CGL.DEG2RAD;
        animX.setValue(i / segments.get(), Math.cos(degInRad));
        animY.setValue(i / segments.get(), Math.sin(degInRad));
    }
}
