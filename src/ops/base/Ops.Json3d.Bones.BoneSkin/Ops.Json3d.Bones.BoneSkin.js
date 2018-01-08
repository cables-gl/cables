
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

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

inMeshIndex.onChange=function()
{
    meshIndex=inMeshIndex.get();
};

inGeom.onChange=function()
{
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

var vertWeights=null;
var vertIndex=null;
var attribWeightsScene=-1;

function setupIndexWeights(jsonMesh)
{
    
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
    
    var bones=jsonMesh.bones;
    for(var i=0;i<bones.length;i++)
    {
        var bone=bones[i];

        for(var w=0;w<bone.weights.length;w++)
        {
            var index=bone.weights[w][0];
            var weight=bone.weights[w][1];
            
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

console.log(mesh);
mesh.setAttribute("skinIndex",[].concat.apply([], vertIndex) ,4);
    mesh.setAttribute("skinWeight",[].concat.apply([], vertWeights) ,4);

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

        // inSize.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'size',inSize);
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

    if(draw.get() && mesh)
    {
        if(mesh) mesh.render(cgl.getShader());
        next.trigger();
    }


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
                // console.log(bones[i].transformed);
                
                cgl.pushModelMatrix();
                // transformed
                // mat4.translate(cgl.mvMatrix,cgl.mvMatrix,bones[i].transformed);
                
                mat4.identity(cgl.mvMatrix);
                mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,bones[i].matrix);
                
                
                triggerJoint.trigger();
                cgl.popModelMatrix();
            }
        }

        
    }


    
};