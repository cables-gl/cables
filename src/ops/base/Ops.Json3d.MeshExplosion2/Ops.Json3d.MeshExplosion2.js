const render=op.inTrigger("Render");
const expansion=op.inValue("Expansion");
const next=op.outTrigger("Next");

const inRotX=op.inValueSlider("Rotation X",1);
const inRotY=op.inValueSlider("Rotation Y",1);
const inRotZ=op.inValueSlider("Rotation Z",1);

const inDirectionX=op.inValueSlider("Direction X",1);
const inDirectionY=op.inValueSlider("Direction Y",1);
const inDirectionZ=op.inValueSlider("Direction Z",1);

const cgl=op.patch.cgl;
var currentIndex=-1;

render.onTriggered=doRender;
render.onLinkChanged=reload;

var objects=[];

var tempVec=vec3.create();
var tempMat4=mat4.create();

var empty=vec3.create();
var dirVec=vec3.create();

function doRender()
{
    if(objects.length===0)reload();

    for(var i=0;i<objects.length;i++)
    {
        if(objects[i].transformation)
        {
            cgl.pushModelMatrix();
            mat4.copy(tempMat4,objects[i].transformation);
            vec3.transformMat4(tempVec, empty, tempMat4);

            vec3.normalize(tempVec,tempVec);

            vec3.set(dirVec,
                expansion.get()*inDirectionX.get(),
                expansion.get()*inDirectionY.get(),
                expansion.get()*inDirectionZ.get());
            vec3.mul(tempVec,tempVec,dirVec);

            mat4.translate(tempMat4,tempMat4,tempVec);

            mat4.rotateX(tempMat4,tempMat4,expansion.get()*0.006*objects[i].rotation[0]*inRotX.get());
            mat4.rotateY(tempMat4,tempMat4,expansion.get()*0.006*objects[i].rotation[1]*inRotY.get());
            mat4.rotateZ(tempMat4,tempMat4,expansion.get()*0.006*objects[i].rotation[2]*inRotZ.get());

            // mat4.multiply(cgl.mMatrix,cgl.mMatrix,objects[i].transformation);
            mat4.multiply(cgl.mMatrix,cgl.mMatrix,tempMat4);

            objects[i].mesh.render(cgl.getShader());
            next.trigger();
            cgl.popModelMatrix();
        }
    }
}

function addObject(obj)
{
    Math.randomSeed=5711;
    if(obj.meshes)
    {
        var object={};

        var jsonMesh=cgl.frameStore.currentScene.getValue().meshes[ obj.meshes[0] ];

        var verts=JSON.parse(JSON.stringify(jsonMesh.vertices));
        var geom=new CGL.Geometry();

        geom.vertices=verts;
        geom.vertexNormals=jsonMesh.normals;
        geom.tangents=jsonMesh.tangents;
        geom.biTangents=jsonMesh.bitangents;

        if(jsonMesh.texturecoords) geom.texCoords = jsonMesh.texturecoords[0];
        geom.verticesIndices=[];
        geom.verticesIndices=[].concat.apply([], jsonMesh.faces);

        object.mesh=new CGL.Mesh(cgl,geom);
        object.transformation=JSON.parse(JSON.stringify(obj.transformation));

        object.rotation=[
            Math.seededRandom(),
            Math.seededRandom(),
            Math.seededRandom() ];

        mat4.transpose(object.transformation,object.transformation);
        objects.push(object);
    }


    if(obj.children)
    {
        for(var i in obj.children)
        {
            addObject(obj.children[i]);
        }
    }
}


function reload()
{
    if(!cgl.frameStore.currentScene || !cgl.frameStore.currentScene.getValue())return;

    objects.length=0;

    console.log(cgl.frameStore.currentScene.getValue());

    addObject( cgl.frameStore.currentScene.getValue().rootnode );
    console.log('got # objects...',objects.length);
}




