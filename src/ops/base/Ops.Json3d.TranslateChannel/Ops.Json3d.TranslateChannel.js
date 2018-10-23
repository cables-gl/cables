
var render=this.addInPort(new Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var channel=this.addInPort(new Port(this,"channel"));

var q=quat.create();
var qMat=mat4.create();
var cgl=op.patch.cgl;

function dataGetAnimation(data,name)
{
    if(!data || !data.hasOwnProperty('animations')) return false;

    for(var iAnims in data.animations)
        for(var iChannels in data.animations[iAnims].channels)
            if(data.animations[iAnims].channels[iChannels].name==name)
                return data.animations[iAnims].channels[iChannels];
    return false;
}

var animX=null;
var animY=null;
var animZ=null;


function readAnim()
{
    var an=dataGetAnimation(cgl.frameStore.currentScene.getValue(),channel.get());

    if(an)
    {
        animX=new CABLES.TL.Anim();
        animY=new CABLES.TL.Anim();
        animZ=new CABLES.TL.Anim();

        for(var k in an.positionkeys)
        {
            animX.setValue( an.positionkeys[k][0],an.positionkeys[k][1][0] );
            animY.setValue( an.positionkeys[k][0],an.positionkeys[k][1][1] );
            animZ.setValue( an.positionkeys[k][0],an.positionkeys[k][1][2] );
        }
    }
}


var vec=vec3.create();

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
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,vec);
    }
    else readAnim();

    trigger.trigger();
    cgl.popModelMatrix();
};
