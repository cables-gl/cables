

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var inAttrib=op.inValueSelect("Attribute",[]);
var inGeom=op.inObject("Geometry");
var inSeed=op.inValue("Seed",1000);
var inMin=op.inValueSlider("Min",0.0);
var inMax=op.inValueSlider("Max",1.0);
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var srcHeadVert='';
var srcBodyVert='';
var srcHeadFrag='';
var srcBodyFrag='';

var attribs=null;

var startTime=Date.now()/1000.0;
render.onLinkChanged=removeModule;
trigger.onLinkChanged=removeModule;
needsCodeUpdate=true;

var moduleFrag=null;
var module=null;
var cgl=op.patch.cgl;
var shader=null;
var uniTime;

function removeModule()
{
    if(shader)
    {
        shader.removeModule(module);
        shader.removeModule(moduleFrag);

        shader=null;
    }
    needsCodeUpdate=true;
}

inAttrib.onChange=function()
{
    needsCodeUpdate=true;
};

function updateCode()
{
    var attrName='';
    var attrType='';
    for(var i in attribs)
    {
        if(i==inAttrib.get())
        {
            attrName=i;
            if(attribs[i].itemSize==1)attrType='float';
            else if(attribs[i].itemSize==2)attrType='vec2';
            else if(attribs[i].itemSize==3)attrType='vec3';
            else if(attribs[i].itemSize==4)attrType='vec4';
        }
    }
    
    if(attrName==='')return;

    srcHeadVert=''
        .endl()+'#ifndef ATTRIB_'+attrName+'Frag'
        .endl()+'#define ATTRIB_'+attrName+'Frag'
        .endl()+'OUT '+attrType+' '+attrName+'Frag;'
        .endl()+'#endif'


        .endl()+'#ifndef ATTRIB_'+attrName
        .endl()+'#define ATTRIB_'+attrName
        .endl()+'IN '+attrType+' '+attrName+';'
        .endl()+'#endif'
        .endl();

    srcBodyVert=''
        .endl()+''+attrName+'Frag='+attrName+';'
        .endl();

    srcHeadFrag=''
        .endl()+'UNI float MOD_seed;'
        .endl()+'#ifndef ATTRIB_'+attrName+'Frag'
        .endl()+'#define ATTRIB_attrSubmeshFrag'
        .endl()+'IN '+attrType+' '+attrName+'Frag;'
        .endl()+'#endif'
        
        .endl()+'UNI float MOD_min;'
        .endl()+'UNI float MOD_max;'

        .endl()+'float MOD_rand(vec2 co){'
        .endl()+'    return fract(sin(dot(co.xy ,vec2(12.9,78.2))) * 43758.3);'
        .endl()+'}'

        .endl();

    srcBodyFrag=''
        .endl()+'float MOD_coord=round('+attrName+'Frag*1000.0)/1000.0+MOD_seed;'
        .endl()+'col.rgb*= (MOD_rand(vec2(MOD_coord))*(MOD_max-MOD_min))+MOD_min ;'
        .endl();
    
    
    needsCodeUpdate=false;
}

function updateAttribSelect()
{
    var attrNames=[];
    // attribs
    for(var i in attribs)
    {
        attrNames.push(i);

    }
    inAttrib.uiAttribs.values=attrNames;
}

inGeom.onChange=function()
{
    var geom=inGeom.get();
    if(geom)
    {
        attribs=geom.getAttributes();
    }
    else
    {
        attribs=null;
    }
    updateAttribSelect();
};

render.onTriggered=function()
{
    if(!cgl.getShader())return;
    if(cgl.getShader()!=shader || needsCodeUpdate  || !srcHeadVert || !srcBodyVert || !srcHeadFrag || !srcBodyFrag)
    {
        removeModule();
        shader=cgl.getShader();
        if(!shader)return;
        
        if(needsCodeUpdate|| !srcHeadVert || !srcBodyVert || !srcHeadFrag || !srcBodyFrag)
        {
            updateCode();
        }

        module=shader.addModule(
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
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag
            });

        inSeed.uni=new CGL.Uniform(shader,'f',moduleFrag.prefix+'seed',inSeed);
        inMin.uni=new CGL.Uniform(shader,'f',moduleFrag.prefix+'min',inMin);
        inMax.uni=new CGL.Uniform(shader,'f',moduleFrag.prefix+'max',inMax);
    }

    trigger.trigger();
};
