op.name="AreaRotate";

var cgl=op.patch.cgl;

op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inSize=op.inValue("Size",1);
var inStrength=op.inValue("Strength",1);
var inSmooth=op.inValueBool("Smooth",true);

var inOffset=op.inValue("offset");


var inPoints=op.inArray("Points");

var updateUniformPoints=false;

var shader=null;
var pointArray=new Float32Array(99);

var srcHeadVert=attachments.splinedeform_head_vert||'';
var srcBodyVert=attachments.splinedeform_vert||'';

// var srcBodyVert=''
//     .endl()+'pos=MOD_scaler(pos,mMatrix);'
//     .endl();
    
var moduleVert=null;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}


inPoints.onChange=function()
{
    if(inPoints.get())
    {
        pointArray=inPoints.get();//new Float32Array(inPoints.get());
        updateUniformPoints=true;


                
        // console.log(inPoints.get().length,"points");
        // resetLater();
    }
};


inPoints.onChange=function()
{
    if(inPoints.get())
    {
        pointArray=inPoints.get();//new Float32Array(inPoints.get());
        updateUniformPoints=true;


                
        // console.log(inPoints.get().length,"points");
        // resetLater();
    }
};

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

        inSize.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'size',inSize);
        inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
        inSmooth.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'smooth',inSmooth);

        inOffset.offset=new CGL.Uniform(shader,'f',moduleVert.prefix+'offset',inOffset);
        // y.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        // z.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);
        
        op.uniPoints=new CGL.Uniform(shader,'3f[]',moduleVert.prefix+'points',new Float32Array([0,0,0,0,0,0]));
    }
    
    if(updateUniformPoints && pointArray)
    {
        // if(!shader.hasDefine("PATHFOLLOW_POINTS"))shader.define('PATHFOLLOW_POINTS',pointArray.length/3);
        if(shader.getDefine("SPLINE_POINTS")<Math.floor(pointArray.length/3))
        {
            console.log(shader.getDefine("SPLINE_POINTS"));
            shader.define('SPLINE_POINTS',Math.floor(pointArray.length/3));
                // console.log('pointArray.length/3',pointArray.length/3);
        }
        // shader.define('PATHFOLLOW_POINTS',pointArray.length/3);

        // shaderModule.uniNumPoints.setValue(pointArray.length/3);
        op.uniPoints.setValue(pointArray);
        updateUniformPoints=false;
        
        // console.log("update uniforms");
    }

    
    if(!shader)return;

    op.trigger.trigger();
};
