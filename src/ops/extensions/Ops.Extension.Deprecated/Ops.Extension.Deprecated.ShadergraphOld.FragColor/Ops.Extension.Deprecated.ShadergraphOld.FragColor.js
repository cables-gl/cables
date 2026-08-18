const sgOp = new CGL.ShaderGraphOpCgl(this, attachments.shader_frag);

const inAlpha = op.inBool("Alpha always one", true);

inAlpha.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    sgOp.toggleDefine("SETCOLOR_ALPHA", inAlpha.get());
}
