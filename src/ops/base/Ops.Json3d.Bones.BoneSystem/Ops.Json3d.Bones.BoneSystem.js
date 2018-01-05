// https://www.khronos.org/opengl/wiki/Skeletal_Animation
// http://ogldev.atspace.co.uk/www/tutorial38/tutorial38.html

var render=op.inFunction("Render");

var next=op.outFunction("Next");
var outNumBounes=op.outValue("Num Bones");
var outSpline=op.outArray("Spline");
var outJoint=op.outFunction("Joint Trigger");




var cgl=op.patch.cgl;

var scene=null;

var points=[];
var tempMat=mat4.create();
var tempVec=vec3.create();
var emptyVec=vec3.create();
var transVec=vec3.create();

var q=quat.create();
var qMat=mat4.create();

function isBone(name)
{
    for(var j=0;j<scene.meshes.length;j++)
        if(scene.meshes[j].bones)
            for(var i=0;i<scene.meshes[j].bones.length;i++)
                if(scene.meshes[j].bones[i].name==name)
                    return true;
    return false;
}

function findAnimation(name)
{
    var an=0;
    for(var i=0;i<scene.animations[an].channels.length;i++)
    {
        if(scene.animations[an].channels[i].name==name)
        {
            return scene.animations[an].channels[i];
        }
    }
    return null;
}


function findBoneChilds(n,parent)
{
    cgl.pushModelMatrix();

    if(isBone(n.name) && n!=scene.rootnode)
    {
        var time=op.patch.timer.getTime();
        var anim=findAnimation(n.name);

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

        mat4.copy( tempMat, n.transformation );
        mat4.transpose( tempMat, n.transformation );
        // mat4.multiply( cgl.mvMatrix, cgl.mvMatrix, tempMat );
        
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

        vec3.transformMat4( tempVec, [0,0,0], cgl.mvMatrix );
        n.transformed=tempVec.slice(0);
        if(parent && parent.transformed)
        {
            points.push( parent.transformed[0], parent.transformed[1], parent.transformed[2] );    
            points.push( tempVec[0], tempVec[1], tempVec[2] );    
        }
        
        if(fillBoneList) boneList.push(n);

        cgl.frameStore.bone=n;
        
        outJoint.trigger();
    }

    for(var i=0;i<n.children.length;i++)
    {
        if(isBone(n.children[i].name))
        {
            bones++;
        }
        if(n.children[i].children)findBoneChilds(n.children[i],n);
    }
    
    cgl.popModelMatrix();

    return bones;
}

var bones=0;
var oldScene=null;
var boneList=[];
var fillBoneList=true;

render.onTriggered=function()
{
    points.length=0;
    scene=cgl.frameStore.currentScene.getValue();

    cgl.frameStore.bones=boneList;

    if(!scene)return;
    
    if(scene!=oldScene)
    {
        fillBoneList=true;
        boneList.length=0;        
        oldScene=scene;
    }

    bones=0;

    findBoneChilds(scene.rootnode,null);
    

    outSpline.set(points);

    outNumBounes.set(bones);

    next.trigger();

    fillBoneList=false;



};


