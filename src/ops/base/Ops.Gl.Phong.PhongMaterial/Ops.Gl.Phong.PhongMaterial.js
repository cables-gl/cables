this.name="PhongMaterial";
var cgl=this.patch.cgl;

// adapted from:
// http://www.tomdalling.com/blog/modern-opengl/07-more-lighting-ambient-specular-attenuation-gamma/

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION) );
var gammeCorrect=this.addInPort(new Port(this,"gamma correction",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var shaderOut=this.addOutPort(new Port(this,"shader",OP_PORT_TYPE_OBJECT));
shaderOut.ignoreValueSerialize=true;



gammeCorrect.set(true);
var updateGammeCorrect=function()
{
    if(gammeCorrect.get()) shader.define("DO_GAMME_CORRECT");
        else shader.removeDefine("DO_GAMME_CORRECT");

};
gammeCorrect.onValueChanged=updateGammeCorrect;


var srcVert=''
    .endl()+'precision mediump float;'
    .endl()+'{{MODULES_HEAD}}'
    
    .endl()+'#ifdef INSTANCING'
    .endl()+'   attribute mat4 instMat;'
    .endl()+'#endif'
    
    .endl()+'attribute vec3 vPosition;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 mvMatrix;'
    .endl()+'attribute vec3 attrVertNormal;'
    // .endl()+'attribute vec3 normaM;'

    .endl()+'attribute vec2 attrTexCoord;'

    .endl()+'varying mediump vec3 norm;'
    .endl()+'varying mediump vec3 vert;'
    // .endl()+'varying mediump mat4 modelm;'
    // .endl()+'varying mediump mat4 normalm;'
    .endl()+'uniform mat4 normalMatrix;'

    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'   varying mediump vec2 texCoord;'
    .endl()+'#endif'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   norm=attrVertNormal;'
    .endl()+'   vert=vPosition;'
    // .endl()+'   modelm=mvMatrix;'
    // .endl()+'   normalm=normalMatrix;'

    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       texCoord=attrTexCoord;'
    .endl()+'   #endif'
    .endl()+'    vec4 pos = vec4( vPosition, 1. );'
    .endl()+'    {{MODULE_VERTEX_POSITION}}'
    
    .endl()+'#ifdef INSTANCING'
    .endl()+'   pos=instMat*pos;'
    .endl()+'#endif'

    .endl()+'    gl_Position = projMatrix * mvMatrix * pos;'
    // .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
    .endl()+'}';


var srcFrag=''
    .endl()+'precision mediump float;'
    .endl()+'varying mediump vec3 norm;'
    .endl()+'varying mediump vec3 vert;'
    .endl()+'uniform mat4 normalMatrix;'
    .endl()+'uniform mat4 mvMatrix;'
    // .endl()+'varying mediump mat4 modelm;'
    // .endl()+'varying mediump mat4 normalm;'

    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+'uniform float a;'

    .endl()+'uniform float diffuseRepeatX;'
    .endl()+'uniform float diffuseRepeatY;'

    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'   varying mediump vec2 texCoord;'
    .endl()+'   #ifdef HAS_TEXTURE_DIFFUSE'
    .endl()+'       uniform sampler2D tex;'
    .endl()+'   #endif'
    .endl()+'   #ifdef HAS_TEXTURE_OPACITY'
    .endl()+'       uniform sampler2D texOpacity;'
    .endl()+'   #endif'
    .endl()+'#endif'

    .endl()+'uniform struct Light'
    .endl()+'{'
    .endl()+'   float type;'
    .endl()+'   float attenuation;'
    .endl()+'   vec3 pos;'
    .endl()+'   vec3 target;'
    .endl()+'   vec3 color;'
    .endl()+'   float intensity;'
    .endl()+'   float cone;'

    .endl()+'} light;'
    .endl()+'uniform Light lights[3];'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 surfaceColor = vec4(r,g,b,a);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'      #ifdef HAS_TEXTURE_DIFFUSE'
    
    .endl()+'           #ifdef TEXTURED_POINTS'
    .endl()+'               surfaceColor=texture2D(tex,vec2(gl_PointCoord.x*diffuseRepeatX,(1.0-gl_PointCoord.y)*diffuseRepeatY));'    .endl()+'      #endif'
    .endl()+'           #ifndef TEXTURED_POINTS'
    .endl()+'               surfaceColor=texture2D(tex,vec2(texCoord.x*diffuseRepeatX,(1.0-texCoord.y)*diffuseRepeatY));'
    .endl()+'           #endif'
    .endl()+'           surfaceColor.a*=a;'
    .endl()+'           #ifdef COLORIZE_TEXTURE'
    .endl()+'               surfaceColor.r*=r;'
    .endl()+'               surfaceColor.g*=g;'
    .endl()+'               surfaceColor.b*=b;'
    .endl()+'           #endif'
    .endl()+'      #endif'
    .endl()+'   #endif'

    .endl()+'   vec3 theColor=vec3(0.0,0.0,0.0);'
    .endl()+'   for(int l=0;l<3;l++)'
    .endl()+'   {'
    .endl()+'       vec3 lightColor = lights[l].color;'

    //calculate the location of this fragment (pixel) in world coordinates
    .endl()+'       vec3 fragPosition = vec3(mvMatrix * vec4(vert, 1.0)).xyz;'

    //calculate the vector from this pixels surface to the light source
    .endl()+'       vec3 surfaceToLight = lights[l].pos-fragPosition;'

    .endl()+'       vec3 normal = normalize(normalMatrix * vec4(norm,1.0)).xyz;'

    //calculate the cosine of the angle of incidence'
    .endl()+'       float brightness = dot(normal, surfaceToLight) / (length(surfaceToLight) * length(normal));'
    .endl()+'       brightness = clamp(brightness, 0.0, 1.0);'

    // attenuation
    .endl()+'       float distanceToLight = length(surfaceToLight);'
    .endl()+'       float attenuation = 1.0 / (1.0 + lights[l].attenuation * distanceToLight * distanceToLight);'
    
    // .endl()+'       attenuation = 1.0;'
    
    
    
    // SPOT LIGHT
    .endl()+'       if(lights[l].type!=0.0)'
    .endl()+'       {'
    .endl()+'           vec3 coneDirection = normalize( (lights[l].target-lights[l].pos) );'
    .endl()+'           float spotEffect = dot(normalize(coneDirection), normalize(-surfaceToLight));'
    .endl()+'           float lightToSurfaceAngle = degrees(acos(dot(surfaceToLight, coneDirection)));'
    .endl()+'           if( spotEffect <lights[l].cone)'
    .endl()+'           {'
    .endl()+'               attenuation=0.0;'
    .endl()+'           }'
    .endl()+'       }'


    .endl()+'       brightness *= attenuation;'

    //calculate final color of the pixel, based on:'
    // 1. The angle of incidence: brightness'
    // 2. The color/intensities of the light: light.intensities'
    // 3. The texture and texture coord: texture(tex, fragTexCoord)'
    // .endl()+'   vec4 surfaceColor = texture(tex, fragTexCoord);'
    // .endl()+'       return lightColor*brightness;'

// .endl()+'vec3 specularComponent = specularCoefficient * vec3(1.0,1.0,1.0) * 1.0;'


    .endl()+'       theColor+=(lightColor*brightness);'
    // .endl()+'       if(length(lights[l].target)>0.0)theColor=vec3(1.0,0.0,0.0);'

    .endl()+'   }'


    .endl()+'   vec3 finalColor = theColor * surfaceColor.rgb;'

    .endl()+'   #ifdef DO_GAMME_CORRECT'
    .endl()+'       vec3 linearColor = finalColor;'
    .endl()+'       vec3 gamma = vec3(1.0/2.2);'
    .endl()+'       finalColor = pow(linearColor, gamma);'
    .endl()+'   #endif'
    // .endl()+'   finalColor.r=1.0;'

    .endl()+'   gl_FragColor = vec4(finalColor, surfaceColor.a);'
    .endl()+'}';


var shader=new CGL.Shader(cgl,'PhongMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

shaderOut.set(shader);

shader.setSource(srcVert,srcFrag);

{
    // diffuse color

    var r=this.addInPort(new Port(this,"diffuse r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    r.onValueChanged=function()
    {
        if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
        else r.uniform.setValue(r.get());
    };

    var g=this.addInPort(new Port(this,"diffuse g",OP_PORT_TYPE_VALUE,{ display:'range' }));
    g.onValueChanged=function()
    {
        if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
        else g.uniform.setValue(g.get());
    };

    var b=this.addInPort(new Port(this,"diffuse b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.onValueChanged=function()
    {
        if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
        else b.uniform.setValue(b.get());
    };

    var a=this.addInPort(new Port(this,"diffuse a",OP_PORT_TYPE_VALUE,{ display:'range' }));
    a.onValueChanged=function()
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
    var colorizeTex=this.addInPort(new Port(this,"colorize texture",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    colorizeTex.onValueChanged=function()
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

    diffuseTexture.onValueChanged=function()
    {
        if(diffuseTexture.get())
        {
            if(diffuseTextureUniform!==null)return;
            shader.removeUniform('tex');
            shader.define('HAS_TEXTURE_DIFFUSE');
            diffuseTextureUniform=new CGL.Uniform(shader,'t','tex',0);
        }
        else
        {
            shader.removeUniform('tex');
            shader.removeDefine('HAS_TEXTURE_DIFFUSE');
            diffuseTextureUniform=null;
        }
    };

    var diffuseRepeatX=this.addInPort(new Port(this,"diffuseRepeatX",OP_PORT_TYPE_VALUE));
    var diffuseRepeatY=this.addInPort(new Port(this,"diffuseRepeatY",OP_PORT_TYPE_VALUE));
    diffuseRepeatX.set(1);
    diffuseRepeatY.set(1);

    diffuseRepeatX.onValueChanged=function()
    {
        diffuseRepeatXUniform.setValue(diffuseRepeatX.get());
    };

    diffuseRepeatY.onValueChanged=function()
    {
        diffuseRepeatYUniform.setValue(diffuseRepeatY.get());
    };

    var diffuseRepeatXUniform=new CGL.Uniform(shader,'f','diffuseRepeatX',diffuseRepeatX.get());
    var diffuseRepeatYUniform=new CGL.Uniform(shader,'f','diffuseRepeatY',diffuseRepeatY.get());
}

{
    var texturedPoints=this.addInPort(new Port(this,"textured points",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    texturedPoints.onValueChanged=function()
    {
        if(texturedPoints.get()) shader.define('TEXTURED_POINTS');
            else shader.removeDefine('TEXTURED_POINTS');

    };
    
}


{
    //lights

    var lights=[];
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

// console.log('lights...',numLights,num);

        if(num!=numLights)
        {
            console.log("rebuild lights...");
            
            count=0;
            lights.length=0;
            for(i=0;i<num;i++)
            {
                lights[count]={};
                lights[count].pos=new CGL.Uniform(shader,'3f','lights['+count+'].pos',[0,11,0]);
                lights[count].target=new CGL.Uniform(shader,'3f','lights['+count+'].target',[0,0,0]);
                lights[count].color=new CGL.Uniform(shader,'3f','lights['+count+'].color',[1,1,1]);
                lights[count].attenuation=new CGL.Uniform(shader,'f','lights['+count+'].attenuation',0.1);
                lights[count].type=new CGL.Uniform(shader,'f','lights['+count+'].type',0);
                lights[count].cone=new CGL.Uniform(shader,'f','lights['+count+'].cone',0.8);


                count++;
            }

            // console.log("numLights",numLights);

            numLights=count;
            shader.define('NUM_LIGHTS',''+numLights);

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
            // console.log(cgl.frameStore.phong.lights);
            
            for(i in cgl.frameStore.phong.lights)
            {
                // console.log(cgl.frameStore.phong.lights[i]);
                lights[count].pos.setValue(cgl.frameStore.phong.lights[i].pos);
                if(cgl.frameStore.phong.lights[i].target) lights[count].target.setValue(cgl.frameStore.phong.lights[i].target);
                lights[count].color.setValue(cgl.frameStore.phong.lights[i].color);
                lights[count].attenuation.setValue(cgl.frameStore.phong.lights[i].attenuation);
                lights[count].type.setValue(cgl.frameStore.phong.lights[i].type);
                if(cgl.frameStore.phong.lights[i].cone) lights[count].cone.setValue(cgl.frameStore.phong.lights[i].cone);

                count++;
            }
            cgl.frameStore.phong.lights.length=0;

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

    // if(self.textureOpacity.get())
    // {
    //     cgl.gl.activeTexture(cgl.gl.TEXTURE1);
    //     cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.textureOpacity.val.tex);
    // }
}

var doRender=function()
{
    cgl.setShader(shader);
    updateLights();
    shader.bindTextures();
    trigger.trigger();
    cgl.setPreviousShader();
};

shader.bindTextures=bindTextures;
shader.define('NUM_LIGHTS','0');
updateGammeCorrect();
this.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();