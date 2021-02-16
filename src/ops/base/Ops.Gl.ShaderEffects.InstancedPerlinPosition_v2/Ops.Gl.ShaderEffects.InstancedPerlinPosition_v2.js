const
    render=op.inTrigger("Render"),
    next=op.outTrigger("Next"),
    inStrength=op.inValue("Strength",1),
    scrollx=op.inValue("Scroll X"),
    scrolly=op.inValue("Scroll Y"),
    scrollz=op.inValue("Scroll Z"),
    inWorldSpace=op.inValueBool("WorldSpace");

const cgl=op.patch.cgl;

var srcBodyVert=''
    .endl()+'#ifdef INSTANCING'
    .endl()+'   pos=MOD_deform(instMat,pos);'
    .endl()+'#endif'

    .endl();


const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.perlin_instposition_vert,
    "srcBodyVert": srcBodyVert
});


mod.addUniform('f','MOD_strength',inStrength);
mod.addUniform('f','MOD_scrollx',scrollx);
mod.addUniform('f','MOD_scrolly',scrolly);
mod.addUniform('f','MOD_scrollz',scrollz);


inWorldSpace.onChange=updateWorldspace;

function updateWorldspace()
{
    mod.toggleDefine("MOD_WORLDSPACE",inWorldSpace.get());
}

render.onTriggered=function()
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

    //     updateWorldspace();
    // }

    // if(!shader)return;

mod.bind();
    next.trigger();
    mod.unbind();
};













