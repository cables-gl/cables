var cgl=op.patch.cgl;

op.render=op.addInPort(new Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var inStrength=op.inValue("Amount",1);

var inStart=op.inValue("Start Index",0);
var inWidth=op.inValue("Width",20);
var inHasEnd=op.inValueBool("Ending",true);
var inTransDist=op.inValue("Transition Distance",50);

var inPosX=op.inValue("Pos X",0);
var inPosY=op.inValue("Pos Y",0);
var inPosZ=op.inValue("Pos Z",0);

var inRotX=op.inValue("Rot X",0);
var inRotY=op.inValue("Rot Y",0);
var inRotZ=op.inValue("Rot Z",0);

var inScaleX=op.inValue("Scale X",1);
var inScaleY=op.inValue("Scale Y",1);
var inScaleZ=op.inValue("Scale Z",1);




var shader=null;


// var srcHeadVert=attachments.perlin_instposition_vert||'';

var srcBodyVert=attachments.transform_instanced_vert||'';
var srcHeadVert=attachments.transform_instanced_head_vert||'';


//     .endl()+'instanceIndexFrag=instanceIndex;'
//     .endl();


// .endl()+'IN float instanceIndex;'
// .endl()+'OUT float instanceIndexFrag;'
// .endl();


var moduleVert=null;
var moduleFrag=null;
function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}


op.render.onLinkChanged=removeModule;

inHasEnd.onChange=updateEnding;

function updateEnding()
{
    if(shader)
        if(inHasEnd.get())shader.define(moduleVert.prefix+"HAS_ENDING");
            else shader.removeDefine(moduleVert.prefix+"HAS_ENDING");
}


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

        op.uniRotX=new CGL.Uniform(shader,'f',moduleVert.prefix+'rotX',inRotX);
        op.uniRotY=new CGL.Uniform(shader,'f',moduleVert.prefix+'rotY',inRotY);
        op.uniRotZ=new CGL.Uniform(shader,'f',moduleVert.prefix+'rotZ',inRotZ);

        op.uniposX=new CGL.Uniform(shader,'f',moduleVert.prefix+'posX',inPosX);
        op.uniposY=new CGL.Uniform(shader,'f',moduleVert.prefix+'posY',inPosY);
        op.uniposZ=new CGL.Uniform(shader,'f',moduleVert.prefix+'posZ',inPosZ);

        op.uniscaleX=new CGL.Uniform(shader,'f',moduleVert.prefix+'scaleX',inScaleX);
        op.uniscaleY=new CGL.Uniform(shader,'f',moduleVert.prefix+'scaleY',inScaleY);
        op.uniscaleZ=new CGL.Uniform(shader,'f',moduleVert.prefix+'scaleZ',inScaleZ);
        
        op.uniStart=new CGL.Uniform(shader,'f',moduleVert.prefix+'start',inStart);
        op.uniEnd=new CGL.Uniform(shader,'f',moduleVert.prefix+'width',inWidth);
        op.uniTrans=new CGL.Uniform(shader,'f',moduleVert.prefix+'transDist',inTransDist);
        

        inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
        updateEnding();
    }
    


    if(!shader)return;

    op.trigger.trigger();
};













