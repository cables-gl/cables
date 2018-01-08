
// https://www.khronos.org/opengl/wiki/Skeletal_Animation


var render=op.inFunction("Render");
var inMeshIndex=op.inValueInt("MeshIndex");
var draw=op.inValueBool("draw",true);

var next=op.outFunction("Next");
var triggerJoint=op.outFunction("Joint");


var inGeom=op.inObject("Geometry");


var geom=null;
var mesh=null;
var shader=null;

var cgl=op.patch.cgl;
var meshIndex=0;
render.onLinkChanged=removeModule;
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
    // shader=null;
    if(shader)removeModule();
    scene=null;
    mesh=null;
    vertWeights=null;

}

inMeshIndex.onChange=reset;

inGeom.onChange=function()
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
    console.log('vert length',geom.vertices.length);
    
    
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
                vertWeights[index+0][0]=weight;
                // vertWeights[index+1][0]=weight;
                // vertWeights[index+2][0]=weight;
                vertIndex[index+0][0]=i;
                // vertIndex[index+1][0]=i;
                // vertIndex[index+2][0]=i;
                // vertWeights[index+3][0]=weight;
                // vertIndex[index+3][0]=i;
            }
            else if(vertWeights[index][1]==-1)
            {
                vertWeights[index+0][1]=weight;
                // vertWeights[index+1][1]=weight;
                // vertWeights[index+2][1]=weight;
                vertIndex[index+0][1]=i;
                // vertIndex[index+1][1]=i;
                // vertIndex[index+2][1]=i;

                // vertWeights[index][1]=weight;
                // vertIndex[index][1]=i;
            }
            else if(vertWeights[index][2]==-1)
            {
                // vertWeights[index][2]=weight;
                // vertIndex[index][2]=i;
                vertWeights[index+0][2]=weight;
                // vertWeights[index+1][2]=weight;
                // vertWeights[index+2][2]=weight;
                vertIndex[index+0][2]=i;
                // vertIndex[index+1][2]=i;
                // vertIndex[index+2][2]=i;

            }
            else if(vertWeights[index][3]==-1)
            {
                // vertWeights[index][3]=weight;
                // vertIndex[index][3]=i;
                vertWeights[index+0][3]=weight;
                // vertWeights[index+1][3]=weight;
                // vertWeights[index+2][3]=weight;
                vertIndex[index+0][3]=i;
                // vertIndex[index+1][3]=i;
                // vertIndex[index+2][3]=i;

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
console.log('vertWeights length',vi.length/4);

var vw=[].concat.apply([], vertWeights);
    // console.log(vi);
    mesh.setAttribute("skinIndex", vi,4);
    mesh.setAttribute("skinWeight",vw ,4);
    // console.log(wa);

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
        // inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
        // inSmooth.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'smooth',inSmooth);
        // inScale.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scale',inScale);

        // scrollx.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrollx',scrollx);
        // scrolly.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrolly',scrolly);
        // scrollz.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrollz',scrollz);

        // x.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'x',x);
        // y.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        // z.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);
        
        // updateWorldspace();
    }
    
    
    if(!shader)return;






    var scene=cgl.frameStore.currentScene.getValue();
    
    if(scene && scene.meshes && scene.meshes.length>meshIndex )
    {
        if(attribWeightsScene!=scene)
        {
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
                    boneMatrices[i*16+mi]=bones[i].matrix[mi];
                }
                
                
                
                // console.log(bones[i].transformed);
                
                cgl.pushModelMatrix();
                // transformed
                // mat4.translate(cgl.mvMatrix,cgl.mvMatrix,bones[i].transformed);
                
                // mat4.identity(cgl.mvMatrix);
                // mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,bones[i].matrix);
                
                
                triggerJoint.trigger();
                cgl.popModelMatrix();
            }
        }
        boneMatricesUniform.setValue(boneMatrices);
        // console.log(boneMatrices.length/16);
        
    }


    if(draw.get() && mesh)
    {
        if(mesh) mesh.render(cgl.getShader());
        next.trigger();
    }
    
};