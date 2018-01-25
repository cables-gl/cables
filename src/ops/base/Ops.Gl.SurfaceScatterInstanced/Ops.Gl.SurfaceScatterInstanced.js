var render=op.inFunction("Render");
var inGeomSurface=op.inObject("Geom Surface");
var geom=op.inObject("Geometry");

var inNum=op.inValue("Num",100);

var mod=null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;
var recalc=true;
var cgl=op.patch.cgl;

var matrixArray= new Float32Array(1);
var m=mat4.create();

var scaleArr=op.inArray("Scaling");

inNum.onChange=reset;
scaleArr.onChange=reset;
inGeomSurface.onChange=reset;
render.onTriggered=doRender;
render.onLinkChanged=removeModule;

function setup()
{
    var geom=inGeomSurface.get();
    var num=inNum.get();
    var m=mat4.create();
    var q=quat.create();
    var vm2=vec3.create();
    var qMat=mat4.create();
    var norm=vec3.create();

    if(!geom) return;

    if(matrixArray.length!=num*16) matrixArray=new Float32Array(num*16);

    if(geom.isIndexed())
    {
        var faces=geom.verticesIndices;

        for(var i=0;i<num;i++)
        {
            var index=Math.random()*(faces.length/3);
            index=Math.floor(index)*3.0;

            mat4.identity(m);
            mat4.translate(m,m,
                [
                    geom.vertices[faces[index+0]*3+0],
                    geom.vertices[faces[index+0]*3+1],
                    geom.vertices[faces[index+0]*3+2]
                ]);

            // rotate
            vec3.set(norm,
                geom.vertexNormals[geom.verticesIndices[index+0]*3+0],
                geom.vertexNormals[geom.verticesIndices[index+0]*3+1],
                geom.vertexNormals[geom.verticesIndices[index+0]*3+2]
                );
    
            var vm2=vec3.create();
            vec3.set(vm2,1,0,0);
            quat.rotationTo(q,vm2,norm);
    
            mat4.fromQuat(qMat, q);
            mat4.mul(m,m,qMat);
        
    
            if(scaleArr.get())
            {
                var arr=scaleArr.get();
                if(arr.length>index*3)
                {
                    mat4.scale(m,m,[
                        arr[ index*3+0 ],
                        arr[ index*3+1 ],
                        arr[ index*3+2 ]
                        ]);
                    // console.log("scalearray");
                }
            }
    
            // save
    
            for(var a=0;a<16;a++)
            {
                matrixArray[i*16+a]=m[a];
            }
        }
    }

    mesh.numInstances=num;
    mesh.addAttribute('instMat',matrixArray,16);
    recalc=false;
    console.log(matrixArray);
}

// // TODO: remove array3xtransformedinstanced....

// var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

// var inTransformations=op.inArray("positions");
// var inScales=op.inArray("Scale Array");
// var inScale=op.inValue("Scale",1);
// var geom=op.inObject("geom");
// geom.ignoreValueSerialize=true;

// inTransformations.onChange=reset;
// inScales.onChange=reset;


var srcHeadVert=''
    .endl()+'UNI float do_instancing;'
    // .endl()+'UNI float MOD_scale;'
    
    .endl()+'#ifdef INSTANCING'
    .endl()+'   IN mat4 instMat;'
    .endl()+'   OUT mat4 instModelMat;'
    .endl()+'#endif';

var srcBodyVert=''
    .endl()+'#ifdef INSTANCING'
    .endl()+'   if(do_instancing==1.0)'
    .endl()+'   {'
    .endl()+'       mMatrix*=instMat;'
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

function doRender()
{
    if(recalc)setup();
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
                    priority:-2,
                    srcHeadVert: srcHeadVert,
                    srcBodyVert: srcBodyVert
                });

            shader.define('INSTANCING');
            uniDoInstancing=new CGL.Uniform(shader,'f','do_instancing',0);
            // uniScale=new CGL.Uniform(shader,'f',mod.prefix+'scale',inScale);
        }
        else
        {
            uniDoInstancing=shader.getUniform('do_instancing');
        }
        setup();
    }

    uniDoInstancing.setValue(1);
    mesh.render(shader);
    uniDoInstancing.setValue(0);
}
