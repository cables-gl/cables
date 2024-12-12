const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");
const outNumKeys = op.outValue("Num Keys");
let channel = this.addInPort(new CABLES.Port(this, "channel"));

let q = quat.create();
let qMat = mat4.create();
const cgl = op.patch.cgl;

let animX = null;
let animY = null;
let animZ = null;
let vec = vec3.create();

let fps = 30;

function dataGetAnimation(data, name)
{
    if (!data || !data.hasOwnProperty("animations")) return false;

    for (let iAnims in data.animations)
    {
        if (data.animations[iAnims].tickspersecond) fps = data.animations[iAnims].tickspersecond;

        for (let iChannels in data.animations[iAnims].channels)
            if (data.animations[iAnims].channels[iChannels].name == name && data.animations[iAnims].channels[iChannels].positionkeys.length > 0)
                return data.animations[iAnims].channels[iChannels];
    }
    return false;
}

function readAnim()
{
    let an = dataGetAnimation(cgl.tempData.currentScene.getValue(), channel.get());

    if (an)
    {
        animX = new CABLES.Anim();
        animY = new CABLES.Anim();
        animZ = new CABLES.Anim();

        for (let k in an.positionkeys)
        {
            animX.setValue(an.positionkeys[k][0] / fps, an.positionkeys[k][1][0]);
            animY.setValue(an.positionkeys[k][0] / fps, an.positionkeys[k][1][1]);
            animZ.setValue(an.positionkeys[k][0] / fps, an.positionkeys[k][1][2]);
        }

        outNumKeys.set(an.positionkeys.length);
    }
}

render.onTriggered = function ()
{
    if (!cgl.tempData.currentScene) return;

    cgl.pushModelMatrix();

    if (animX)
    {
        let time = op.patch.timer.getTime();
        vec[0] = animX.getValue(time);
        vec[1] = animY.getValue(time);
        vec[2] = animZ.getValue(time);

        mat4.translate(cgl.mMatrix, cgl.mMatrix, vec);
    }
    else readAnim();

    trigger.trigger();
    cgl.popModelMatrix();
};
