
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var inAttrib=op.inValueSelect("Attribute",[]);
var inGeom=op.inObject("Geometry");
var limitMax=op.inValue("Max",1000);
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
        .endl()+'UNI float MOD_max;';

    srcBodyFrag=''
        .endl()+'if('+attrName+'Frag>=MOD_max)discard;'
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

        uniMax=new CGL.Uniform(shader,'f',moduleFrag.prefix+'max',limitMax);
    }

    trigger.trigger();
};
