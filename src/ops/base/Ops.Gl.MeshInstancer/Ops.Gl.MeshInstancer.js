// TODO: remove array3xtransformedinstanced....

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

var inTransformations=op.inArray("positions");
var inScales=op.inArray("scale");
var geom=op.inObject("geom");
geom.ignoreValueSerialize=true;

var mod=null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;
var recalc=true;
var cgl=op.patch.cgl;

exe.onTriggered=doRender;
exe.onLinkChanged=removeModule;

var matrixArray= new Float32Array(1);
var m=mat4.create();
inTransformations.onChange=reset;
inScales.onChange=reset;


var srcHeadVert=''
    .endl()+'UNI float do_instancing;'
    
    .endl()+'#ifdef INSTANCING'
    .endl()+'   IN mat4 instMat;'
    .endl()+'   OUT mat4 instModelMat;'
    .endl()+'#endif';

var srcBodyVert=''
    .endl()+'#ifdef INSTANCING'
    
    .endl()+'   if(do_instancing==1.0)'
    .endl()+'   {'
    .endl()+'       instModelMat=instMat;'
    .endl()+'       mvMatrix=viewMatrix * modelMatrix * instModelMat;'
    .endl()+'   }'
    .endl()+'#endif'
    .endl();



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

    var transforms=inTransformations.get();
    if(!transforms)
    {
        transforms=[0,0,0];
    }
    var num=Math.floor(transforms.length/3);
    
    
    var scales=inScales.get();
    
    console.log('setup array!');

    if(matrixArray.length!=num*16)
    {
        matrixArray=new Float32Array(num*16);
    }

    for(var i=0;i<num;i++)
    {
        mat4.identity(m);
        mat4.translate(m,m,
            [
                transforms[i*3],
                transforms[i*3+1],
                transforms[i*3+2]
            ]);
        
        if(scales && scales.length>i)
        {
            mat4.scale(m,m,[scales[i],scales[i],scales[i]]);
        }

        for(var a=0;a<16;a++)
        {
            matrixArray[i*16+a]=m[a];
        }
    }

    mesh.numInstances=num;
    mesh.addAttribute('instMat',matrixArray,16);
    recalc=false;
}

function doRender()
{
    if(recalc)setupArray();
    if(matrixArray.length<=1)return;
    if(!mesh) return;

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
                    srcHeadVert: srcHeadVert,
                    srcBodyVert: srcBodyVert
                });

            shader.define('INSTANCING');
            uniDoInstancing=new CGL.Uniform(shader,'f','do_instancing',0);
        }
        else
        {
            uniDoInstancing=shader.getUniform('do_instancing');
        }
    }

    uniDoInstancing.setValue(1);
    mesh.render(shader);
    uniDoInstancing.setValue(0);


}
