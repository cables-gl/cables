const execute=op.addInPort(new CABLES.Port(op,"execute",CABLES.OP_PORT_TYPE_FUNCTION) );
const r=op.addInPort(new CABLES.Port(op,"diffuse r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
const g=op.addInPort(new CABLES.Port(op,"diffuse g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
const b=op.addInPort(new CABLES.Port(op,"diffuse b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
const a=op.addInPort(new CABLES.Port(op,"diffuse a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

const next=op.addOutPort(new CABLES.Port(op,"next",CABLES.OP_PORT_TYPE_FUNCTION));

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,"LambertMaterial");

r.uniform=new CGL.Uniform(shader,'f','r',r);
g.uniform=new CGL.Uniform(shader,'f','g',g);
b.uniform=new CGL.Uniform(shader,'f','b',b);
a.uniform=new CGL.Uniform(shader,'f','a',a);

r.set(Math.random());
g.set(Math.random());
b.set(Math.random());
a.set(1.0);

var outShader=op.outObject("Shader");
outShader.set(shader);

var MAX_LIGHTS=16;
var lights=[];
for(var i=0;i<MAX_LIGHTS;i++)
{
    var count=i;
    lights[count]={};
    lights[count].pos=new CGL.Uniform(shader,'3f','lights['+count+'].pos',[0,11,0]);
    lights[count].target=new CGL.Uniform(shader,'3f','lights['+count+'].target',[0,0,0]);
    lights[count].color=new CGL.Uniform(shader,'3f','lights['+count+'].color',[1,1,1]);
    lights[count].attenuation=new CGL.Uniform(shader,'f','lights['+count+'].attenuation',0.1);
    lights[count].type=new CGL.Uniform(shader,'f','lights['+count+'].type',0);
    lights[count].cone=new CGL.Uniform(shader,'f','lights['+count+'].cone',0.8);
    lights[count].mul=new CGL.Uniform(shader,'f','lights['+count+'].mul',1);
    lights[count].ambient=new CGL.Uniform(shader,'3f','lights['+count+'].ambient',1);
    lights[count].fallOff=new CGL.Uniform(shader,'f','lights['+count+'].falloff',0);
    lights[count].radius=new CGL.Uniform(shader,'f','lights['+count+'].radius',10);
}


shader.setSource(attachments.lambert_vert,attachments.lambert_frag);

var numLights=-1;
var updateLights=function()
{
    var count=0;
    var i=0;
    var num=0;
    if(!cgl.frameStore.phong || !cgl.frameStore.phong.lights)
    {
        num=0;
    }
    else
    {
        for(i in cgl.frameStore.phong.lights)
        {
            num++;
        }
    }

    if(num!=numLights)
    {
        numLights=num;
        shader.define('NUM_LIGHTS',''+Math.max(numLights,1));
    }

    if(!cgl.frameStore.phong || !cgl.frameStore.phong.lights)
    {
        lights[count].pos.setValue([5,5,5]);
        lights[count].color.setValue([1,1,1]);
        lights[count].ambient.setValue([0.1,0.1,0.1]);
        lights[count].mul.setValue(1);
        lights[count].fallOff.setValue(0.5);
    }
    else
    {
        count=0;
        if(shader)
            for(i in cgl.frameStore.phong.lights)
            {
                lights[count].pos.setValue(cgl.frameStore.phong.lights[i].pos);
                // if(cgl.frameStore.phong.lights[i].changed)
                {
                    cgl.frameStore.phong.lights[i].changed=false;
                    if(cgl.frameStore.phong.lights[i].target) lights[count].target.setValue(cgl.frameStore.phong.lights[i].target);

                    lights[count].fallOff.setValue(cgl.frameStore.phong.lights[i].fallOff);
                    lights[count].radius.setValue(cgl.frameStore.phong.lights[i].radius);

                    lights[count].color.setValue(cgl.frameStore.phong.lights[i].color);
                    lights[count].ambient.setValue(cgl.frameStore.phong.lights[i].ambient);
                    // lights[count].specular.setValue(cgl.frameStore.phong.lights[i].specular);
                    lights[count].attenuation.setValue(cgl.frameStore.phong.lights[i].attenuation);
                    lights[count].type.setValue(cgl.frameStore.phong.lights[i].type);
                    if(cgl.frameStore.phong.lights[i].cone) lights[count].cone.setValue(cgl.frameStore.phong.lights[i].cone);
                    if(cgl.frameStore.phong.lights[i].depthTex) lights[count].texDepthTex=cgl.frameStore.phong.lights[i].depthTex;

                    lights[count].mul.setValue(cgl.frameStore.phong.lights[i].mul||1);
                }

                count++;
            }
    }
};

function updateSpecular()
{
    if(inSpecular.get()==1)inSpecular.uniform.setValue(99999);
        else inSpecular.uniform.setValue(Math.exp(inSpecular.get()*8,2));
}

execute.onTriggered=function()
{
    if(!shader)return;

    cgl.setShader(shader);
    updateLights();
    next.trigger();
    cgl.setPreviousShader();
};
