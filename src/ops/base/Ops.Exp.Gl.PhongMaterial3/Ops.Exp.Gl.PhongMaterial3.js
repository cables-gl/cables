op.name="PhongMaterial3";

var execute=this.addInPort(new Port(this,"execute",OP_PORT_TYPE_FUNCTION) );

var inSpecular=op.inValueSlider("Specular",0.5);



    // diffuse color

var r=this.addInPort(new Port(this,"diffuse r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=this.addInPort(new Port(this,"diffuse g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=this.addInPort(new Port(this,"diffuse b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=this.addInPort(new Port(this,"diffuse a",OP_PORT_TYPE_VALUE,{ display:'range' }));



var next=this.addOutPort(new Port(this,"next",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'PhongMaterial3');
// shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_NORMAL','MODULE_BEGIN_FRAG']);

r.uniform=new CGL.Uniform(shader,'f','r',r);
g.uniform=new CGL.Uniform(shader,'f','g',g);
b.uniform=new CGL.Uniform(shader,'f','b',b);
a.uniform=new CGL.Uniform(shader,'f','a',a);

r.set(Math.random());
g.set(Math.random());
b.set(Math.random());
a.set(1.0);

inSpecular.uniform=new CGL.Uniform(shader,'f','specular',inSpecular);




var MAX_LIGHTS=16;
var lights=[];
for(i=0;i<MAX_LIGHTS;i++)
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


shader.setSource(attachments.phong_vert,attachments.phong_frag);

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






function texturingChanged()
{
    if(diffuseTexture.get() || normalTexture.get())
    {
        shader.define('HAS_TEXTURES');
    }
    else
    {
        shader.removeDefine('HAS_TEXTURES');
    }
}


// diffuse texture
var diffuseTexture=this.addInPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
var diffuseTextureUniform=null;
shader.bindTextures=bindTextures;

diffuseTexture.onChange=function()
{
    texturingChanged();
    if(diffuseTexture.get())
    {
        if(diffuseTextureUniform!==null)return;
        shader.removeUniform('texDiffuse');
        shader.define('HAS_TEXTURE_DIFFUSE');
        diffuseTextureUniform=new CGL.Uniform(shader,'t','texDiffuse',0);
    }
    else
    {
        shader.removeUniform('texDiffuse');
        shader.removeDefine('HAS_TEXTURE_DIFFUSE');
        diffuseTextureUniform=null;
    }
};




// normal texture
var normalTexture=this.addInPort(new Port(this,"Normal Texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
var normalTextureUniform=null;

normalTexture.onChange=function()
{
    texturingChanged();
    if(normalTexture.get())
    {
        if(normalTextureUniform!==null)return;
        shader.removeUniform('texNormal');
        shader.define('HAS_TEXTURE_NORMAL');
        normalTextureUniform=new CGL.Uniform(shader,'t','texNormal',3);
    }
    else
    {
        shader.removeUniform('texNormal');
        shader.removeDefine('HAS_TEXTURE_NORMAL');
        normalTextureUniform=null;
    }
};



function bindTextures()
{
    if(diffuseTexture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, diffuseTexture.get().tex);
    }

    // if(aoTexture.get())
    // {
    //     cgl.gl.activeTexture(cgl.gl.TEXTURE1);
    //     cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, aoTexture.get().tex);
    // }

    // if(specTexture.get())
    // {
    //     cgl.gl.activeTexture(cgl.gl.TEXTURE2);
    //     cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, specTexture.get().tex);
    // }

    if(normalTexture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE3);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, normalTexture.get().tex);
    }

    // uniShadowPass.setValue(0);
    // if(cgl.frameStore.phong && cgl.frameStore.phong.lights)
    //     for(i in cgl.frameStore.phong.lights)
    //     {
    //         if(cgl.frameStore.phong.lights[i].shadowPass==1.0)uniShadowPass.setValue(1);
    //     }
}



execute.onTriggered=function()
{
    if(!shader)return;

    cgl.setShader(shader);
    updateLights();
    bindTextures();
    next.trigger();
    cgl.setPreviousShader();
};
