const exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
const inTransformations=op.inArray("positions");
const inScales=op.inArray("Scale Array");
const inScale=op.inValue("Scale",1);
const geom=op.inObject("geom");
const cgl=op.patch.cgl;

geom.ignoreValueSerialize=true;

var mod=null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;
var recalc=true;

exe.onTriggered=doRender;
exe.onLinkChanged=removeModule;

var matrixArray= new Float32Array(1);
var m=mat4.create();
inTransformations.onChange=reset;
inScales.onChange=reset;

var srcHeadVert=''
    .endl()+'UNI float do_instancing;'
    .endl()+'UNI float MOD_scale;'
    
    .endl()+'#ifdef INSTANCING'
    .endl()+'   IN mat4 instMat;'
    .endl()+'   OUT mat4 instModelMat;'
    .endl()+'#endif';

var srcBodyVert=''
    .endl()+'#ifdef INSTANCING'
    .endl()+'    mMatrix*=instMat;'
    .endl()+'    pos.xyz*=MOD_scale;'
    .endl()+'#endif'
    .endl();

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
    
    var transforms=inTransformations.get();
    if(!transforms)transforms=[0,0,0];

    var num=Math.floor(transforms.length/3);
    var scales=inScales.get();

    if(matrixArray.length!=num*16) matrixArray=new Float32Array(num*16);

    for(var i=0;i<num;i++)
    {
        mat4.identity(m);
        mat4.translate(m,m,
            [
                transforms[i*3],
                transforms[i*3+1],
                transforms[i*3+2]
            ]);
        
        
        // mat4.rotateX(m,m,33*CGL.DEG2RAD);
        // mat4.rotateY(m,m,33*CGL.DEG2RAD);
        // mat4.rotateZ(m,m,33*CGL.DEG2RAD);
        
        if(scales && scales.length>i) mat4.scale(m,m,[scales[i],scales[i],scales[i]]);
            else mat4.scale(m,m,[1,1,1]);

        for(var a=0;a<16;a++) matrixArray[i*16+a]=m[a];
    }

    mesh.numInstances=num;
    mesh.addAttribute('instMat',matrixArray,16);
    recalc=false;
}

function doRender()
{
    if(!mesh) return;
    if(recalc)setupArray();
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

            shader.define('INSTANCING');
            inScale.uniform=new CGL.Uniform(shader,'f',mod.prefix+'scale',inScale);
        }
    }

    mesh.render(shader);
}
