// https://www.khronos.org/opengl/wiki/Skeletal_Animation
// http://ogldev.atspace.co.uk/www/tutorial38/tutorial38.html

var render=op.inFunction("Render");
var inMeshIndex=op.inValueInt("Mesh Index");

var inTime=op.inValue("Time");

var next=op.outFunction("Next");
var outNumBounes=op.outValue("Num Bones");
var outSpline=op.outArray("Spline");
var outJoint=op.outFunction("Joint Trigger");

var points=[];
var tempMat=mat4.create();
var tempVec=vec3.create();
var emptyVec=vec3.create();
var transVec=vec3.create();
var alwaysEmptyVec=vec3.create();
var q=quat.create();
var qMat=mat4.create();
var boneMatrix=mat4.create();

var cgl=op.patch.cgl;
var scene=null;
var meshIndex=0;
var bones=0;
var oldScene=null;
var boneList=[];
var fillBoneList=true;
var pointCounter=0;

inMeshIndex.onChange=function()
{
    meshIndex=inMeshIndex.get();
};

function findBoneChilds(n,parent,foundBone)
{
    function isBone(name)
    {
        if(scene.meshes[meshIndex].bones)
            for(var i=0;i<scene.meshes[meshIndex].bones.length;i++)
                if(scene.meshes[meshIndex].bones[i].name==name)
                    return scene.meshes[meshIndex].bones[i];
        return false;
    }

    function findAnimation(name)
    {
        var an=0;
        for(var i=0;i<scene.animations[an].channels.length;i++)
            if(scene.animations[an].channels[i].name==name)
                return scene.animations[an].channels[i];

        return null;
    }

// if(parent)console.log(parent.name+'  -  '+n.name);

    var time=op.patch.timer.getTime();
    if(inTime.isLinked() || inTime.get()!==0)time=inTime.get();

    cgl.pushModelMatrix();

    var bone=isBone(n.name);

    if( (bone||foundBone) && n!=scene.rootnode)
    {
        foundBone=true;
        
        if(!n.anim)
        {
            // create anim objects for translation/rotation
            var anim=findAnimation(n.name);
            if(anim)
            {
                n.anim=anim;
        
                if(anim && !n.quatAnimX && anim.rotationkeys)
                {
                    n.quatAnimX=new CABLES.TL.Anim();
                    n.quatAnimY=new CABLES.TL.Anim();
                    n.quatAnimZ=new CABLES.TL.Anim();
                    n.quatAnimW=new CABLES.TL.Anim();
            
                    for(var k in anim.rotationkeys)
                    {
                        n.quatAnimX.setValue( anim.rotationkeys[k][0],anim.rotationkeys[k][1][1] );
                        n.quatAnimY.setValue( anim.rotationkeys[k][0],anim.rotationkeys[k][1][2] );
                        n.quatAnimZ.setValue( anim.rotationkeys[k][0],anim.rotationkeys[k][1][3] );
                        n.quatAnimW.setValue( anim.rotationkeys[k][0],anim.rotationkeys[k][1][0] );
                    }
                }
                if(anim && !n.posAnimX && anim.positionkeys)
                {
                    n.posAnimX=new CABLES.TL.Anim();
                    n.posAnimY=new CABLES.TL.Anim();
                    n.posAnimZ=new CABLES.TL.Anim();
            
                    for(var k in anim.positionkeys)
                    {
                        n.posAnimX.setValue( anim.positionkeys[k][0],anim.positionkeys[k][1][0] );
                        n.posAnimY.setValue( anim.positionkeys[k][0],anim.positionkeys[k][1][1] );
                        n.posAnimZ.setValue( anim.positionkeys[k][0],anim.positionkeys[k][1][2] );
                    }
                }
            }
        }

        if(n.posAnimX)
        {
            transVec[0]=n.posAnimX.getValue(time);
            transVec[1]=n.posAnimY.getValue(time);
            transVec[2]=n.posAnimZ.getValue(time);
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix,transVec);
        }

        if(n.quatAnimX)
        {
            CABLES.TL.Anim.slerpQuaternion(time,q,
                n.quatAnimX,
                n.quatAnimY,
                n.quatAnimZ,
                n.quatAnimW);
            mat4.fromQuat(qMat, q);
            mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, qMat);
        }

        // get position
        vec3.transformMat4( tempVec, alwaysEmptyVec, cgl.mvMatrix );
        if(!n.boneMatrix)
        {
            n.boneMatrix=mat4.create();
            n.transformed=vec3.create();
        }
        vec3.copy(n.transformed,tempVec);
        
        mat4.copy(n.boneMatrix,cgl.mvMatrix);

        // store absolute bone matrix
        if(bone)
        {
            if(!bone.matrix)bone.matrix=mat4.create();
            mat4.copy(bone.matrix,cgl.mvMatrix);
            
            if(!bone.transposedOffsetMatrix)
            {
                mat4.transpose( bone.offsetmatrix, bone.offsetmatrix );
                bone.transposedOffsetMatrix=true;
            }
            mat4.mul(bone.matrix,bone.matrix,bone.offsetmatrix);
        }

        if(parent && parent.transformed)
        {
            points[pointCounter++]=parent.transformed[0];
            points[pointCounter++]=parent.transformed[1];
            points[pointCounter++]=parent.transformed[2];

            points[pointCounter++]=tempVec[0];
            points[pointCounter++]=tempVec[1];
            points[pointCounter++]=tempVec[2];
        }

        if(fillBoneList) boneList.push(n);
        cgl.frameStore.bone=n;
    }

    if(n.children)
    {
        for(var i=0;i<n.children.length;i++)
        {
            if(isBone(n.children[i].name)) bones++;
            findBoneChilds(n.children[i],n,foundBone);
        }
    }
    
    cgl.popModelMatrix();

    return bones;
}

render.onTriggered=function()
{
    pointCounter=0;
    bones=0;
    scene=cgl.frameStore.currentScene.getValue();
    cgl.frameStore.bones=boneList;

    if(!scene)return;
    if(scene!=oldScene)
    {
        fillBoneList=true;
        boneList.length=0;
        oldScene=scene;
    }

    cgl.pushModelMatrix();
    mat4.identity(cgl.mvMatrix);
    findBoneChilds(scene.rootnode,null,false);
    cgl.popModelMatrix();

outSpline.set(null);
    outSpline.set(points);
    outNumBounes.set(bones);
    fillBoneList=false;

    next.trigger();
    cgl.frameStore.bones=null;
};


