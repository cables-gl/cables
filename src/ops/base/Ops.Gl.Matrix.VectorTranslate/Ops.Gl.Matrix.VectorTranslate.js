const exec = op.inTrigger("Exec");
const speed = op.inValue("Speed");
const vecX = op.inValue("Vector X");
const vecY = op.inValue("Vector Y");
const vecZ = op.inValue("Vector Z");
const resetVecX = op.inFloat("Reset Position X");
const resetVecY = op.inFloat("Reset Position Y");
const resetVecZ = op.inFloat("Reset Position Z");
const next = op.outTrigger("Next");

const reset = op.inTriggerButton("reset");

const max = op.inValue("max");

const cgl = op.patch.cgl;

const vec = vec3.create();
const pos = vec3.create();
const mat = mat4.create();

let lastTime = 0;
let timeDiff = 0;

reset.onTriggered = function ()
{
    vec3.set(pos,
        (resetVecX.get()),
        (resetVecY.get()),
        (resetVecZ.get())
    );
};

let dir = false;
function changeDir(d)
{
    dir = !dir;

    move();
}

function isOutside()
{
    if (
        pos[0] > max.get() || pos[0] < -max.get()
        || pos[1] > max.get() || pos[1] < -max.get()
        || pos[2] > max.get() || pos[2] < -max.get())
        return true;
    return false;
}

function move()
{
}

exec.onTriggered = function ()
{
    timeDiff = op.patch.freeTimer.get() - lastTime;
    const m = speed.get() * timeDiff * 0.1;

    vec3.set(vec,
        (vecX.get()),
        (vecY.get()),
        (vecZ.get())
    );

    vec3.normalize(vec, vec);

    vec[0] *= m;
    vec[1] *= m;
    vec[2] *= m;

    lastTime = op.patch.freeTimer.get();

    move();

    // if(isOutside())
    // {
    //     op.log("OUTSIDE");
    //     changeDir();
    //     var count=0;
    //     while(isOutside() && count<10)
    //     {
    //         randomize();
    // count++;
    //         move();
    //     }
    // }

    // if(pos[0]>max.get() || pos[0]<-max.get()) changeDir();
    //     else if(pos[1]>max.get() || pos[1]<-max.get()) changeDir();
    //         else if(pos[2]>max.get() || pos[2]<-max.get()) changeDir();

    vec3.add(pos, pos, vec);

    cgl.pushModelMatrix();

    mat4.translate(cgl.mMatrix, cgl.mMatrix, pos);

    next.trigger();

    cgl.popModelMatrix();
};
