const render=op.inTrigger("Render");
const next=op.outTrigger("Next");

var ports=[];
var boolPorts=[];

const cgl=op.patch.cgl;

const NUM_BUFFERS=8;

for(var i=0;i<NUM_BUFFERS;i++)
{
    var p=op.inValueBool('Texture '+i,i===0);
    p.onChange=updateBools;
    ports.push(p);
}

function updateBools()
{
    needsReset=true;
}

var shader=null;
var needsReset=true;
var moduleFrag=null;

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    // if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

render.onTriggered=function()
{
    const currentShader=cgl.getShader();
    // var shader=cgl.getShader();

    if(currentShader!=shader || needsReset)
    {
        if(shader) removeModule();
        shader=currentShader;

        // moduleVert=shader.addModule(
        //     {
        //         title:op.objName,
        //         name:'MODULE_VERTEX_POSITION',
        //         srcHeadVert:attachments.shaderEffectExample_head_vert||'',
        //         srcBodyVert:attachments.shaderEffectExample_body_vert||''
        //     });

        var srcFrag='';

        for(var i=0;i<NUM_BUFFERS;i++)
        {
            boolPorts[i]=ports[i].get();
            if(boolPorts[i]) srcFrag+=' outColor'+i+'=col;';
        }
        currentShader.setDrawBuffers(boolPorts);

        moduleFrag=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_COLOR',
                srcHeadFrag:attachments.shaderEffectExample_head_frag||'',
                srcBodyFrag:srcFrag||''
            });
            
        needsReset=false;
        console.log(srcFrag);

    }


    


    
    next.trigger();
    
};