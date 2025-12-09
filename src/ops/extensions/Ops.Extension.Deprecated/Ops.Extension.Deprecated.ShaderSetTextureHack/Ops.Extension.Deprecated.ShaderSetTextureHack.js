op.name = "ShaderSetTextureHack";

let exec = op.inTrigger("Exec");
let next = op.outTrigger("Next");

let iindex = op.inValueInt("index");
let texture = op.inTexture("texture");

let cgl = op.patch.cgl;

let oldBind = null;

let bindTextures = function ()
{
    if (oldBind)oldBind();
    cgl.setTexture(iindex.get(), texture.get().tex);
};

exec.onTriggered = function ()
{
    oldBind = op.patch.cgl.getShader().bindTextures;

    op.patch.cgl.getShader().bindTextures = bindTextures;

    next.trigger();

    op.patch.cgl.getShader().bindTextures = oldBind;
};
