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


// public static bool PointInTriangle(ref Vector3 A, ref Vector3 B, ref Vector3 C, ref Vector3 P)
// {
//     // Prepare our barycentric variables
//     Vector3 u = B - A;
//     Vector3 v = C - A;
//     Vector3 w = P - A;

//     Vector3 vCrossW = Vector3.Cross(v, w);
//     Vector3 vCrossU = Vector3.Cross(v, u);

//     // Test sign of r
//     if (Vector3.Dot(vCrossW, vCrossU) < 0)
//         return false;

//     Vector3 uCrossW = Vector3.Cross(u, w);
//     Vector3 uCrossV = Vector3.Cross(u, v);

//     // Test sign of t
//     if (Vector3.Dot(uCrossW, uCrossV) < 0)
//         return false;

//     // At this point, we know that r and t and both > 0.
//     // Therefore, as long as their sum is <= 1, each must be less <= 1
//     float denom = uCrossV.Length();
//     float r = vCrossW.Length() / denom;
//     float t = uCrossW.Length() / denom;

//     return (r + t <= 1);
// }



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
    // .endl()+'       mMatrix[0][0]*=MOD_scale;'
    // .endl()+'       mMatrix[1][1]*=MOD_scale;'
    // .endl()+'       mMatrix[2][2]*=MOD_scale;'
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

// function setupArray()
// {
//     if(!mesh)return;
    
//     var transforms=inTransformations.get();
//     if(!transforms)
//     {
//         transforms=[0,0,0];
//     }
//     var num=Math.floor(transforms.length/3);
    
    
//     var scales=inScales.get();
//     // console.log('scales',scales);
//     // console.log('setup array!');

//     if(matrixArray.length!=num*16)
//     {
//         matrixArray=new Float32Array(num*16);
//     }

//     for(var i=0;i<num;i++)
//     {
//         mat4.identity(m);
//         mat4.translate(m,m,
//             [
//                 transforms[i*3],
//                 transforms[i*3+1],
//                 transforms[i*3+2]
//             ]);
        
//         if(scales && scales.length>i)
//         {
//             mat4.scale(m,m,[scales[i],scales[i],scales[i]]);
//             // console.log('scale',scales[i]);
//         }
//         else
//         {
//             mat4.scale(m,m,[1,1,1]);
//         }

//         for(var a=0;a<16;a++)
//         {
//             matrixArray[i*16+a]=m[a];
//         }
//     }

//     mesh.numInstances=num;
//     mesh.addAttribute('instMat',matrixArray,16);
//     recalc=false;
// }

function doRender()
{
    if(recalc)setup();
    // if(matrixArray.length<=1)return;
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
