const render=op.inTrigger("render");
const inTex=op.inTexture("Texture");
// const setX=op.inBool("Set X",true);
// const setY=op.inBool("Set Y",true);
// const setZ=op.inBool("Set Z",true);
const trigger=op.outTrigger("Trigger");


// var doUpdateDefines=true;
// setX.onChange=setY.onChange=setZ.onChange=function()
// {
//     doUpdateDefines=true;
// };


const cgl=op.patch.cgl;
var shader=null;
var mod=null;
var inTexUniform=null;

render.onLinkChanged=removeModule;
render.onTriggered=doRender;

// updateDefines();

function removeModule()
{
    if(shader && mod)
    {
        shader.removeModule(mod);
        shader=null;
    }
}

function doRender()
{
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
        mod=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.bulge_head_vert||'',
                srcBodyVert:attachments.bulge_body_vert||''
            });

        inTexUniform=new CGL.Uniform(shader,'t',mod.prefix+'tex',3);
    }

    // if(doUpdateDefines)updateDefines();

    if(inTex.get()) cgl.setTexture(3, inTex.get().tex);

    trigger.trigger();
}


// function updateDefines()
// {
//     if(!shader)return;
//     shader.toggleDefine("SET_X",setX.get());
//     shader.toggleDefine("SET_Y",setY.get());
//     shader.toggleDefine("SET_Z",setZ.get());
//     doUpdateDefines=false;

// }
