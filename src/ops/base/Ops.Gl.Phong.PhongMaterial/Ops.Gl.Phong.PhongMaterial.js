op.name="PhongMaterial";
var cgl=this.patch.cgl;

// adapted from:
// http://www.tomdalling.com/blog/modern-opengl/07-more-lighting-ambient-specular-attenuation-gamma/

var render=this.addInPort(new CABLES.Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION) );

var trigger=this.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var shaderOut=this.addOutPort(new CABLES.Port(this,"shader",CABLES.OP_PORT_TYPE_OBJECT));

var specularStrength=op.inValue("Specular Strength",1);
var shininess=op.inValue("Shininess",20);
var fresnel=op.inValueSlider("Fresnel",0);




shaderOut.ignoreValueSerialize=true;
var MAX_LIGHTS=16;




var shader=new CGL.Shader(cgl,'PhongMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_NORMAL','MODULE_BEGIN_FRAG']);

shader.setSource(attachments.phong_vert,attachments.phong_frag);
shaderOut.set(shader);

var uniSpecStrngth=new CGL.Uniform(shader,'f','specularStrength',specularStrength);
var uniShininess=new CGL.Uniform(shader,'f','shininess',shininess);
var uniFresnel=new CGL.Uniform(shader,'f','fresnel',fresnel);



var lights=[];

var depthTex=new CGL.Uniform(shader,'t','depthTex',5);

var uniShadowPass=new CGL.Uniform(shader,'f','shadowPass',0);

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
    lights[count].specular=new CGL.Uniform(shader,'3f','lights['+count+'].specular',1);
    
    lights[count].fallOff=new CGL.Uniform(shader,'f','lights['+count+'].falloff',0);
    lights[count].radius=new CGL.Uniform(shader,'f','lights['+count+'].radius',10);
    
//   vec3 pos;
//   vec3 color;
//   vec3 ambient;
//   float falloff;
//   float radius;

    // lights[count].depthMVP=new CGL.Uniform(shader,'m4','lights['+count+'].depthMVP',mat4.create());
}

var normIntensity=op.inValue("Normal Texture Intensity",1);
var uniNormIntensity=new CGL.Uniform(shader,'f','normalTexIntensity',normIntensity);




{
    // diffuse color

    var r=this.addInPort(new CABLES.Port(this,"diffuse r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    r.onChange=function()
    {
        if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
        else r.uniform.setValue(r.get());
    };

    var g=this.addInPort(new CABLES.Port(this,"diffuse g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    g.onChange=function()
    {
        if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
        else g.uniform.setValue(g.get());
    };

    var b=this.addInPort(new CABLES.Port(this,"diffuse b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.onChange=function()
    {
        if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
        else b.uniform.setValue(b.get());
    };

    var a=this.addInPort(new CABLES.Port(this,"diffuse a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    a.onChange=function()
    {
        if(!a.uniform) a.uniform=new CGL.Uniform(shader,'f','a',a.get());
        else a.uniform.setValue(a.get());
    };

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
    a.set(1.0);
}



{
    var colorizeTex=this.addInPort(new CABLES.Port(this,"colorize texture",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
    colorizeTex.onChange=function()
    {
        if(colorizeTex.get()) shader.define('COLORIZE_TEXTURE');
            else shader.removeDefine('COLORIZE_TEXTURE');
    };
}

{
    // diffuse texture

    var diffuseTexture=this.addInPort(new CABLES.Port(this,"texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
    var diffuseTextureUniform=null;
    shader.bindTextures=bindTextures;

    diffuseTexture.onChange=function()
    {
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

    var aoTexture=this.addInPort(new CABLES.Port(this,"AO Texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
    var aoTextureUniform=null;
    aoTexture.ignoreValueSerialize=true;
    shader.bindTextures=bindTextures;

    aoTexture.onChange=function()
    {
        if(aoTexture.get())
        {
            if(aoTextureUniform!==null)return;
            shader.removeUniform('texAo');
            shader.define('HAS_TEXTURE_AO');
            aoTextureUniform=new CGL.Uniform(shader,'t','texAo',1);
        }
        else
        {
            shader.removeUniform('texAo');
            shader.removeDefine('HAS_TEXTURE_AO');
            aoTextureUniform=null;
        }
    };


    var specTexture=this.addInPort(new CABLES.Port(this,"Specular Texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
    var specTextureUniform=null;

    specTexture.onChange=function()
    {
        if(specTexture.get())
        {
            if(specTextureUniform!==null)return;
            shader.removeUniform('texSpecular');
            shader.define('HAS_TEXTURE_SPECULAR');
            specTextureUniform=new CGL.Uniform(shader,'t','texSpecular',2);
        }
        else
        {
            shader.removeUniform('texSpecular');
            shader.removeDefine('HAS_TEXTURE_SPECULAR');
            specTextureUniform=null;
        }
    };


    var normalTexture=this.addInPort(new CABLES.Port(this,"Normal Texture",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
    var normalTextureUniform=null;

    normalTexture.onChange=function()
    {
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



    var diffuseRepeatX=this.addInPort(new CABLES.Port(this,"diffuseRepeatX",CABLES.OP_PORT_TYPE_VALUE));
    var diffuseRepeatY=this.addInPort(new CABLES.Port(this,"diffuseRepeatY",CABLES.OP_PORT_TYPE_VALUE));
    diffuseRepeatX.set(1);
    diffuseRepeatY.set(1);

    diffuseRepeatX.onChange=function()
    {
        diffuseRepeatXUniform.setValue(diffuseRepeatX.get());
    };

    diffuseRepeatY.onChange=function()
    {
        diffuseRepeatYUniform.setValue(diffuseRepeatY.get());
    };

    var diffuseRepeatXUniform=new CGL.Uniform(shader,'f','diffuseRepeatX',diffuseRepeatX.get());
    var diffuseRepeatYUniform=new CGL.Uniform(shader,'f','diffuseRepeatY',diffuseRepeatY.get());
}



{
    //lights
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
            // numLights=1;
            // lights[0].pos.setValue([1,2,0]);
            // lights[0].target.setValue([0,0,0]);
            // lights[0].color.setValue([1,1,1]);
            // lights[0].attenuation.setValue(0);
            // lights[0].type.setValue(0);
            // lights[0].cone.setValue(0.8);
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
                        lights[count].specular.setValue(cgl.frameStore.phong.lights[i].specular);
                        lights[count].attenuation.setValue(cgl.frameStore.phong.lights[i].attenuation);
                        lights[count].type.setValue(cgl.frameStore.phong.lights[i].type);
                        if(cgl.frameStore.phong.lights[i].cone) lights[count].cone.setValue(cgl.frameStore.phong.lights[i].cone);
                        // if(cgl.frameStore.phong.lights[i].depthMVP) lights[count].depthMVP.setValue(cgl.frameStore.phong.lights[i].depthMVP);
                        if(cgl.frameStore.phong.lights[i].depthTex) lights[count].texDepthTex=cgl.frameStore.phong.lights[i].depthTex;

                        lights[count].mul.setValue(cgl.frameStore.phong.lights[i].mul||1);
                    }

                    count++;
                }
        }
    }

}

var bindTextures=function()
{
    if(diffuseTexture.get())
    {
        /* --- */cgl.setTexture(0,diffuseTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, diffuseTexture.get().tex);
    }

    if(aoTexture.get())
    {
        /* --- */cgl.setTexture(1,aoTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, aoTexture.get().tex);
    }

    if(specTexture.get())
    {
        /* --- */cgl.setTexture(2, specTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, specTexture.get().tex);
    }

    if(normalTexture.get())
    {
        /* --- */cgl.setTexture(3, normalTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, normalTexture.get().tex);
    }

    uniShadowPass.setValue(0);
    if(cgl.frameStore.phong && cgl.frameStore.phong.lights)
        for(i in cgl.frameStore.phong.lights)
        {
            if(cgl.frameStore.phong.lights[i].shadowPass==1.0)uniShadowPass.setValue(1);
        }
}

var doRender=function()
{
    if(!shader)return;

    cgl.setShader(shader);
    updateLights();
    shader.bindTextures();
    trigger.trigger();
    cgl.setPreviousShader();
};

shader.bindTextures=bindTextures;
shader.define('NUM_LIGHTS','1');

// this.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();
