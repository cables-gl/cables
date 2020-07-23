const
    render = op.inTrigger("render"),
    inCubemap = op.inObject("Cubemap"),
    inAmount = op.inValueSlider("Amount", 0.3),
    next = op.outTrigger("next");


const moduleFrag = null;
const moduleVert = null;

const cgl = op.patch.cgl;

render.onLinkChanged = removeModule;

const mod = new CGL.ShaderModifier(cgl, "colorArea");
mod.addModule({
    "title": op.objName,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.cm_reflection_head_vert,
    "srcBodyVert": attachments.cm_reflection_body_vert
});

mod.addModule({
    "title": op.objName,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.cm_reflection_head_frag,
    "srcBodyFrag": attachments.cm_reflection_body_frag
});


mod.addUniformFrag("tc", "MOD_cubemap", inCubemap);
mod.addUniformFrag("f", "MOD_amount", inAmount);

//     inAmount.amount = new CGL.Uniform(shader, "f", "MOD_amount", inAmount);
//     // inCubemap.uni=new CGL.Uniform(shader,'i',moduleFrag.prefix+'cubemap',4);
//     inCubemap.uni = new CGL.Uniform(shader, "tc", "MOD_cubemap");


function removeModule()
{
    // if (shader && moduleFrag) shader.removeModule(moduleFrag);
    // if (shader && moduleVert) shader.removeModule(moduleVert);
    // shader = null;
}


render.onTriggered = function ()
{
    if (!cgl.getShader())
    {
        next.trigger();
        return;
    }

    // if (cgl.getShader() != shader)
    // {
    //     if (shader) removeModule();
    //     shader = cgl.getShader();

    //     moduleVert = shader.addModule(
    //         {
    //             "title": op.objName,
    //             "name": "MODULE_VERTEX_POSITION",
    //             "srcHeadVert": attachments.cm_reflection_head_vert,
    //             "srcBodyVert": attachments.cm_reflection_body_vert
    //         });

    //     moduleFrag = shader.addModule(
    //         {
    //             "title": op.objName,
    //             "name": "MODULE_COLOR",
    //             "srcHeadFrag": attachments.cm_reflection_head_frag,
    //             "srcBodyFrag": attachments.cm_reflection_body_frag
    //         }, moduleVert);

    //     inAmount.amount = new CGL.Uniform(shader, "f", "MOD_amount", inAmount);
    //     // inCubemap.uni=new CGL.Uniform(shader,'i',moduleFrag.prefix+'cubemap',4);
    //     inCubemap.uni = new CGL.Uniform(shader, "tc", "MOD_cubemap");

    //     // diffuseTextureUniform = new CGL.Uniform(shader, "t", "texDiffuse");
    // }

    // cgl.setTexture(4,inCubemap.get().cubemap,cgl.gl.TEXTURE_CUBE_MAP);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, inCubemap.get().cubemap);


    if (inCubemap.get())
    {
        // if(inCubemap.get().cubemap) cgl.setTexture(4,inCubemap.get().cubemap,cgl.gl.TEXTURE_CUBE_MAP);
        // else cgl.setTexture(4,inCubemap.get().tex);

        mod.pushTexture("MOD_cubemap", inCubemap.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);

        // if(inCubemap.get().cubemap)
        // else shader.pushTexture(inCubemap.uni, inCubemap.get().tex);
    }
    else return;
    // else cgl.setTexture(4, CGL.Texture.getTempTexture(cgl).tex);
    mod.bind();

    next.trigger();

    mod.unbind();
};
