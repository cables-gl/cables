const
    exe=op.inTrigger("exe"),
    geom=op.inObject("geom"),
    inScale=op.inValue("Scale",1),

    doLimit=op.inValueBool("Limit Instances",false),
    inLimit=op.inValueInt("Limit",100),
    //inIgnoreAlpha=op.inValueBool("Ignore Alpha", true),

    inTranslates=op.inArray("positions"),
    inScales=op.inArray("Scale Array"),
    inRot=op.inArray("Rotations"),
    inColor = op.inArray("Colors"),
    outTrigger = op.outTrigger("Trigger Out"),
    outNum=op.outValue("Num");

const srcHeadVert=attachments.instancer_head_vert;
const srcBodyVert=attachments.instancer_body_vert;
const srcHeadFrag=attachments.instancer_head_frag;
const srcBodyFrag=attachments.instancer_body_frag;

const cgl=op.patch.cgl;
geom.ignoreValueSerialize=true;

var mod=null;
var fragMod = null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;
var recalc=true;
var num=0;

op.setPortGroup("Limit Number of Instances",[inLimit,doLimit]);
op.setPortGroup("Parameters",[inScales,inRot,inTranslates]);
op.toWorkPortsNeedToBeLinked(geom);

doLimit.onChange=updateLimit;
exe.onTriggered=doRender;
exe.onLinkChanged=function() {
    if (!exe.isLinked()) removeModule();
};

var matrixArray=new Float32Array(1);
var instColorArray = new Float32Array(1);
var m=mat4.create();

updateLimit();

inRot.onChange=inColor.onChange=
    inTranslates.onChange=
    inScales.onChange=reset;

geom.onChange=function()
{
    if(mesh)mesh.dispose();
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
        shader.removeModule(fragMod);
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

    var transforms=inTranslates.get();
    if(!transforms)transforms=[0,0,0];

    //op.log("setupArray");

    num=Math.floor(transforms.length/3);

    var colArr = inColor.get();
    if (!colArr) {
        colArr = [];
        colArr.length = num*4;
        for (let i = 0; i < colArr.length; i += 1) {
            colArr[i] = 1;
        }
    }
    var scales=inScales.get();

    if(matrixArray.length!=num*16) matrixArray=new Float32Array(num*16);
    if(instColorArray.length!=num*4) instColorArray=new Float32Array(num*4);

    const rotArr=inRot.get();

    for(var i=0;i<num;i++)
    {
        mat4.identity(m);

        mat4.translate(m,m,
            [
                transforms[i*3],
                transforms[i*3+1],
                transforms[i*3+2]
            ]);

        if(rotArr)
        {
            mat4.rotateX(m,m,rotArr[i*3+0]*CGL.DEG2RAD);
            mat4.rotateY(m,m,rotArr[i*3+1]*CGL.DEG2RAD);
            mat4.rotateZ(m,m,rotArr[i*3+2]*CGL.DEG2RAD);
        }

        instColorArray[i*4+0] = colArr[i*4+0];
        instColorArray[i*4+1] = colArr[i*4+1];
        instColorArray[i*4+2] = colArr[i*4+2];
        instColorArray[i*4+3] = colArr[i*4+3];

        if(scales && scales.length>i) mat4.scale(m,m,[scales[i*3],scales[i*3+1],scales[i*3+2]]);
        else mat4.scale(m,m,[1,1,1]);

        for(var a=0;a<16;a++) matrixArray[i*16+a]=m[a];
    }

    mesh.numInstances=num;

    mesh.addAttribute('instMat', matrixArray,16);
    mesh.addAttribute("instColor", instColorArray, 4, { instanced: true });

    recalc=false;
}

function updateLimit()
{
    if(doLimit.get()) inLimit.setUiAttribs({hidePort:false,greyout:false});
        else inLimit.setUiAttribs({hidePort:true,greyout:true});
}

function doRender()
{
    if(!mesh) return;
    if(recalc)setupArray();
    if(recalc)return;
    if(matrixArray.length<=1)return;

    if(cgl.getShader() && cgl.getShader()!=shader)
    {
        removeModule();

        shader=cgl.getShader();
        if(!shader.hasDefine('INSTANCING'))
        {
            mod=shader.addModule(
                {
                    name: 'MODULE_VERTEX_POSITION',
                    title: op.objName,
                    priority:-2,
                    srcHeadVert: srcHeadVert,
                    srcBodyVert: srcBodyVert
                });
            if (inColor.get()) {
                fragMod = shader.addModule({
                    name: "MODULE_COLOR",
                    priority: -2,
                    title: op.objName,
                    srcHeadFrag:srcHeadFrag,
                    srcBodyFrag:srcBodyFrag,
                });
            }
            shader.define('INSTANCING');
            inScale.uniform=new CGL.Uniform(shader,'f',mod.prefix+'scale',inScale);
        }
    }

    if(doLimit.get()) mesh.numInstances=Math.min(num,inLimit.get());
        else mesh.numInstances=num;

    outNum.set(mesh.numInstances);


    if(mesh.numInstances>0) mesh.render(shader);
    outTrigger.trigger();
}
