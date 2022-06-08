
const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");
const outNumKeys=op.outValue("Num Keys");

var channel=this.addInPort(new CABLES.Port(this,"channel"));

var q=quat.create();
var qMat=mat4.create();
var cgl=op.patch.cgl;
var fps=30;

function dataGetAnimation(data,name)
{
    if(!data || !data.hasOwnProperty('animations')) return false;

    for(var iAnims in data.animations)
    {
        if(data.animations[iAnims].tickspersecond) fps=data.animations[iAnims].tickspersecond;

        for(var iChannels in data.animations[iAnims].channels)
            if(data.animations[iAnims].channels[iChannels].name==name && data.animations[iAnims].channels[iChannels].rotationkeys.length>0)
                return data.animations[iAnims].channels[iChannels];

    }
    return false;
}

var animX=null;
var animY=null;
var animZ=null;
var animW=null;

function readAnim()
{
    var an=dataGetAnimation(cgl.frameStore.currentScene.getValue(),channel.get());


    if(an)
    {
        animX=new CABLES.Anim();
        animY=new CABLES.Anim();
        animZ=new CABLES.Anim();
        animW=new CABLES.Anim();

        for(var k in an.rotationkeys)
        {
            animX.setValue( an.rotationkeys[k][0]/fps,an.rotationkeys[k][1][1] );
            animY.setValue( an.rotationkeys[k][0]/fps,an.rotationkeys[k][1][2] );
            animZ.setValue( an.rotationkeys[k][0]/fps,an.rotationkeys[k][1][3] );
            animW.setValue( an.rotationkeys[k][0]/fps,an.rotationkeys[k][1][0] );
        }

        outNumKeys.set(an.rotationkeys.length);
    }



}

render.onTriggered=function()
{
    if(!cgl.frameStore.currentScene)return;

    if(animX)
    {
        var time=op.patch.timer.getTime();
        CABLES.TL.Anim.slerpQuaternion(time,q,animX,animY,animZ,animW);
        mat4.fromQuat(qMat, q);

    }
    else readAnim();

    cgl.pushModelMatrix();

    mat4.multiply(cgl.mMatrix,cgl.mMatrix, qMat);

    trigger.trigger();
    cgl.popModelMatrix();
};
