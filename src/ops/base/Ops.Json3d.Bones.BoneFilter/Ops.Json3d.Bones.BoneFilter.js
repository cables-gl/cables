var exec=op.inFunction("Exec");
var joint=op.inValueSelect("Joint");
var next=op.outFunction("Next");

var cgl=op.patch.cgl;

var oldBones=null;
var oldBonesNum=0;
var boneIndex=-1;


joint.onChange=function()
{
    if(oldBones)
    {
        for(var i=0;i<oldBones.length;i++)
        {
            if(joint.get()==oldBones[i].name)boneIndex=i;
        }
        
    }
    
};


exec.onTriggered=function()
{

    if(cgl.frameStore.bones!=oldBones || oldBonesNum!=cgl.frameStore.bones.length)
    {
        var bones=oldBones=cgl.frameStore.bones;
        oldBonesNum=cgl.frameStore.bones.length;
        
        var values=[];
        var oldValue=joint.get();
        
        for(var i=0;i<bones.length;i++)
        {
            // console.log(i,bones[i].name );
            values.push(bones[i].name);
            
            if(joint.get()==bones[i].name)boneIndex=i;
            
        }
        
        // joint=op.inValueSelect("Joint",values,oldValue);
        joint.setUiAttribs({"values":values});
    }

    
    if(cgl.frameStore.bones)
    {
        
        // for(var i=0;i<cgl.frameStore.bones.length;i++)
        
        var bone=cgl.frameStore.bones[boneIndex];
        {
            // if(i)
            cgl.pushModelMatrix();
    
            mat4.mul(cgl.mvMatrix,cgl.mvMatrix,bone.boneMatrix);
            // mat4.translate()
            // cgl.frameStore.bones.transformed
            next.trigger();
            cgl.popModelMatrix();

            
        }
        
    }
    
};

