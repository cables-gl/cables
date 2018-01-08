

var exec=op.inFunction("Exec");

var joint=op.inValueSelect("Joint");

var next=op.outFunction("Next");

var cgl=op.patch.cgl;

var oldBones=null;
var oldBonesNum=0;

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
        }
        
        // joint=op.inValueSelect("Joint",values,oldValue);
        joint.setUiAttribs({"values":values});
    }
    
    if(joint.get()==cgl.frameStore.bone.name)
    {
        next.trigger();
    }
    
};