// TODO: remove array3xtransformedinstanced....

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

var inTransformations=op.inArray("positions");
var geom=op.inObject("geom");

var inNum=op.inValueInt("Num",2000);

var inOffset=op.inValue("Offset");
var inSpacing=op.inValue("Spacing",0.2);
var inScale=op.inValue("Scale",1);
var inRot=op.inValue("Rotation",0);

var texScaling=op.inTexture("Texture Scaling");


geom.ignoreValueSerialize=true;

var mod=null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;
var uniPoints=null;
var recalc=true;
var cgl=op.patch.cgl;

exe.onTriggered=doRender;
exe.onLinkChanged=removeModule;

// var matrixArray= new Float32Array(1);
var m=mat4.create();
inTransformations.onChange=reset;

inNum.onChange=reset;


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
}

function reset()
{
    recalc=true;
}

function setupArray()
{
    if(!mesh)return;
    if(!shader)return;
    
    var pointArray=inTransformations.get();
    // if(!transforms)
    // {
    //     transforms=[0,0,0];
    // }
    var num=inNum.get();
    var numSplinePoints=Math.floor(pointArray.length/3);
    
    console.log("NUM INSTANCES",num);

    // if(matrixArray.length!=num*16)
    // {
    //     matrixArray=new Float32Array(num*16);
    // }

    // for(var i=0;i<num;i++)
    // {
    //     mat4.identity(m);
    //     mat4.translate(m,m,
    //         [
    //             transforms[i*3],
    //             transforms[i*3+1],
    //             transforms[i*3+2]
    //         ]);
        
    //     mat4.scale(m,m,[1,1,1]);

    //     for(var a=0;a<16;a++)
    //     {
    //         matrixArray[i*16+a]=m[a];
    //     }
    // }


    // spline...
    // if(shader.getDefine("PATHFOLLOW_POINTS")<Math.floor(pointArray.length/3))
    shader.define('PATHFOLLOW_POINTS',Math.floor(numSplinePoints));

    uniPoints.setValue(pointArray);
    updateUniformPoints=false;

    // delta attr per mesh
    var deltaArr=new Float32Array(num);
    for(var i=0;i<num;i++)deltaArr[i]=i;
    mesh.addAttribute(mod.prefix+'delta',deltaArr,1,{instanced:true});


    mesh.numInstances=num;
    
    console.log("SETUP FINISHED");
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
            shader.removeModule(mod);
            shader=null;
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
            uniScale=new CGL.Uniform(shader,'f',mod.prefix+'scale',inScale);
            
            op.uniRot=new CGL.Uniform(shader,'f',mod.prefix+'rotation',inRot);
            op.uniOffset=new CGL.Uniform(shader,'f',mod.prefix+'offset',inOffset);
            op.uniSpacing=new CGL.Uniform(shader,'f',mod.prefix+'spacing',inSpacing);
            op.numInstances=new CGL.Uniform(shader,'f',mod.prefix+'numInstances',inNum);
            
            uniPoints=new CGL.Uniform(shader,'3f[]',mod.prefix+'points',new Float32Array([0,0,0,0,0,0]));
            op.uniTextureFrag=new CGL.Uniform(shader,'t',mod.prefix+'texScale',0);

        }
        else
        {
            uniDoInstancing=shader.getUniform('do_instancing');
        }
    }

    if(recalc)setupArray();

    if(texScaling.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texScaling.get().tex);

    }



    uniDoInstancing.setValue(1);
    mesh.render(shader);
    uniDoInstancing.setValue(0);
}
