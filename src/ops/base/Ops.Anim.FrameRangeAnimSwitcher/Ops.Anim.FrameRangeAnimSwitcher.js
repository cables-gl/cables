const
    idx = op.inValueInt("Index"),
    inDur = op.inValue("Duration", 0.5),
    resultTime1 = op.outNumber("Time 1"),
    resultFade = op.outNumber("Time Fade"),
    resultTime2 = op.outNumber("Time 2");

let anim = new CABLES.Anim();
anim.createPort(op, "easing");

let startTime = 0;
let valuePorts = [];
let oldIdx = -1;

idx.onChange = setIndex;

for (let i = 0; i < 10; i++)
{
    let p = op.inValue("Value " + i);
    valuePorts.push(p);
    p.onChange = update;
}

setIndex();

function update()
{
    if (!valuePorts[oldIdx]) return;
    if (!valuePorts[idx.get()]) return;

    resultTime1.set(valuePorts[oldIdx].get());
    resultTime2.set(valuePorts[idx.get()].get());
    let fade = anim.getValue(CABLES.now() / 1000);
    resultFade.set(fade);
}

function setIndex()
{
    let now = (CABLES.now()) / 1000;
    let startTime = now;
    anim.clear();

    if (oldIdx == -1)oldIdx = idx.get();

    anim.setValue(now, 0);
    anim.setValue(now + inDur.get(), 1,
        function ()
        {
            oldIdx = idx.get();
            let now = (CABLES.now()) / 1000;
            anim.setValue(now, 0);
        });
    update();
}
