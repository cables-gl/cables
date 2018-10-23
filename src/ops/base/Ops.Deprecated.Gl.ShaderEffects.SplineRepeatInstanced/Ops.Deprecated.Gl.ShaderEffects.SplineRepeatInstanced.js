// TODO: remove array3xtransformedinstanced....

var exe=op.addInPort(new Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

var inTransformations=op.inArray("positions");
var geom=op.inObject("geom");

var inNum=op.inValueInt("Num",2000);

var inOffset=op.inValue("Offset");

var rotPos=op.inValueBool("Rotate by Position",true);

var inMeth=op.inValueSelect("Method",["Array","Fill"],"Array");
var inSpacing=op.inValue("Spacing",0.2);
var inScale=op.inValue("Scale",1);
// var inRot=op.inValue("Rotation",0);
var inRotX=op.inValue("Rot X",0);
var inRotY=op.inValue("Rot Y",0);
var inRotZ=op.inValue("Rot Z",1);

var inPreRotX=op.inValue("Pre Rot X",0);
var inPreRotY=op.inValue("Pre Rot Y",0);
var inPreRotZ=op.inValue("Pre Rot Z",1);

var texScaling=op.inTexture("Texture Scaling");
var texRotation=op.inTexture("Texture Rotation");


geom.ignoreValueSerialize=true;

var mod=null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;
var uniPoints=null;
var recalc=true;
var cgl=op.patch.cgl;

exe.onTriggered=doRender;
// exe.onLinkChanged=removeModule;


// var matrixArray= new Float32Array(1);
var m=mat4.create();
inSpacing.onChange=inTransformations.onChange=reset;

inNum.onChange=reset;
inMeth.onChange=updateMethod;
texScaling.onChange=updateTextureDefine;
rotPos.onChange=updateTextureDefine;

function updateMethod()
{
    if(inMeth.get()=='Fill')
    {
        inSpacing.setUiAttribs({hidePort:true,greyout:true});
    }
    else
    {
        inSpacing.setUiAttribs({hidePort:false,greyout:false});
    }
    recalc=true;
}

function updateTextureDefine()
{
    if(!shader)return;
    if(texScaling.get())shader.define("TEX_SCALE");
        else shader.removeDefine("TEX_SCALE");

    if(texRotation.get())shader.define("TEX_ROT");
        else shader.removeDefine("TEX_ROT");

    if(rotPos.get()) shader.define("ROT_BYPOSITION");
        else shader.define("ROT_BYPOSITION");

}


geom.onChange=function()
{
    if(!geom.get())
    {
        mesh=null;
        return;
    }
    mesh=new CGL.Mesh(cgl,geom.get());
    reset();
};

function removeModule()
{
    if(shader && mod)
    {
        shader.removeDefine('INSTANCING');
        shader.removeModule(mod);
        shader=null;
    }
    reset();
}

function reset()
{
    recalc=true;
}

function setupArray()
{
    if(!inTransformations.get())return;
    if(!mesh)return;
    if(!shader)return;
    if(!uniPoints)return;
    
    var pointArray=inTransformations.get();
    var num=inNum.get();
    if(num<=0)return;
    var numSplinePoints=Math.floor(pointArray.length/3);
    
    console.log("numSplinePoints",numSplinePoints);

    // spline...
    // if(shader.getDefine("PATHFOLLOW_POINTS")<Math.floor(pointArray.length/3))
    shader.define('PATHFOLLOW_POINTS',Math.floor(numSplinePoints));

    uniPoints.setValue(new Float32Array(pointArray));

    // delta attr per mesh
    var indexArr=new Float32Array(num);
    
    var space=inSpacing.get();
    if(inMeth.get()=="Fill")
    {
        space=numSplinePoints/num-1;
        console.log(space);
        shader.define("METHOD_FILL");
    }
    else shader.removeDefine("METHOD_FILL");

    
    for(var i=0;i<num;i++) indexArr[i]=i*space;
    
    mesh.addAttribute(mod.prefix+'index',indexArr,1,{instanced:true});
    mesh.numInstances=num;
    

    updateTextureDefine();

    console.log("SETUP FINISHED",indexArr.length);
    // mesh.addAttribute('instMat',matrixArray,16);
    
    recalc=false;
    
    
}

function doRender()
{
    
    // if(matrixArray.length<=1)return;
    if(!mesh) return;
    // if(recalc)setupArray();

    if(cgl.getShader() && cgl.getShader()!=shader)
    {
        if(shader && mod)
        {
            removeModule();
        }

        shader=cgl.getShader();
        if(!shader.hasDefine('INSTANCING'))
        {
            mod=shader.addModule(
                {
                    name: 'MODULE_VERTEX_POSITION',
                    priority:-2,
                    srcHeadVert: attachments.splinerepeat_head_vert,
                    srcBodyVert: attachments.splinerepeat_body_vert
                });

            shader.define('INSTANCING');
            uniDoInstancing=new CGL.Uniform(shader,'f','do_instancing',0);
            inScale.uniform=new CGL.Uniform(shader,'f',mod.prefix+'scale',inScale);
            
            // op.uniRot=new CGL.Uniform(shader,'f',mod.prefix+'rotation',inRot);
            op.uniOffset=new CGL.Uniform(shader,'f',mod.prefix+'offset',inOffset);
            op.uniSpacing=new CGL.Uniform(shader,'f',mod.prefix+'spacing',inSpacing);
            op.numInstances=new CGL.Uniform(shader,'f',mod.prefix+'numInstances',inNum);
            
            uniPoints=new CGL.Uniform(shader,'3f[]',mod.prefix+'points',new Float32Array([0,0,0,0,0,0]));
            op.uniTextureFrag=new CGL.Uniform(shader,'t',mod.prefix+'texScale',6);
            op.uniTextureFragRot=new CGL.Uniform(shader,'t',mod.prefix+'texRot',7);

            op.uniRotX=new CGL.Uniform(shader,'f',mod.prefix+'rotX',inRotX);
            op.uniRotY=new CGL.Uniform(shader,'f',mod.prefix+'rotY',inRotY);
            op.uniRotZ=new CGL.Uniform(shader,'f',mod.prefix+'rotZ',inRotZ);
            
            op.uniPreRotX=new CGL.Uniform(shader,'f',mod.prefix+'preRotX',inPreRotX);
            op.uniPreRotY=new CGL.Uniform(shader,'f',mod.prefix+'preRotY',inPreRotY);
            op.uniPreRotZ=new CGL.Uniform(shader,'f',mod.prefix+'preRotZ',inPreRotZ);
        }
        else
        {
            uniDoInstancing=shader.getUniform('do_instancing');
        }
    }

    if(recalc)setupArray();
    

    if(texScaling.get())
    {
        /* --- */cgl.setTexture(6,texScaling.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texScaling.get().tex);
    }

    if(texRotation.get())
    {
        /* --- */cgl.setTexture(7,texRotation.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texRotation.get().tex);
    }

    if(!recalc)
    {
        uniDoInstancing.setValue(1);
        mesh.render(shader);
        uniDoInstancing.setValue(0);
        
    }
}
