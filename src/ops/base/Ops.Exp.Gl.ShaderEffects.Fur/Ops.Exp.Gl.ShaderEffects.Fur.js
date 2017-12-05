
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;


var inLayer=op.inValueInt("Layer");
var inNumLayers=op.inValueInt("Num Layers");
var inStrength=op.inValue("Strength",1);
var inTime=op.inValue("Time");


var doRender=function()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

var shader=new CGL.Shader(cgl,'furmaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

shader.setSource(attachments.fur_vert,attachments.fur_frag);
shader.bindTextures=bindTextures;

inStrength.uniform=new CGL.Uniform(shader,'f','strength',inStrength);
inLayer.uniform=new CGL.Uniform(shader,'f','layer',inLayer);
inNumLayers.uniform=new CGL.Uniform(shader,'f','numLayers',inNumLayers);
inTime.uniform=new CGL.Uniform(shader,'f','time',inTime);



var texStructure=op.inTexture("Tex Structure");
var texStructureUniform=null;
shader.bindTextures=bindTextures;
texStructure.uniform=new CGL.Uniform(shader,'t','texStructure',0);

var texColor=op.inTexture("Tex Color");
var texColorUniform=null;
shader.bindTextures=bindTextures;
texColor.uniform=new CGL.Uniform(shader,'t','texColor',1);

var texLength=op.inTexture("Tex Length");
var texLengthUniform=null;
shader.bindTextures=bindTextures;
texLength.uniform=new CGL.Uniform(shader,'t','texLength',2);


render.onTriggered=doRender;

function bindTextures()
{
    if(texStructure.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texStructure.get().tex);
    }

    if(texColor.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texColor.get().tex);
    }

    if(texLength.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE2);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texLength.get().tex);
    }

    
}



// var cgl=op.patch.cgl;

// op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
// op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));


// var inLayer=op.inValueInt("Layer");
// var inNumLayers=op.inValueInt("Num Layers");

// var inTime=op.inValue("Time");


// var inStrength=op.inValue("Strength",1);

// var shader=null;

// var srcHeadVert=attachments.fur_vert;

// var srcBodyVert=''
//     .endl()+'pos=MOD_scaler(pos,modelMatrix*pos,attrVertNormal);' //modelMatrix*
//     .endl();
    
// var moduleVert=null;

// function removeModule()
// {
//     if(shader && moduleVert) shader.removeModule(moduleVert);
//     shader=null;
// }

// op.render.onLinkChanged=removeModule;

// op.render.onTriggered=function()
// {
//     if(!cgl.getShader())
//     {
//          op.trigger.trigger();
//          return;
//     }
    
//     if(cgl.getShader()!=shader)
//     {
//         if(shader) removeModule();
//         shader=cgl.getShader();

//         moduleVert=shader.addModule(
//             {
//                 title:op.objName,
//                 name:'MODULE_VERTEX_POSITION',
//                 srcHeadVert:srcHeadVert,
//                 srcBodyVert:srcBodyVert
//             });

//         inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
//         inLayer.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'Layer',inLayer);
//         inNumLayers.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'NumLayers',inNumLayers);
//         inTime.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'time',inTime);

//     }
    
    
//     if(!shader)return;

//     op.trigger.trigger();
// };
