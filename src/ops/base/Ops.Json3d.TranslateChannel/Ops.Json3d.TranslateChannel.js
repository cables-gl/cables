const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");

var channel=this.addInPort(new CABLES.Port(this,"channel"));

var q=quat.create();
var qMat=mat4.create();
const cgl=op.patch.cgl;

var animX=null;
var animY=null;
var animZ=null;
var vec=vec3.create();

var fps=30;

function dataGetAnimation(data,name)
{
    if(!data || !data.hasOwnProperty('animations')) return false;

    for(var iAnims in data.animations)
    {
        if(data.animations[iAnims].tickspersecond) fps=data.animations[iAnims].tickspersecond;

        for(var iChannels in data.animations[iAnims].channels)
            if(data.animations[iAnims].channels[iChannels].name==name && data.animations[iAnims].channels[iChannels].positionkeys.length>1)
                return data.animations[iAnims].channels[iChannels];

    }
    return false;
}

function readAnim()
{
    var an=dataGetAnimation(cgl.frameStore.currentScene.getValue(),channel.get());

    console.log(an);

    if(an)
    {
        animX=new CABLES.Anim();
        animY=new CABLES.Anim();
        animZ=new CABLES.Anim();

        for(var k in an.positionkeys)
        {
            animX.setValue( an.positionkeys[k][0]/25,an.positionkeys[k][1][0] );
            animY.setValue( an.positionkeys[k][0]/25,an.positionkeys[k][1][1] );
            animZ.setValue( an.positionkeys[k][0]/25,an.positionkeys[k][1][2] );
        }
    }
}

render.onTriggered=function()
{
    if(!cgl.frameStore.currentScene)return;

    cgl.pushModelMatrix();

    if(animX)
    {
        var time=op.patch.timer.getTime();
        vec[0]=animX.getValue(time);
        vec[1]=animY.getValue(time);
        vec[2]=animZ.getValue(time);

        mat4.translate(cgl.mMatrix,cgl.mMatrix,vec);
    }
    else readAnim();

    trigger.trigger();
    cgl.popModelMatrix();
};
