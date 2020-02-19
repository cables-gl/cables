
// https://www.khronos.org/opengl/wiki/Skeletal_Animation

var render=op.inTrigger("Render");
var inMeshIndex=op.inValueInt("MeshIndex");
var inGeom=op.inObject("Geometry");
var draw=op.inValueBool("draw",true);
var next=op.outTrigger("Next");

var geom=null;
var mesh=null;
var shader=null;

var cgl=op.patch.cgl;
var meshIndex=0;

var boneMatrices=[];
var boneMatricesUniform=null;
var vertWeights=null;
var vertIndex=null;
var attribWeightsScene=-1;
var moduleVert=null;

render.onLinkChanged=removeModule;
op.onDelete=removeModule;
inMeshIndex.onChange=reset;
inGeom.onChange=setGeom;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
    reset();
}

function reset()
{
    meshIndex=inMeshIndex.get();
    attribWeightsScene=null;
    if(shader)removeModule();
    mesh=null;
    vertWeights=null;
}

function setGeom()
{
    vertWeights=null;
    geom=inGeom.get();

    if(geom)
    {
        mesh=new CGL.Mesh(cgl,geom);
        op.setUiError('geom',null);
    }
    else
    {
        op.setUiError('geom','no/invalid geometry');
    }
}

function setupIndexWeights(jsonMesh)
{
    if(!mesh)
    {
        return;
    }

    // if(!vertWeights) console.log('no vertWeights');
    //     else if(vertWeights.length!=geom.vertices.length/3) console.log('wrong length');

    if(!vertWeights || vertWeights.length!=geom.vertices.length/3)
    {
        vertWeights=[];
        vertIndex=[];
        vertWeights.length=geom.vertices.length/3;
        vertIndex.length=geom.vertices.length/3;

        for(var i=0;i<vertWeights.length;i++)
        {
            vertWeights[i]=[-1,-1,-1,-1];
            vertIndex[i]=[-1,-1,-1,-1];
        }
    }

    var maxBone=-1;
    var maxindex=-1;
    var bones=jsonMesh.bones;
    for(var i=0;i<bones.length;i++)
    {
        var bone=bones[i];
        maxBone=Math.max(maxBone,i);

        for(var w=0;w<bone.weights.length;w++)
        {
            var index=bone.weights[w][0];
            var weight=bone.weights[w][1];
            maxindex=Math.max(maxindex,index);

            if(vertWeights[index][0]==-1)
            {
                vertWeights[index][0]=weight;
                vertIndex[index][0]=i;
            }
            else if(vertWeights[index][1]==-1)
            {
                vertWeights[index][1]=weight;
                vertIndex[index][1]=i;
            }
            else if(vertWeights[index][2]==-1)
            {
                vertWeights[index][2]=weight;
                vertIndex[index][2]=i;
            }
            else if(vertWeights[index][3]==-1)
            {
                vertWeights[index][3]=weight;
                vertIndex[index][3]=i;
            }
            else console.log("too many weights for vertex!!!!!!!");
        }
    }
    
    shader.define("SKIN_NUM_BONES",bones.length);
    
    var vi=[].concat.apply([], vertIndex);
    var vw=[].concat.apply([], vertWeights);

    mesh.setAttribute("skinIndex", vi,4);
    mesh.setAttribute("skinWeight",vw ,4);
}

render.onTriggered=function()
{
    if(!cgl.getShader()) return;
    var scene=cgl.frameStore.currentScene.getValue();

    if(cgl.getShader()!=shader)
    {
        // console.log("NEW SHADER!");
    }

    if( (mesh && scene && scene.meshes && scene.meshes.length>meshIndex) || cgl.getShader()!=shader)
    {
        if(cgl.getShader()!=shader)
        {
            
            // console.log('bonesys RECOMPILE');


            var startInit=CABLES.now();
            // console.log("starting bone skin shader init...");

            if(shader)removeModule();
            shader=cgl.getShader();

            moduleVert=shader.addModule(
                {
                    title:op.objName,
                    priority:-1,
                    name:'MODULE_VERTEX_POSITION',
                    srcHeadVert:attachments.skin_head_vert||'',
                    srcBodyVert:attachments.skin_vert||''
                });
            shader.define("SKIN_NUM_BONES",1);
            boneMatricesUniform=new CGL.Uniform(shader,'m4','bone',[]);
            attribWeightsScene=null;
            // console.log("finished bone skin shader init...",(CABLES.now()-startInit));
        }

        if(attribWeightsScene!=scene)
        {
            var startInit=CABLES.now();
            // console.log("starting bone skin weights init...");
            vertWeights=null;
            setGeom();
            attribWeightsScene=scene;
            setupIndexWeights( scene.meshes[meshIndex] );
            // console.log("finished bone skin  weights init...",(CABLES.now()-startInit));
        }

        var bones=scene.meshes[meshIndex].bones;

        for(var i=0;i<bones.length;i++)
        {
            if(bones[i].matrix)
            {
                if(boneMatrices.length!=bones.length*16)
                    boneMatrices.length=bones.length*16;

                // console.log('.');

                for(var mi=0;mi<16;mi++)
                    boneMatrices[i*16+mi]=bones[i].matrix[mi];
            }
            else
            {
                // console.log('no bone matrix',i);
            }
        }
        // console.log(boneMatrices);
        
        boneMatricesUniform.setValue(boneMatrices);
        
    }

    if(draw.get() && mesh)
    {
        if(mesh) mesh.render(cgl.getShader());
        next.trigger();
    }
    
};