let render = op.inTrigger("render");
let segments = op.inValueInt("segments", 40);
let radius = op.inValueFloat("radius", 1);
let mulX = op.inValueFloat("mulX", 1);
let mulY = op.inValueFloat("mulY", 1);
let percent = op.inValueSlider("percent");
let offset = op.inValueFloat("offset");
let trigger = op.outTrigger("trigger");
let index = op.outValue("index");
let outX = op.outValue("X");
let outY = op.outValue("Y");
let speed = op.inValue("speed", 1);

let startTime = CABLES.now() / 1000;
let cgl = op.patch.cgl;
let animX = new CABLES.Anim();
let animY = new CABLES.Anim();
let pos = [];
animX.loop = true;
animY.loop = true;

segments.onChange = calc;

calc();

render.onTriggered = function ()
{
    cgl.pushModelMatrix();

    let time = (CABLES.now() / 1000 - startTime) * speed.get() + Math.round(segments.get()) * 0.1 * percent.get();

    let x = animX.getValue(time + offset.get()) * mulX.get() * radius.get();
    let y = animY.getValue(time + offset.get()) * mulY.get() * radius.get();

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
        animX.setValue(i * 0.1, Math.cos(degInRad));
        animY.setValue(i * 0.1, Math.sin(degInRad));
    }
}
