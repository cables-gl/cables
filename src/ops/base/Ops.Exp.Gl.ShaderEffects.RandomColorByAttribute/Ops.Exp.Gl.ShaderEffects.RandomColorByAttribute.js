

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var inAttrib=op.inValueSelect("Attribute",[]);
var inGeom=op.inObject("Geometry");
var limitMax=op.inValue("Max",1000);
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var srcHeadVert='';
var srcBodyVert='';
var srcHeadFrag='';
var srcBodyFrag='';

var attribs=null;

var startTime=Date.now()/1000.0;
render.onLinkChanged=removeModule;
needsCodeUpdate=true;

var moduleFrag=null;
var module=null;
var cgl=op.patch.cgl;
var shader=null;
var uniTime;

function removeModule()
{
    if(shader && module)
    {
        shader.removeModule(module);
        shader.removeModule(moduleFrag);

        shader=null;
    }
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
        .endl()+'#ifndef ATTRIB_'+attrName+''
        .endl()+'#define ATTRIB_attrSubmesh'
        .endl()+'OUT '+attrType+' '+attrName+'Frag;'
        .endl()+'IN '+attrType+' '+attrName+';'
        .endl()+'#endif'
        .endl();

    srcBodyVert=''
        .endl()+''+attrName+'Frag='+attrName+';'
        .endl();

    srcHeadFrag=''
        .endl()+'UNI float MOD_max;'
        .endl()+'#ifndef ATTRIB_'+attrName+''
        .endl()+'#define ATTRIB_attrSubmesh'
        .endl()+'IN '+attrType+' '+attrName+'Frag;'
        .endl()+'#endif'
        
        
.endl()+'float PHI = 1.61803398874989484820459 * 00000.1; // Golden Ratio   '
.endl()+'float PI  = 3.14159265358979323846264 * 00000.1; // PI'
.endl()+'float SRT = 1.41421356237309504880169 * 10000.0; // Square Root of Two'


// Gold Noise function
//
.endl()+'float MOD_gold_noise(in vec2 coordinate, in float seed)'
.endl()+'{'
.endl()+'    return fract(sin(dot(coordinate*seed, vec2(PHI, PI)))*SRT);'
.endl()+'}'

        // .endl()+'float rand(vec2 co){'
        // .endl()+'    return fract(sin(dot(co.xy ,vec2(12.9,78.2))) * 43758.3);'
        // .endl()+'}'

        .endl();

    srcBodyFrag=''
        .endl()+'col.rgb*=MOD_gold_noise(vec2('+attrName+'Frag+MOD_max,'+attrName+'Frag),MOD_max);'
        // .endl()+'col.rgb*=mod('+attrName+'Frag,0.1)*10.0;'
        // .endl()+'col.g=rand(vec2(MOD_max,MOD_max));'
        
        // .endl()+'col.g=1.0;'
        .endl();
    
    if(shader)shader.dispose();
    shader=null;
    
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
    if(needsCodeUpdate)updateCode();
    
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
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

        uniMax=new CGL.Uniform(shader,'f',moduleFrag.prefix+'max',limitMax);
    }

    trigger.trigger();
};
