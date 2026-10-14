const
    render = op.inTrigger("render"),
    duration = op.inFloat("Duration ", 10),
    offset = op.inFloat("offset"),
    inTime = op.inFloat("Time", 0),
    segments = op.inInt("segments", 40),
    radius = op.inFloat("radius", 1),
    mulX = op.inFloat("mulX", 1),
    mulY = op.inFloat("mulY", 1),
    // percent=op.inFloatSlider("percent"),
    trigger = op.outTrigger("trigger"),
    index = op.outNumber("index"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y");

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
