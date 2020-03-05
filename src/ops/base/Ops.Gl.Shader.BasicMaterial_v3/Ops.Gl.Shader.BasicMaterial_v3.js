const render=op.inTrigger("render");


const trigger=op.outTrigger('trigger');
const shaderOut=op.outObject("shader");

shaderOut.ignoreValueSerialize=true;

const cgl=op.patch.cgl;

op.toWorkPortsNeedToBeLinked(render);

const shader=new CGL.Shader(cgl,"basicmaterialnew");
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.setSource(attachments.basicmaterial_vert,attachments.basicmaterial_frag);
shaderOut.set(shader);

render.onTriggered=doRender;


// rgba colors
const r=op.inValueSlider("r",Math.random());
const g=op.inValueSlider("g",Math.random());
const b=op.inValueSlider("b",Math.random());
const a=op.inValueSlider("a",1);
r.setUiAttribs({"colorPick":true});

const uniColor=new CGL.Uniform(shader,'4f','color',r,g,b,a);

// diffuse outTexture

const diffuseTexture=op.inTexture("texture");
var diffuseTextureUniform=null;
diffuseTexture.onChange=updateDiffuseTexture;

const colorizeTexture=op.inValueBool("colorizeTexture",false);

// opacity texture
const textureOpacity=op.inTexture("textureOpacity");
var textureOpacityUniform=null;

const alphaMaskSource=op.inSwitch("Alpha Mask Source",["Luminance","R","G","B","A"],"Luminance");
alphaMaskSource.setUiAttribs({greyout:true});
textureOpacity.onChange=updateOpacity;

const texCoordAlpha=op.inValueBool("Opacity TexCoords Transform",false);
const discardTransPxl=op.inValueBool("Discard Transparent Pixels");


// texture coords

const diffuseRepeatX=op.inValue("diffuseRepeatX",1);
const diffuseRepeatY=op.inValue("diffuseRepeatY",1);
const diffuseOffsetX=op.inValue("Tex Offset X",0);
const diffuseOffsetY=op.inValue("Tex Offset Y",0);

const diffuseRepeatXUniform=new CGL.Uniform(shader,'f','diffuseRepeatX',diffuseRepeatX);
const diffuseRepeatYUniform=new CGL.Uniform(shader,'f','diffuseRepeatY',diffuseRepeatY);
const diffuseOffsetXUniform=new CGL.Uniform(shader,'f','texOffsetX',diffuseOffsetX);
const diffuseOffsetYUniform=new CGL.Uniform(shader,'f','texOffsetY',diffuseOffsetY);

const doBillboard=op.inValueBool("billboard",false);

alphaMaskSource.onChange=
    doBillboard.onChange=
    discardTransPxl.onChange=
    texCoordAlpha.onChange=
    colorizeTexture.onChange=updateDefines;


op.setPortGroup("Color",[r,g,b,a]);
op.setPortGroup("Color Texture",[diffuseTexture,colorizeTexture]);
op.setPortGroup("Opacity",[textureOpacity,alphaMaskSource,discardTransPxl,texCoordAlpha]);
op.setPortGroup("Texture Transform",[diffuseRepeatX,diffuseRepeatY,diffuseOffsetX,diffuseOffsetY]);


updateOpacity();
updateDiffuseTexture();



op.preRender=function()
{
    shader.bind();
    doRender();
};

function doRender()
{
    if(!shader)return;

    cgl.pushShader(shader);
    shader.popTextures();

    if(diffuseTextureUniform && diffuseTexture.get()) shader.pushTexture(diffuseTextureUniform,diffuseTexture.get().tex);
    if(textureOpacityUniform && textureOpacity.get()) shader.pushTexture(textureOpacityUniform,textureOpacity.get().tex);
    trigger.trigger();

    cgl.popShader();
}

function updateOpacity()
{
    if(textureOpacity.get())
    {
        if(textureOpacityUniform!==null)return;
        shader.removeUniform('texOpacity');
        shader.define('HAS_TEXTURE_OPACITY');
        if(!textureOpacityUniform)textureOpacityUniform=new CGL.Uniform(shader,'t','texOpacity',1);

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

    updateDefines();
}

function updateDiffuseTexture()
{
    if(diffuseTexture.get())
    {
        if(!shader.hasDefine('HAS_TEXTURE_DIFFUSE'))shader.define('HAS_TEXTURE_DIFFUSE');
        if(!diffuseTextureUniform)diffuseTextureUniform=new CGL.Uniform(shader,'t','texDiffuse',0);

        diffuseRepeatX.setUiAttribs({greyout:false});
        diffuseRepeatY.setUiAttribs({greyout:false});
        diffuseOffsetX.setUiAttribs({greyout:false});
        diffuseOffsetY.setUiAttribs({greyout:false});
        colorizeTexture.setUiAttribs({greyout:false});
    }
    else
    {
        shader.removeUniform('texDiffuse');
        shader.removeDefine('HAS_TEXTURE_DIFFUSE');
        diffuseTextureUniform=null;

        diffuseRepeatX.setUiAttribs({greyout:true});
        diffuseRepeatY.setUiAttribs({greyout:true});
        diffuseOffsetX.setUiAttribs({greyout:true});
        diffuseOffsetY.setUiAttribs({greyout:true});
        colorizeTexture.setUiAttribs({greyout:true});
    }
}

function updateDefines()
{
    shader.toggleDefine('COLORIZE_TEXTURE', colorizeTexture.get());
    shader.toggleDefine('TRANSFORMALPHATEXCOORDS', texCoordAlpha.get());
    shader.toggleDefine('DISCARDTRANS', discardTransPxl.get());
    shader.toggleDefine('BILLBOARD', doBillboard.get());

    shader.toggleDefine('ALPHA_MASK_ALPHA', alphaMaskSource.get()=='Alpha Channel');
    shader.toggleDefine('ALPHA_MASK_LUMI', alphaMaskSource.get()=='Luminance');
    shader.toggleDefine('ALPHA_MASK_R', alphaMaskSource.get()=='R');
    shader.toggleDefine("ALPHA_MASK_G", alphaMaskSource.get()=='G');
    shader.toggleDefine('ALPHA_MASK_B', alphaMaskSource.get()=='B');
}


