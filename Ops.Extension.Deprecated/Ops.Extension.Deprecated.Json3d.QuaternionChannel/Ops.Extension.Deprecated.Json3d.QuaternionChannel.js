const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");
const outNumKeys = op.outValue("Num Keys");

let channel = this.addInPort(new CABLES.Port(this, "channel"));

let q = quat.create();
let qMat = mat4.create();
let cgl = op.patch.cgl;
let fps = 30;

function dataGetAnimation(data, name)
{
    if (!data || !data.hasOwnProperty("animations")) return false;

    for (let iAnims in data.animations)
    {
        if (data.animations[iAnims].tickspersecond) fps = data.animations[iAnims].tickspersecond;

        for (let iChannels in data.animations[iAnims].channels)
            if (data.animations[iAnims].channels[iChannels].name == name && data.animations[iAnims].channels[iChannels].rotationkeys.length > 0)
                return data.animations[iAnims].channels[iChannels];
    }
    return false;
}

let animX = null;
let animY = null;
let animZ = null;
let animW = null;

function readAnim()
{
    let an = dataGetAnimation(cglframeStorecurrentScene.getValue(), channel.get());

    if (an)
    {
        animX = new CABLES.Anim();
        animY = new CABLES.Anim();
        animZ = new CABLES.Anim();
        animW = new CABLES.Anim();

        for (let k in an.rotationkeys)
        {
            animX.setValue(an.rotationkeys[k][0] / fps, an.rotationkeys[k][1][1]);
            animY.setValue(an.rotationkeys[k][0] / fps, an.rotationkeys[k][1][2]);
            animZ.setValue(an.rotationkeys[k][0] / fps, an.rotationkeys[k][1][3]);
            animW.setValue(an.rotationkeys[k][0] / fps, an.rotationkeys[k][1][0]);
        }

        outNumKeys.set(an.rotationkeys.length);
    }
}

render.onTriggered = function ()
{
    if (!cglframeStorecurrentScene) return;

    if (animX)
    {
        let time = op.patch.timer.getTime();
        CABLES.Anim.slerpQuaternion(time, q, animX, animY, animZ, animW);
        mat4.fromQuat(qMat, q);
    }
    else readAnim();

    cgl.pushModelMatrix();

    mat4.multiply(cgl.mMatrix, cgl.mMatrix, qMat);

    trigger.trigger();
    cgl.popModelMatrix();
};
