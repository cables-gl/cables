op.name="PhongMaterial";
var cgl=this.patch.cgl;

// adapted from:
// http://www.tomdalling.com/blog/modern-opengl/07-more-lighting-ambient-specular-attenuation-gamma/

var render=this.addInPort(new Port(this,"execute",OP_PORT_TYPE_FUNCTION) );

var trigger=this.addOutPort(new Port(this,"next",OP_PORT_TYPE_FUNCTION));
var shaderOut=this.addOutPort(new Port(this,"shader",OP_PORT_TYPE_OBJECT));

// var specularStrength=op.inValue("Specular Strength",1);
var shininess=op.inValueSlider("Shininess",0.5);
var fresnel=op.inValueSlider("Fresnel",0);


// diffuse color


shaderOut.ignoreValueSerialize=true;
var MAX_LIGHTS=16;


var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'lambertmaterial');


var shader=new CGL.Shader(cgl,'PhongMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_NORMAL','MODULE_BEGIN_FRAG']);

shader.setSource(attachments.phong2_vert,attachments.phong2_frag);
shaderOut.set(shader);

// var unishininess=new CGL.Uniform(shader,'f','shininess',shininess);
var uniShininess=new CGL.Uniform(shader,'f','shininess',0);
var uniFresnel=new CGL.Uniform(shader,'f','fresnel',fresnel);
shininess.onChange=updateShininess;


var lights=[];

var depthTex=new CGL.Uniform(shader,'t','depthTex',5);

var uniShadowPass=new CGL.Uniform(shader,'f','shadowPass',0);

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


function updateShininess()
{
    if(shininess.get()==1)uniShininess.setValue(99999);
        else uniShininess.setValue(Math.exp(shininess.get()*8,2));
}


{
    // diffuse color

    var r=this.addInPort(new Port(this,"diffuse r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    var g=this.addInPort(new Port(this,"diffuse g",OP_PORT_TYPE_VALUE,{ display:'range' }));
    var b=this.addInPort(new Port(this,"diffuse b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    var a=this.addInPort(new Port(this,"diffuse a",OP_PORT_TYPE_VALUE,{ display:'range' }));

    r.uniform=new CGL.Uniform(shader,'f','r',r);
    g.uniform=new CGL.Uniform(shader,'f','g',g);
    b.uniform=new CGL.Uniform(shader,'f','b',b);
    a.uniform=new CGL.Uniform(shader,'f','a',a);

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
    a.set(1.0);
}



{
    var colorizeTex=this.addInPort(new Port(this,"colorize texture",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    colorizeTex.onChange=function()
    {
        if(colorizeTex.get()) shader.define('COLORIZE_TEXTURE');
            else shader.removeDefine('COLORIZE_TEXTURE');
    };
}

{
    // diffuse texture

    var diffuseTexture=this.addInPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
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

    var aoTexture=this.addInPort(new Port(this,"AO Texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
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


    var specTexture=this.addInPort(new Port(this,"Specular Texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
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


    var normalTexture=this.addInPort(new Port(this,"Normal Texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
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



    var diffuseRepeatX=this.addInPort(new Port(this,"diffuseRepeatX",OP_PORT_TYPE_VALUE));
    var diffuseRepeatY=this.addInPort(new Port(this,"diffuseRepeatY",OP_PORT_TYPE_VALUE));
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
            lights[count].pos.setValue([5,5,5]);
            lights[count].color.setValue([1,1,1]);
            lights[count].ambient.setValue([0,0,0]);
            lights[count].specular.setValue([1,1,1]);
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
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, diffuseTexture.get().tex);
    }

    if(aoTexture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, aoTexture.get().tex);
    }

    if(specTexture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE2);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, specTexture.get().tex);
    }

    if(normalTexture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE3);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, normalTexture.get().tex);
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

this.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();
updateShininess();
