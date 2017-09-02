op.name="Shadow";

var cgl=op.patch.cgl;
var id='mod'+Math.floor(Math.random()*10000);

op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inScale=op.inValue("Scale",10);

inAmount=op.inValueSlider("Amount",0.3);



var shader=null;

var srcHeadVert=''
    .endl()+'OUT vec4 MOD_positionFromLight;'
    .endl()+'UNI mat4 MOD_lightMVP;'

    // .endl()+'UNI mat4 projMatrix;'
    // .endl()+'UNI mat4 modelMatrix;'
    // .endl()+'UNI mat4 viewMatrix;'
    .endl();

var srcBodyVert=''
        // mat4 mvMatrix=viewMatrix * modelMatrix;

    .endl()+'MOD_positionFromLight=MOD_lightMVP * (modelMatrix  * pos);'
    // .endl()+'MOD_positionFromLight=projMatrix * mvMatrix * pos;'
            

    // .endl()+'MOD_positionFromLight=vec4(MOD_lightMVP[0][2]);'

    .endl();

var srcHeadFrag=attachments.shadow_head_frag;
var srcBodyFrag=attachments.shadow_body_frag;



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
    if(cgl.frameStore.shadowMap)
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
    
            moduleFrag=shader.addModule(
                {
                    title:op.objName,
                    name:'MODULE_COLOR',
                    srcHeadFrag:srcHeadFrag,
                    srcBodyFrag:srcBodyFrag
                },moduleVert);
    
            // moduleFrag.scale=new CGL.Uniform(shader,'f',moduleFrag.prefix+'scale',inScale);
            // moduleFrag.amount=new CGL.Uniform(shader,'f',moduleFrag.prefix+'amount',inAmount);
            moduleVert.lightMVP=new CGL.Uniform(shader,'m4',moduleVert.prefix+'lightMVP',mat4.create());
            moduleFrag.shadowMap=new CGL.Uniform(shader,'t',moduleFrag.prefix+'shadowMap',5);
        }
    
    
        // console.log(moduleVert.prefix); 
        // console.log(cgl.frameStore.lightMVP[2]); 
        
        
        moduleVert.lightMVP.setValue(cgl.frameStore.lightMVP);
    
    
        if(!shader)return;
        var texSlot=moduleVert.num+5;

        cgl.gl.activeTexture(cgl.gl.TEXTURE5);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.frameStore.shadowMap.tex);
        
    }

    op.trigger.trigger();
};
