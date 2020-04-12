
const
    render=op.inTrigger("render"),
    inTex=op.inTexture("Texture"),

    inStrength=op.inFloat("Multiply",1),
    inWhat=op.inSwitch("Transform",['Translate','Scale'],'Translate'),
    inInput=op.inSwitch("Input",['R','G','B'],'R'),
    inAxis=op.inSwitch("Axis",['X','Y','Z','All'],'Z'),
    inMeth=op.inSwitch("Method",['+','-','*','/'],'+'),
    inNormalize=op.inBool("Normalize",false),
    inSmoothstep=op.inBool("Smoothstep",false),
    inColorize=op.inBool("Colorize",true),
    inColorMul=op.inFloat("Color Mul",1),

    next=op.outTrigger("Next"),
    outArr=op.outArray("Position Array");

const cgl=op.patch.cgl;

var posArr=[];
var shader=null;

inAxis.onChange=
inMeth.onChange=
inInput.onChange=
inWhat.onChange=
inColorize.onChange=
inNormalize.onChange=
    updateDefines;


var srcHeadVert=''
    .endl()+'#ifndef ATTRIB_instanceIndex'
    .endl()+'  #define ATTRIB_instanceIndex'
    .endl()+'  IN float instanceIndex;'
    .endl()+'#endif'
    .endl()+'#ifdef MOD_COLORIZE'
    .endl()+'   OUT vec4 MOD_color;'
    .endl()+'#endif'
    .endl()+'UNI sampler2D MOD_tex;'
    .endl()+'UNI float MOD_strength;'

    .endl();



var srcHeadFrag=''
    .endl()+'#ifdef MOD_COLORIZE'
    .endl()+'   UNI float MOD_colorMul;'
    .endl()+'   IN vec4 MOD_color;'
    .endl()+'#endif'
    .endl();

var srcBodyFrag=''
    .endl()+'#ifdef MOD_COLORIZE'
    .endl()+'   col*=MOD_color*MOD_colorMul;'
    .endl()+'#endif'
    .endl();

var moduleVert=null;
var moduleFrag=null;
function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    shader=null;
}

op.onDelete=removeModule;
render.onLinkChanged=removeModule;
inTex.onChange=updateLookupTexture;



function updateDefines()
{
    if(!shader)return;
    shader.toggleDefine(moduleVert.prefix+"AXIS_X",inAxis.get()=="X");
    shader.toggleDefine(moduleVert.prefix+"AXIS_Y",inAxis.get()=="Y");
    shader.toggleDefine(moduleVert.prefix+"AXIS_Z",inAxis.get()=="Z");
    shader.toggleDefine(moduleVert.prefix+"AXIS_ALL",inAxis.get()=="All");

    shader.toggleDefine(moduleVert.prefix+"INPUT_R",inInput.get()=="R");
    shader.toggleDefine(moduleVert.prefix+"INPUT_G",inInput.get()=="G");
    shader.toggleDefine(moduleVert.prefix+"INPUT_B",inInput.get()=="B");

    shader.toggleDefine(moduleVert.prefix+"MATH_ADD",inMeth.get()=="+");
    shader.toggleDefine(moduleVert.prefix+"MATH_SUB",inMeth.get()=="-");
    shader.toggleDefine(moduleVert.prefix+"MATH_MUL",inMeth.get()=="*");
    shader.toggleDefine(moduleVert.prefix+"MATH_DIV",inMeth.get()=="/");

    shader.toggleDefine(moduleVert.prefix+"NORMALIZE",inNormalize.get());
    shader.toggleDefine(moduleVert.prefix+"COLORIZE",inColorize.get());
    shader.toggleDefine(moduleVert.prefix+"SMOOTHSTEP",inSmoothstep.get());

}


function updateLookupTexture()
{
    if(!inTex.get()) return;
    if(!shader)return;



    const tex=inTex.get();

    shader.define(moduleVert.prefix+"TEX_WIDTH",tex.width+".0");
    shader.define(moduleVert.prefix+"TEX_HEIGHT",tex.height+".0");

    const wh=tex.width*tex.height;
    const w=tex.width;
    const h=tex.height;
    const stepX=1/tex.width;
    const stepY=stepX;
    posArr.length=wh*3;

    var idx=0;
    for(var x=0;x<w;x++)
    {
        for(var y=0;y<h;y++)
        {
            idx=(x+y*w)*3;
            posArr[idx+0]=(x-w/2)*stepX;
            posArr[idx+1]=(y-h/2)*stepY;
            posArr[idx+2]=0;
        }
    }

    outArr.set(null);
    outArr.set(posArr);
}

render.onTriggered=function()
{
    if(inTex.get())
    {

        if(!cgl.getShader())
        {
            //  next.trigger();
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
                    srcBodyVert:attachments.transformByTex_vert
                });


            moduleFrag=shader.addModule(
                {
                    title:op.objName,
                    name:'MODULE_COLOR',
                    srcHeadFrag:srcHeadFrag,
                    srcBodyFrag:srcBodyFrag
                },moduleVert);

            inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
            inTex.uniform=new CGL.Uniform(shader,'t',moduleVert.prefix+'tex',0);

inColorMul.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'colorMul',inColorMul);


            updateDefines();
            updateLookupTexture();
        }


        shader.pushTexture(inTex.uniform,inTex.get().tex);

        cgl.setTexture(7,inTex.get().tex);
    }


    next.trigger();
};













