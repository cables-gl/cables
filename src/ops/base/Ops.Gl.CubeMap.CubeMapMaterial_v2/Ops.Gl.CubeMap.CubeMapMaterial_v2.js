//https://jmonkeyengine.github.io/wiki/jme3/advanced/pbr_part3.html
//https://learnopengl.com/PBR/IBL/Diffuse-irradiance

const render = op.inTrigger('render');
const inCubemap = op.inObject("Cubemap");
const inUseReflection = op.inValueBool("Use Reflection", false);
const inMiplevel = op.inValueSlider("Blur",0.0);
op.setPortGroup("Appearance", [inMiplevel, inUseReflection]);
const inRotation = op.inFloat("Rotation", 0);
const inFlipX = op.inBool("Flip X", false);
const inFlipY = op.inBool("Flip Y", false);
const inFlipZ = op.inBool("Flip Z", false);

op.setPortGroup("Transforms", [inRotation, inFlipX, inFlipY, inFlipZ]);
const inColorize = op.inBool("Colorize", false);
const inR = op.inFloatSlider("R", Math.random());
const inG = op.inFloatSlider("G", Math.random());
const inB = op.inFloatSlider("B", Math.random());
inR.setUiAttribs({ colorPick: true });

op.setPortGroup("Color", [inColorize, inR, inG, inB]);

inUseReflection.onChange = inCubemap.onChange =
inFlipX.onChange = inFlipY.onChange = inFlipZ.onChange = updateMapping;
inColorize.onChange = function() {
    shader.toggleDefine("COLORIZE", inColorize.get());
    inR.setUiAttribs({ greyout: !inColorize.get() });
    inG.setUiAttribs({ greyout: !inColorize.get() });
    inB.setUiAttribs({ greyout: !inColorize.get() });

}
const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const srcVert=attachments.cubemap_vert;
const srcFrag=attachments.cubemap_frag;


const shader=new CGL.Shader(cgl,'cubemap material');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);



shader.setSource(srcVert,srcFrag);
inMiplevel.uniform=new CGL.Uniform(shader,'f','miplevel', inMiplevel);
const inRotationUniform = new CGL.Uniform(shader, 'f', 'inRotation', inRotation);
const inColorUniform = new CGL.Uniform(shader, "3f", "inColor", inR, inG, inB);
render.onTriggered=doRender;
updateMapping();


function doRender()
{
    cgl.pushShader(shader);

    if(inCubemap.get())
    {
        if(inCubemap.get().cubemap) cgl.setTexture(0, inCubemap.get().cubemap,cgl.gl.TEXTURE_CUBE_MAP);
        else cgl.setTexture(0, inCubemap.get().tex);
    }
    else cgl.setTexture(0, CGL.Texture.getTempTexture(cgl).tex);

    trigger.trigger();
    cgl.popShader();
}

function updateMapping()
{
    shader.toggleDefine("FLIP_X", inFlipX.get());
    shader.toggleDefine("FLIP_Y", inFlipY.get());
    shader.toggleDefine("FLIP_Z", inFlipZ.get());
    shader.toggleDefine("DO_REFLECTION", inUseReflection.get());

    if(inCubemap.get() && inCubemap.get().cubemap)
    {
        shader.define("TEX_FORMAT_CUBEMAP");
        shader.removeDefine("TEX_FORMAT_EQUIRECT");
    }
    else
    {
        shader.removeDefine("TEX_FORMAT_CUBEMAP");
        shader.define("TEX_FORMAT_EQUIRECT");
    }
}


