
// https://www.khronos.org/opengl/wiki/Skeletal_Animation

var render=op.inFunction("Render");
var inMeshIndex=op.inValueInt("MeshIndex");
var inGeom=op.inObject("Geometry");
var draw=op.inValueBool("draw",true);

var next=op.outFunction("Next");



var geom=null;
var mesh=null;
var shader=null;

var cgl=op.patch.cgl;
var meshIndex=0;
render.onLinkChanged=removeModule;
op.onDelete=removeModule;

var boneMatrices=[];
var boneMatricesUniform=null;
var vertWeights=null;
var vertIndex=null;
var attribWeightsScene=-1;

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

inMeshIndex.onChange=reset;

inGeom.onChange=setGeom;

function setGeom()
{
    vertWeights=null;
    geom=inGeom.get();

    if(geom)
    {
        mesh=new CGL.Mesh(cgl,geom);
        op.error('geom',null);
    }
    else
    {
        op.error('geom','no/invalid geometry');
    }
};




function setupIndexWeights(jsonMesh)
{
    if(!mesh)return;
    console.log('setupIndexWeights',geom.vertices.length);
    
    
    if(!vertWeights || vertWeights.length!=geom.vertices.length/3)
    {
        console.log('recalc weight lengths');
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
    
    console.log(vertIndex);

    shader.define("SKIN_NUM_BONES",bones.length);
    console.log("skin bones:",bones.length);
    console.log("maxindex",maxindex);
    console.log("maxBone",maxBone);

    var vi=[].concat.apply([], vertIndex);
    var vw=[].concat.apply([], vertWeights);
    console.log('vertWeights length',vi.length/4);
    
    mesh.setAttribute("skinIndex", vi,4);
    mesh.setAttribute("skinWeight",vw ,4);
}

render.onTriggered=function()
{
    if(!cgl.getShader()) return;

    if(cgl.getShader()!=shader)
    {
        if(shader)removeModule();
        shader=cgl.getShader();

        moduleVert=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.skin_head_vert||'',
                srcBodyVert:attachments.skin_vert||''
            });
        shader.define("SKIN_NUM_BONES",1);

        boneMatricesUniform=new CGL.Uniform(shader,'m4','bone',[]);
        attribWeightsScene=null;
        console.log("reset skin shader...");
    }

    var scene=cgl.frameStore.currentScene.getValue();
    
    if(scene && scene.meshes && scene.meshes.length>meshIndex) // || attribWeightsScene!=scene
    {
        
        if(attribWeightsScene!=scene)
        {
            vertWeights=null;
            setGeom();
            console.log('attribWeightsScene!=scene');
            attribWeightsScene=scene;
            setupIndexWeights(scene.meshes[meshIndex]);
        }
    
        var bones=scene.meshes[meshIndex].bones;
        for(var i=0;i<bones.length;i++)
        {
            if(bones[i].matrix)
            {
                if(boneMatrices.length!=bones.length*16)
                {
                    boneMatrices.length=bones.length*16;
                }

                for(var mi=0;mi<16;mi++)
                {
                    // var a=[0,0,0];
                    // mat4.getScaling(a,bones[i].matrix);
                    // console.log(bones[i].matrix[0],bones[i].matrix[5],bones[i].matrix[10]);
                    // bones[i].matrix[0]=1;
                    // bones[i].matrix[5]=1;
                    // bones[i].matrix[10]=1;
                    boneMatrices[i*16+mi]=bones[i].matrix[mi];
                }

                // cgl.pushModelMatrix();

                // triggerJoint.trigger();
                // cgl.popModelMatrix();
            }
            else
            {
                console.log('no bone matrix',i);
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