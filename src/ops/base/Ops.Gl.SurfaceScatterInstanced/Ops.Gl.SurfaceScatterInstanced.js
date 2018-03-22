var render=op.inFunction("Render");
var inGeomSurface=op.inObject("Geom Surface");
var geom=op.inObject("Geometry");

var inDistribution=op.inValueSelect("Distribution",['Vertex','Triangle Center','Triangle Side'],'Vertex');
var inVariety=op.inValueSelect("Selection",["Random","Sequential"],"Random");

var inNum=op.inValue("Num",100);
var inSizeMin=op.inValueSlider("Size min",1.0);
var inSizeMax=op.inValueSlider("Size max",1.0);
var inRotateRandom=op.inValueBool("Random Rotate",true);
var seed=op.addInPort(new Port(op,"Random Seed"));

var mod=null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;
var recalc=true;
var cgl=op.patch.cgl;

var matrixArray= new Float32Array(1);
var m=mat4.create();

inDistribution.onChange=reset;
seed.onChange=reset;
inNum.onChange=reset;
inRotateRandom.onChange=reset;
inSizeMin.onChange=reset;
inSizeMax.onChange=reset;
inVariety.onChange=reset;
inGeomSurface.onChange=reset;
render.onTriggered=doRender;
render.onLinkChanged=removeModule;

function setup()
{
    if(!mesh)return;
    var geom=inGeomSurface.get();
    var num=inNum.get();
    var m=mat4.create();
    var q=quat.create();
    var vm2=vec3.create();
    var qMat=mat4.create();
    var norm=vec3.create();

    if(!geom) return;

    Math.randomSeed=seed.get();
    
    var distMode=0;
    if(inDistribution.get()=='Triangle Center')distMode=1;
    if(inDistribution.get()=='Triangle Side')distMode=2;

    if(matrixArray.length!=num*16) matrixArray=new Float32Array(num*16);

    if(geom.isIndexed())
    {
        var faces=geom.verticesIndices;
        var doRand=inVariety.get()=="Random";

        for(var i=0;i<num;i++)
        {
            var index=i;
            if(i%3!=0)continue;
            if(doRand)
            {
                index=Math.seededRandom()*(faces.length/3);
                index=Math.floor(index)*3.0;
            }

            mat4.identity(m);
            
            if(distMode==0)
            {
                mat4.translate(m,m,
                    [
                        geom.vertices[faces[index+0]*3+0],
                        geom.vertices[faces[index+0]*3+1],
                        geom.vertices[faces[index+0]*3+2]
                    ]);
            }
            else if(distMode==1)
            {
                mat4.translate(m,m,
                    [
                        (geom.vertices[faces[index+0]*3+0]+geom.vertices[faces[index+1]*3+0]+geom.vertices[faces[index+2]*3+0])/3,
                        (geom.vertices[faces[index+0]*3+1]+geom.vertices[faces[index+1]*3+1]+geom.vertices[faces[index+2]*3+1])/3,
                        (geom.vertices[faces[index+0]*3+2]+geom.vertices[faces[index+1]*3+2]+geom.vertices[faces[index+2]*3+2])/3,

                    ]);
            } else if(distMode==2)
            {
                var which=Math.round(Math.seededRandom()*3.0);
                
                var whichA=which;
                var whichB=which+1;
                if(whichB>2)whichB=0;

                mat4.translate(m,m,
                    [
                        ( geom.vertices[faces[index+whichA]*3+0]+geom.vertices[faces[index+whichB]*3+0] )/2,
                        ( geom.vertices[faces[index+whichA]*3+1]+geom.vertices[faces[index+whichB]*3+1] )/2,
                        ( geom.vertices[faces[index+whichA]*3+2]+geom.vertices[faces[index+whichB]*3+2] )/2,
                    ]);
            }

            // rotate to normal direction
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


            // random rotate around up axis
            if(inRotateRandom.get())
            {
                var mr=mat4.create();
                var qbase=quat.create();
                quat.rotateX(qbase,qbase,Math.seededRandom()*360*CGL.DEG2RAD);
                mat4.fromQuat(mr,qbase);
                mat4.mul(m,m,mr);
            }

            // rotate -90 degree
            var mr2=mat4.create();
            var qbase2=quat.create();
            quat.rotateZ(qbase2,qbase2,-90*CGL.DEG2RAD);
            mat4.fromQuat(mr2,qbase2);
            mat4.mul(m,m,mr2);

            // scale
            if(inSizeMin.get()!=1.0 || inSizeMax!=1.0)
            {
                var sc=inSizeMin.get()+ ( Math.seededRandom()*(inSizeMax.get()-inSizeMin.get()) );
                mat4.scale(m,m,[sc,sc,sc]);
            }

            // save
            for(var a=0;a<16;a++)
            {
                matrixArray[i*16+a]=m[a];
            }
        }
    }
    else
    {
        console.error("geom is not indexed");
    }

    if(op.patch.cgl.glVersion>=2) 
    {
        mesh.numInstances=num;
        mesh.addAttribute('instMat',matrixArray,16);
    }
    recalc=false;
    // console.log(matrixArray);
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
    if(!inGeomSurface.get())return;
    if(!geom.get())return;

// ANGLE_instanced_arrays

    if(op.patch.cgl.glVersion>=2) 
    {
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
    else
    {
        // fallback - SLOW
 
        for(var i=0;i<matrixArray.length;i+=16)
        {
            op.patch.cgl.pushModelMatrix();

            for(var j=0;j<16;j++)
                m[j]=matrixArray[i+j];

            mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,m);

            mesh.render(cgl.getShader());
            op.patch.cgl.popModelMatrix();
        }
        
        // console.log(i/16);
    }
}