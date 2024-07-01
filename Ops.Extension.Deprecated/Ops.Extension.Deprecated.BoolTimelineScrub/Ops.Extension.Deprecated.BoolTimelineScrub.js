let exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
let state = op.addInPort(new CABLES.Port(op, "state", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
let v = op.addInPort(new CABLES.Port(op, "anim value", CABLES.OP_PORT_TYPE_VALUE));

let result = op.addOutPort(new CABLES.Port(op, "result"));
let outTime = op.addOutPort(new CABLES.Port(op, "time", CABLES.OP_PORT_TYPE_VALUE));
let outPerc = op.addOutPort(new CABLES.Port(op, "Percentage", CABLES.OP_PORT_TYPE_VALUE));

let animTime = new CABLES.Anim();

let lastState = true;
let firstState = true;

let toggle = function ()
{
    if ((state.get() != lastState && v.anim))
    {
        let l = v.anim.getLength();
        let t = Date.now() / 1000;
        lastState = state.get();
        let valueNow = animTime.getValue(t);
        animTime.clear();

        animTime.setValue(t, valueNow);

        if (state.get()) animTime.setValue(t + l, l);
        else animTime.setValue(t + l, 0);
    }
};

let exec = function ()
{
    let va = 0;

    if (CABLES.UI)
    {
        if (!v.isAnimated())
        {
            op.uiAttr({ "error": "anim value should be animated" });
            return;
        }
        else
        {
            op.uiAttr({ "error": null });
        }
    }

    let t = Date.now() / 1000;
    va = v.anim.getValue(animTime.getValue(t));

    if (animTime.keys.length >= 1)
    {
        let perc = (t - animTime.keys[0].time) / (animTime.keys[1].time - animTime.keys[0].time);
        if (perc > 1)perc = 1;
        if (!state.get())perc = 1 - perc;
        outPerc.set(perc);
    }

    if (result.get() != va) result.set(va);
};

exe.onTriggered = exec;
state.onChange = toggle;
