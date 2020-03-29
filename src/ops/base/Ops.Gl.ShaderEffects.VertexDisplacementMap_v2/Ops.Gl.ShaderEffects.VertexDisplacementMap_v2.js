
const
    render=op.inTrigger("render"),
    texture=op.inTexture("texture"),
    meth=op.inValueSelect("mode",['normal','normal xy','mul xyz','sub x','add x','add y','add z','mul y','mul z','sub z'],"normal"),
    extrude=op.inValue("extrude",0.5),
    flip=op.inValueBool("flip",true),

    removeZero=op.inValueBool("Ignore Zero Values"),
    invert=op.inValueBool("invert"),
    offsetX=op.inValueFloat("offset X"),
    offsetY=op.inValueFloat("offset Y"),

    colorize=op.inValueBool("colorize",false),
    colorizeAdd=op.inValueSlider("colorize add"),

    next=op.outTrigger("trigger");

const cgl=op.patch.cgl;
var shader=null;
var uniExtrude,uniTexture;
var moduleFrag=null;
var moduleVert=null;

var uniTexture=null;
var uniTextureFrag=null;
var uniExtrude=null;
var uniOffsetX=null;
var uniOffsetY=null;
var uniColorizeAdd=null;

op.toWorkPortsNeedToBeLinked(texture,next,render);

render.onLinkChanged=removeModule;
render.onTriggered=dorender;

colorize.onChange=
    invert.onChange=
    removeZero.onChange=
    flip.onChange=
    meth.onChange=updateDefines;

const srcHeadVert=''
    .endl()+'UNI float MOD_extrude;'
    .endl()+'UNI sampler2D MOD_texture;'
    .endl()+'UNI float MOD_offsetX;'
    .endl()+'UNI float MOD_offsetY;'
    .endl()+'OUT float MOD_displHeightMapColor;'
    .endl();

const srcBodyVert=attachments.vertdisplace_body_vert;

const srcHeadFrag=''
    .endl()+'UNI float MOD_colorizeAdd;'
    .endl()+'IN float MOD_displHeightMapColor;'
    .endl()+'UNI sampler2D MOD_texture;'
    .endl();

const srcBodyFrag=''
    .endl()+'#ifdef MOD_HEIGHTMAP_COLORIZE'
    .endl()+'   col.rgb*=MOD_displHeightMapColor*(1.0-MOD_colorizeAdd);'
    .endl()+'   col+=MOD_colorizeAdd;'
    .endl()+'#endif'

    .endl()+'#ifdef MOD_DISPLACE_REMOVE_ZERO'
    .endl()+'.   if(MOD_displHeightMapColor==0.0)discard;'
    .endl()+'#endif'
    .endl();



function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

function updateDefines()
{
    if(!shader) return;

    shader.toggleDefine(moduleVert.prefix+'HEIGHTMAP_COLORIZE',colorize.get());
    shader.toggleDefine(moduleVert.prefix+'HEIGHTMAP_INVERT',invert.get());
    shader.toggleDefine(moduleVert.prefix+'DISPLACE_REMOVE_ZERO',removeZero.get());

    shader.toggleDefine(moduleVert.prefix+'FLIPY',flip.get());
    shader.toggleDefine(moduleVert.prefix+'DISPLACE_METH_MULXYZ',meth.get()=='mul xyz');
    shader.toggleDefine(moduleVert.prefix+'DISPLACE_METH_ADDZ',meth.get()=='add z');
    shader.toggleDefine(moduleVert.prefix+'DISPLACE_METH_ADDY',meth.get()=='add y');
    shader.toggleDefine(moduleVert.prefix+'DISPLACE_METH_ADDX',meth.get()=='add x');
    shader.toggleDefine(moduleVert.prefix+'DISPLACE_METH_SUBX',meth.get()=='sub x');
    shader.toggleDefine(moduleVert.prefix+'DISPLACE_METH_MULY',meth.get()=='mul y');
    shader.toggleDefine(moduleVert.prefix+'DISPLACE_METH_MULZ',meth.get()=='mul z');
    shader.toggleDefine(moduleVert.prefix+'DISPLACE_METH_NORMAL',meth.get()=='normal');
    shader.toggleDefine(moduleVert.prefix+'DISPLACE_METH_NORMAL_XY',meth.get()=='normal xy');
}

function dorender()
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

        uniTexture=new CGL.Uniform(shader,'t',moduleVert.prefix+'texture',0);
        uniExtrude=new CGL.Uniform(shader,'f',moduleVert.prefix+'extrude',extrude);
        uniOffsetX=new CGL.Uniform(shader,'f',moduleVert.prefix+'offsetX',offsetX);
        uniOffsetY=new CGL.Uniform(shader,'f',moduleVert.prefix+'offsetY',offsetY);

        moduleFrag=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_COLOR',
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag
            });
        uniColorizeAdd=new CGL.Uniform(shader,'f',moduleFrag.prefix+'colorizeAdd',colorizeAdd);

        updateDefines();
    }

    if(!shader)return;

    if(texture.get()) shader.pushTexture(uniTexture,texture.get().tex);
    else shader.pushTexture(uniTexture,CGL.Texture.getEmptyTexture(cgl).tex);

    next.trigger();
}
