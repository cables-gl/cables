const cgl=op.patch.cgl;
var id='mod'+Math.floor(Math.random()*10000);

op.render=op.inTrigger("render");
op.trigger=op.outTrigger("trigger");

var inStart=op.inValue("Start",2);
var inEnd=op.inValue("End",12);

var inAmount=op.inValueSlider("Amount",0.5);


const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
r.setUiAttribs({ colorPick: true });


var shader=null;

var srcHeadVert=''
    .endl()+'OUT vec4 MOD_fogPos;'
    .endl();

var srcBodyVert=''
    .endl()+'MOD_fogPos=viewMatrix*modelMatrix*pos;'
    .endl();

var srcHeadFrag=''
    .endl()+'IN vec4 MOD_fogPos;'
    .endl()+'UNI float MOD_start;'
    .endl()+'UNI float MOD_end;'
    .endl()+'UNI float MOD_amount;'

    .endl()+'UNI float MOD_r;'
    .endl()+'UNI float MOD_g;'
    .endl()+'UNI float MOD_b;'
    .endl();

var srcBodyFrag=''
    .endl()+'   float MOD_de=(MOD_fogPos.z+MOD_start)/(-1.0*MOD_end);'
    .endl()+'   col.rgb=mix(col.rgb,vec3(MOD_r,MOD_g,MOD_b), clamp(MOD_de*MOD_amount,0.0,1.0));'
    .endl();


var moduleFrag=null;
var moduleVert=null;

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}



op.render.onLinkChanged=removeModule;

op.render.onTriggered=function()
{
    if(!cgl.getShader())
    {
         op.trigger.trigger();
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

        // uniOffsetX=new CGL.Uniform(shader,'f',moduleVert.prefix+'_offsetX',offsetX);
        // uniOffsetY=new CGL.Uniform(shader,'f',moduleVert.prefix+'_offsetY',offsetY);


        moduleFrag=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_COLOR',
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag
            },moduleVert);
        inStart.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'start',inStart);
        inEnd.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'end',inEnd);
        inAmount.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'amount',inAmount);
        r.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'r',r);
        g.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'g',g);
        b.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'b',b);


    }


    if(!shader)return;
    var texSlot=moduleVert.num+5;

    op.trigger.trigger();
};













