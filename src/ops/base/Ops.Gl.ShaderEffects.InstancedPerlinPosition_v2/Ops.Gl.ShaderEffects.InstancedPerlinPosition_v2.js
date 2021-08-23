const
    render = op.inTrigger("Render"),
    next = op.outTrigger("Next"),
    inStrength = op.inValue("Strength", 1),
    scrollx = op.inValue("Scroll X"),
    scrolly = op.inValue("Scroll Y"),
    scrollz = op.inValue("Scroll Z"),
    scale = op.inValue("Scale", 1),
    meth = op.inSwitch("Method", ["Translate", "Scale"], "Translate"),
    mulx = op.inValue("Mul X", 1),
    muly = op.inValue("Mul Y", 1),
    mulz = op.inValue("Mul Z", 1),
    minScale = op.inValue("Min Scale", 0),
    inWorldSpace = op.inValueBool("WorldSpace");

const cgl = op.patch.cgl;

let srcBodyVert = ""
    .endl() + "#ifdef INSTANCING"
    .endl() + "   pos=MOD_deform(mMatrix,instMat,pos);"
    .endl() + "#endif"
    .endl() + "#ifndef INSTANCING"
    .endl() + "   pos=MOD_deform(mMatrix,mMatrix,pos);"
    .endl() + "#endif"

    .endl();

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.perlin_instposition_vert,
    "srcBodyVert": srcBodyVert
});

mod.addUniform("f", "MOD_strength", inStrength);
mod.addUniform("f", "MOD_scrollx", scrollx);
mod.addUniform("f", "MOD_scrolly", scrolly);
mod.addUniform("f", "MOD_scrollz", scrollz);
mod.addUniform("f", "MOD_scale", scale);
mod.addUniform("f", "MOD_minScale", minScale);
mod.addUniform("3f", "MOD_mulAxis", mulx, muly, mulz);

meth.onChange =
inWorldSpace.onChange = updateDefines;

function updateDefines()
{
    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());
    mod.toggleDefine("MOD_METH_TRANSLATE", meth.get() == "Translate");
    mod.toggleDefine("MOD_METH_SCALE", meth.get() == "Scale");
}

render.onTriggered = function ()
{
    // if(!cgl.getShader())
    // {
    //      next.trigger();
    //      return;
    // }

    // if(cgl.getShader()!=shader)
    // {
    //     // if(shader) removeModule();
    //     shader=cgl.getShader();

    //     moduleVert=shader.addModule(
    //         {
    //             title:op.objName,
    //             name:'MODULE_VERTEX_POSITION',
    //             srcHeadVert:srcHeadVert,
    //             srcBodyVert:srcBodyVert
    //         });

    //     inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);

    //     scrollx.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrollx',scrollx);
    //     scrolly.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrolly',scrolly);
    //     scrollz.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrollz',scrollz);

    //     updateDefines();
    // }

    // if(!shader)return;

    mod.bind();
    next.trigger();
    mod.unbind();
};
