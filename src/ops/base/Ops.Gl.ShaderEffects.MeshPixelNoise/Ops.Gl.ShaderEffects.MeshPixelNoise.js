const
    render=op.inTrigger("render"),
    next=op.outTrigger("trigger"),
    inScale=op.inValue("Scale",10),
    inAmount=op.inValueSlider("Amount",0.3),
    inWorldSpace=op.inValueBool("WorldSpace");

const
    r = op.inValueSlider("r",0),
    g = op.inValueSlider("g",0),
    b = op.inValueSlider("b",0),
    x = op.inValueSlider("x",0),
    y = op.inValueSlider("y",0),
    z = op.inValueSlider("z",0);
r.setUiAttribs({ colorPick: true });


const cgl=op.patch.cgl;
var shader=null;
var moduleFrag=null;
var moduleVert=null;
inWorldSpace.onChange=updateWorldspace;
render.onLinkChanged=removeModule;


var srcHeadVert=''
    .endl()+'OUT vec4 MOD_pos;'
    .endl();

var srcBodyVert=''
    .endl()+'#ifndef WORLDSPACE'
    .endl()+'   MOD_pos=vec4(pos.xyz,1.0);'
    .endl()+'#endif'
    .endl()+'#ifdef WORLDSPACE'
    .endl()+'   MOD_pos=vec4(pos.xyz,1.0)*mMatrix;'
    .endl()+'#endif'
    .endl();

var srcHeadFrag=attachments.pixelnoise_frag;

var srcBodyFrag=''
    // .endl()+'col.rgb -= MOD_meshPixelNoise(MOD_pos.xyz*MOD_scale)*MOD_amount/4.0;'
    .endl()+'col.rgb -= vec3(1.-MOD_r,1.-MOD_g,1.-MOD_b)*MOD_meshPixelNoise(MOD_pos.xyz*MOD_scale)*MOD_amount/4.0;'
    .endl();

function updateWorldspace()
{
    if(!shader)return;
    if(inWorldSpace.get()) shader.define("WORLDSPACE");
        else shader.removeDefine("WORLDSPACE");
}

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}


render.onTriggered=function()
{
    if(!cgl.getShader())
    {
         next.trigger();
         return;
    }

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();

        moduleVert=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        moduleFrag=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_COLOR',
                srcHeadFrag:attachments.pixelnoise_frag,
                srcBodyFrag:srcBodyFrag
            },moduleVert);

        inScale.scale=new CGL.Uniform(shader,'f',moduleFrag.prefix+'scale',inScale);
        inAmount.amount=new CGL.Uniform(shader,'f',moduleFrag.prefix+'amount',inAmount);
        new CGL.Uniform(shader,'f',moduleFrag.prefix+'r',r);
        new CGL.Uniform(shader,'f',moduleFrag.prefix+'g',g);
        new CGL.Uniform(shader,'f',moduleFrag.prefix+'b',b);
        new CGL.Uniform(shader,'f',moduleFrag.prefix+'x',x);
        new CGL.Uniform(shader,'f',moduleFrag.prefix+'y',y);
        new CGL.Uniform(shader,'f',moduleFrag.prefix+'z',z);
        updateWorldspace();
    }

    if(!shader)return;

    next.trigger();
};
