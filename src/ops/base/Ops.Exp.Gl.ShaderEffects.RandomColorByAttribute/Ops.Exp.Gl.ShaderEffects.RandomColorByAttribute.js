
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var inAttrib=op.inValueSelect("Attribute",[]);
var inGeom=op.inObject("Geometry");
var inSeed=op.inValue("Seed",1000);
var inMin=op.inValueSlider("Min",0.0);
var inMax=op.inValueSlider("Max",1.0);

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var srcHeadFrag='';
var srcBodyFrag='';

var attribs=null;

render.onLinkChanged=removeModule;
trigger.onLinkChanged=removeModule;
needsCodeUpdate=true;

var cgl=op.patch.cgl;
var shader=null;
var uniTime;
var moduleFrag=null;
var module=null;
var attrName='';
var attrType='';

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
    if(attrName==='')return;

    srcHeadFrag=''
        .endl()+'UNI float MOD_seed;'
        .endl()+'UNI float MOD_min;'
        .endl()+'UNI float MOD_max;'

        .endl()+'float MOD_round(float user_a) {'
        .endl()+'   return floor((user_a+0.5));'
        .endl()+'}'

        .endl()+'float MOD_rand(vec2 co){'
        .endl()+'    return fract(sin(dot(co.xy ,vec2(12.9,78.2))) * 43758.3);'
        .endl()+'}'
        .endl();

    srcBodyFrag=''

        .endl()+'float MOD_coord=MOD_round('+attrName+'Frag*1000.0)/1000.0+MOD_seed;'
        .endl()+'col.rgb*= (MOD_rand(vec2(MOD_coord))*(MOD_max-MOD_min))+MOD_min ;'
        .endl();

    needsCodeUpdate=false;
}

function updateAttribSelect()
{
    var attrNames=[];
    for(var i in attribs) attrNames.push(i);
    inAttrib.uiAttribs.values=attrNames;
}

inGeom.onChange=function()
{
    var geom=inGeom.get();
    if(geom) attribs=geom.getAttributes();
        else attribs=null;
    updateAttribSelect();
};

render.onTriggered=function()
{
    if(!inGeom.get())return;
    if(cgl.getShader()!=shader || needsCodeUpdate || !srcBodyFrag)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
        if(!shader)return;
        if(needsCodeUpdate|| !srcHeadFrag || !srcBodyFrag) updateCode();

        var attr=inGeom.get().getAttribute(inAttrib.get());
        attrName=inAttrib.get();
        attrType=attr.type;

        shader.addAttribute(
            {
                type:attrType,
                name:attrName,
                nameFrag:attrName+'Frag'
            });

        shader.removeModule(moduleFrag);
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
