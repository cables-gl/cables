
var cgl=op.patch.cgl;
var shader=null;
var uniTime;

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
        .endl()+'OUT '+attrType+' '+attrName+'Frag;'
        .endl()+'IN '+attrType+' '+attrName+';'
        .endl();

    srcBodyVert=''
        .endl()+''+attrName+'Frag='+attrName+';'
        .endl();

    srcHeadFrag=''
        .endl()+'UNI float MOD_max;'
        .endl()+'IN '+attrType+' '+attrName+'Frag;'
        .endl();

    srcBodyFrag=''
        .endl()+'if('+attrName+'Frag>=MOD_max)discard;'
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
        // setDefines();
    }

    // uniTime.setValue(Date.now()/1000.0-startTime);
    trigger.trigger();
};
