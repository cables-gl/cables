

// float boneIndex=2.0;
// if(skinIndex.x==boneIndex || skinIndex.y==boneIndex || skinIndex.z==boneIndex) // || skinIndex.w==1.0
// {
//     pos.xyz=vec3(999998.9,999998.9,999998.9);
// }


// if(skinIndex.x!=-1.0)
{
    int index=int(skinIndex.x);
    vec4 newPos=vec4(pos.xyz,1.0);
    newPos = (bone[index] * pos) * skinWeight.x ;
    norm = vec4((bone[index] * vec4(norm.xyz, 0.0)) * skinWeight.x).xyz;
    
    if(skinIndex.y!=-1.0)
    {
        index=int(skinIndex.y);
        newPos = (bone[index] * pos) * skinWeight.y +newPos;
        
    }
    
    if(skinIndex.z!=-1.0)
    {
        index=int(skinIndex.z);
        newPos = (bone[index] * pos) * skinWeight.z +newPos;
        
    }
    
    pos=newPos;
    
}
