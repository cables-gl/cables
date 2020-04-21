const
    render=op.inTrigger("render"),
    textureMatcap=op.inTexture('MatCap'),
    textureDiffuse=op.inTexture('Diffuse'),
    textureNormal=op.inTexture('Normal'),
    textureSpec=op.inTexture('Specular'),
    textureSpecMatCap=op.inTexture('Specular MatCap'),
    textureAo=op.inTexture('AO Texture'),
    textureOpacity=op.inTexture("Opacity Texture"),
    r=op.inValueSlider('r',1),
    g=op.inValueSlider('g',1),
    b=op.inValueSlider('b',1),
    pOpacity=op.inValueSlider("Opacity",1),
    aoIntensity=op.inValueSlider("AO Intensity",1.0),
    repeatX=op.inValue("Repeat X",1),
    repeatY=op.inValue("Repeat Y",1),
    offsetX=op.inValue("Offset X",0),
    offsetY=op.inValue("Offset Y",0),
    calcTangents = op.inValueBool("calc normal tangents",true),
    projectCoords=op.inValueSelect('projectCoords',['no','xy','yz','xz'],'no'),
    ssNormals=op.inValueBool("Screen Space Normals"),
    next=op.outTrigger("trigger"),
    shaderOut=op.outObject("Shader");

r.setUiAttribs({colorPick:true});

const alphaMaskSource=op.inSwitch("Alpha Mask Source",["Luminance","R","G","B","A"],"Luminance");
alphaMaskSource.setUiAttribs({ greyout:true });

const texCoordAlpha=op.inValueBool("Opacity TexCoords Transform",false);
const discardTransPxl=op.inValueBool("Discard Transparent Pixels");

op.setPortGroup("Texture Opacity",[alphaMaskSource, texCoordAlpha, discardTransPxl]);
op.setPortGroup("Texture maps",[textureDiffuse,textureNormal,textureSpec,textureSpecMatCap,textureAo, textureOpacity]);
op.setPortGroup("Color",[r,g,b,pOpacity]);

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,'MatCapMaterialNew');
var uniOpacity=new CGL.Uniform(shader,'f','opacity',pOpacity);

shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.setSource(attachments.matcap_vert,attachments.matcap_frag);
shaderOut.set(shader);

var textureMatcapUniform=null;
var textureDiffuseUniform=null;
var textureNormalUniform=null;
var textureSpecUniform=null;
var textureSpecMatCapUniform=null;
var textureAoUniform=null;
const offsetUniform=new CGL.Uniform(shader,'2f','texOffset',offsetX,offsetY);
const repeatUniform=new CGL.Uniform(shader,'2f','texRepeat',repeatX,repeatY);

var aoIntensityUniform=new CGL.Uniform(shader,'f','aoIntensity',aoIntensity);
b.uniform=new CGL.Uniform(shader,'f','b',b);
g.uniform=new CGL.Uniform(shader,'f','g',g);
r.uniform=new CGL.Uniform(shader,'f','r',r);


calcTangents.onChange=updateDefines;
updateDefines();
updateMatcap();

function updateDefines()
{
    if(calcTangents.get()) shader.define('CALC_TANGENT');
        else shader.removeDefine('CALC_TANGENT');

}

ssNormals.onChange=function()
{
    if(ssNormals.get())
    {
        if(cgl.glVersion<2)
        {
            cgl.gl.getExtension('OES_standard_derivatives');
            shader.enableExtension('GL_OES_standard_derivatives');
        }

        shader.define('CALC_SSNORMALS');
    }
    else shader.removeDefine('CALC_SSNORMALS');
};

projectCoords.onChange=function()
{
    shader.toggleDefine('DO_PROJECT_COORDS_XY',projectCoords.get()=='xy');
    shader.toggleDefine('DO_PROJECT_COORDS_YZ',projectCoords.get()=='yz');
    shader.toggleDefine('DO_PROJECT_COORDS_XZ',projectCoords.get()=='xz');
};

textureMatcap.onChange=updateMatcap;

function updateMatcap()
{
    if(textureMatcap.get())
    {
        if(textureMatcapUniform!==null)return;
        shader.removeUniform('texMatcap');
        textureMatcapUniform=new CGL.Uniform(shader,'t','texMatcap',0);
    }
    else
    {
        if(!CGL.defaultTextureMap)
        {
            var pixels=new Uint8Array(256*4);
            for(var x=0;x<16;x++)
            {
                for(var y=0;y<16;y++)
                {
                    var c=y*16;
                    c*=Math.min(1,(x+y/3)/8);
                    pixels[(x+y*16)*4+0]=pixels[(x+y*16)*4+1]=pixels[(x+y*16)*4+2]=c;
                    pixels[(x+y*16)*4+3]=255;
                }
            }

            CGL.defaultTextureMap=new CGL.Texture(cgl);
            CGL.defaultTextureMap.initFromData(pixels,16,16);
        }
        textureMatcap.set(CGL.defaultTextureMap);

        shader.removeUniform('texMatcap');
        textureMatcapUniform=new CGL.Uniform(shader,'t','texMatcap',0);
    }
}

textureDiffuse.onChange=function()
{
    if(textureDiffuse.get())
    {
        if(textureDiffuseUniform!==null)return;
        shader.define('HAS_DIFFUSE_TEXTURE');
        shader.removeUniform('texDiffuse');
        textureDiffuseUniform=new CGL.Uniform(shader,'t','texDiffuse',1);
    }
    else
    {
        shader.removeDefine('HAS_DIFFUSE_TEXTURE');
        shader.removeUniform('texDiffuse');
        textureDiffuseUniform=null;
    }
};

textureNormal.onChange=function()
{
    if(textureNormal.get())
    {
        if(textureNormalUniform!==null)return;
        shader.define('HAS_NORMAL_TEXTURE');
        shader.removeUniform('texNormal');
        textureNormalUniform=new CGL.Uniform(shader,'t','texNormal',2);
    }
    else
    {
        shader.removeDefine('HAS_NORMAL_TEXTURE');
        shader.removeUniform('texNormal');
        textureNormalUniform=null;
    }
};

textureAo.onChange=function()
{
    if(textureAo.get())
    {
        if(textureAoUniform!==null)return;
        shader.define('HAS_AO_TEXTURE');
        shader.removeUniform('texAo');
        textureAoUniform=new CGL.Uniform(shader,'t','texAo',5);
    }
    else
    {
        shader.removeDefine('HAS_AO_TEXTURE');
        shader.removeUniform('texAo');
        textureAoUniform=null;
    }
};

textureSpec.onChange=textureSpecMatCap.onChange=function()
{
    if(textureSpec.get() && textureSpecMatCap.get())
    {
        if(textureSpecUniform!==null)return;
        shader.define('USE_SPECULAR_TEXTURE');
        shader.removeUniform('texSpec');
        shader.removeUniform('texSpecMatCap');
        textureSpecUniform=new CGL.Uniform(shader,'t','texSpec',3);
        textureSpecMatCapUniform=new CGL.Uniform(shader,'t','texSpecMatCap',4);
    }
    else
    {
        shader.removeDefine('USE_SPECULAR_TEXTURE');
        shader.removeUniform('texSpec');
        shader.removeUniform('texSpecMatCap');
        textureSpecUniform=null;
        textureSpecMatCapUniform=null;
    }
};

// TEX OPACITY

function updateAlphaMaskMethod()
{
    if(alphaMaskSource.get()=='Alpha Channel') shader.define('ALPHA_MASK_ALPHA');
        else shader.removeDefine('ALPHA_MASK_ALPHA');

    if(alphaMaskSource.get()=='Luminance') shader.define('ALPHA_MASK_LUMI');
        else shader.removeDefine('ALPHA_MASK_LUMI');

    if(alphaMaskSource.get()=='R') shader.define('ALPHA_MASK_R');
        else shader.removeDefine('ALPHA_MASK_R');

    if(alphaMaskSource.get()=='G') shader.define('ALPHA_MASK_G');
        else shader.removeDefine('ALPHA_MASK_G');

    if(alphaMaskSource.get()=='B') shader.define('ALPHA_MASK_B');
        else shader.removeDefine('ALPHA_MASK_B');
}
alphaMaskSource.onChange=updateAlphaMaskMethod;
textureOpacity.onChange=updateOpacity;

var textureOpacityUniform = null;

function updateOpacity()
{

    if(textureOpacity.get())
    {
        if(textureOpacityUniform!==null)return;
        shader.removeUniform('texOpacity');
        shader.define('HAS_TEXTURE_OPACITY');
        if(!textureOpacityUniform) textureOpacityUniform=new CGL.Uniform(shader,'t','texOpacity',6);

        alphaMaskSource.setUiAttribs({greyout:false});
        discardTransPxl.setUiAttribs({greyout:false});
        texCoordAlpha.setUiAttribs({greyout:false});

    }
    else
    {
        shader.removeUniform('texOpacity');
        shader.removeDefine('HAS_TEXTURE_OPACITY');
        textureOpacityUniform=null;

        alphaMaskSource.setUiAttribs({greyout:true});
        discardTransPxl.setUiAttribs({greyout:true});
        texCoordAlpha.setUiAttribs({greyout:true});
    }
    updateAlphaMaskMethod();
};

discardTransPxl.onChange=function()
{
    if(discardTransPxl.get()) shader.define('DISCARDTRANS');
        else shader.removeDefine('DISCARDTRANS');
};

texCoordAlpha.onChange=function()
{
    if(texCoordAlpha.get()) shader.define('TRANSFORMALPHATEXCOORDS');
        else shader.removeDefine('TRANSFORMALPHATEXCOORDS');
};

op.onDelete=function()
{
    if(CGL.defaultTextureMap)
    {
        CGL.defaultTextureMap.delete();
        CGL.defaultTextureMap=null;
    }
};

op.preRender=function()
{
    shader.bind();
};

render.onTriggered=function()
{
    shader.popTextures();
    if(textureMatcap.get() && textureMatcapUniform)     shader.pushTexture(textureMatcapUniform,textureMatcap.get().tex);
    if(textureDiffuse.get() && textureDiffuseUniform)    shader.pushTexture(textureDiffuseUniform,textureDiffuse.get().tex);
    if(textureNormal.get() && textureNormalUniform)     shader.pushTexture(textureNormalUniform,textureNormal.get().tex);
    if(textureSpec.get() && textureSpecUniform)       shader.pushTexture(textureSpecUniform,textureSpec.get().tex);
    if(textureSpecMatCap.get() && textureSpecMatCapUniform) shader.pushTexture(textureSpecMatCapUniform,textureSpecMatCap.get().tex);
    if(textureAo.get() && textureAoUniform)         shader.pushTexture(textureAoUniform,textureAo.get().tex);
    if(textureOpacity.get() && textureOpacityUniform)    shader.pushTexture(textureOpacityUniform, textureOpacity.get().tex);


    cgl.pushShader(shader);
    next.trigger();
    cgl.popShader();
};

