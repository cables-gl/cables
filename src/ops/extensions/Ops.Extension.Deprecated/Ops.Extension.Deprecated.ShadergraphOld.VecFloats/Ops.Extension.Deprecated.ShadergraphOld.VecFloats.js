const sgOp = new CGL.ShaderGraphOp(this, attachments.shader_frag);

// inAlpha.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    // sgOp.toggleDefine("SETCOLOR_ALPHA", inAlpha.get());
}
