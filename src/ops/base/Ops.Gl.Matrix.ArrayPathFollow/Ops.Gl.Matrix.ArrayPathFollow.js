const exe = op.inTrigger("exe");
const arrayIn = op.inArray("array");
const time = op.inValueFloat("time");

const duration = op.inValueFloat("duration");
duration.set(0.1);

const offset = op.inValueFloat("offset");
offset.set(0.0);

const lookAhead = op.inValueFloat("look ahead");
lookAhead.set(3.0);

const trigger = op.outTrigger("trigger");
const triggerLookat = op.outTrigger("transform lookat");
const idx = op.addOutPort(new CABLES.Port(op, "index"));

const vec = vec3.create();
const vecn = vec3.create();
const cgl = op.patch.cgl;

const startTime = CABLES.now();

let animX = new CABLES.Anim();
let animY = new CABLES.Anim();
let animZ = new CABLES.Anim();

let animQX = new CABLES.Anim();
let animQY = new CABLES.Anim();
let animQZ = new CABLES.Anim();
let animQW = new CABLES.Anim();

let animLength = 0;
let timeStep = 0.1;
function setup()
{
    animX = new CABLES.Anim();
    animY = new CABLES.Anim();
    animZ = new CABLES.Anim();

    animQX = new CABLES.Anim();
    animQY = new CABLES.Anim();
    animQZ = new CABLES.Anim();
    animQW = new CABLES.Anim();

    let i = 0;
    const arr = arrayIn.get();
    if (!arr) return;
    timeStep = parseFloat(duration.get());

    for (i = 0; i < arr.length; i += 3)
    {
        animX.setValue(i / 3 * timeStep, arr[i + 0]);
        animY.setValue(i / 3 * timeStep, arr[i + 1]);
        animZ.setValue(i / 3 * timeStep, arr[i + 2]);
        animLength = i / 3 * timeStep;
    }

    for (i = 0; i < arr.length / 3; i++)
    {
        const t = i * timeStep;
        const nt = (i * timeStep + timeStep) % animLength;

        vec3.set(vec,
            animX.getValue(t),
            animY.getValue(t),
            animZ.getValue(t)
        );
        vec3.set(vecn,
            animX.getValue(nt),
            animY.getValue(nt),
            animZ.getValue(nt)
        );

        vec3.set(vec, vecn[0] - vec[0], vecn[1] - vec[1], vecn[2] - vec[2]);
        vec3.normalize(vec, vec);
        vec3.set(vecn, 0, 0, 1);

        quat.rotationTo(q, vecn, vec);

        animQX.setValue(i * timeStep, q[0]);
        animQY.setValue(i * timeStep, q[1]);
        animQZ.setValue(i * timeStep, q[2]);
        animQW.setValue(i * timeStep, q[3]);
    }
}

arrayIn.onChange = duration.onChange = setup;

let q = quat.create();
const qMat = mat4.create();

function render()
{
    if (!arrayIn.get()) return;

    const t = (time.get() + parseFloat(offset.get())) % animLength;
    const nt = (time.get() + timeStep * lookAhead.get() + parseFloat(offset.get())) % animLength;

    vec3.set(vec,
        animX.getValue(t),
        animY.getValue(t),
        animZ.getValue(t)
    );

    idx.set(nt);

    if (triggerLookat.isLinked())
    {
        vec3.set(vecn,
            animX.getValue(nt),
            animY.getValue(nt),
            animZ.getValue(nt)
        );

        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix, cgl.mMatrix, vecn);
        triggerLookat.trigger();
        cgl.popModelMatrix();
    }

    cgl.pushModelMatrix();
    mat4.translate(cgl.mMatrix, cgl.mMatrix, vec);

    CABLES.Anim.slerpQuaternion(t, q, animQX, animQY, animQZ, animQW);
    mat4.fromQuat(qMat, q);
    mat4.multiply(cgl.mMatrix, cgl.mMatrix, qMat);

    trigger.trigger();
    cgl.popModelMatrix();
}

exe.onTriggered = render;
