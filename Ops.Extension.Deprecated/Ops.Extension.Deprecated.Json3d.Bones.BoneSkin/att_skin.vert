

if(skinIndex.x!=-1.0)
{
    int index=int(skinIndex.x);
    vec4 newPos = (bone[index] * pos) * skinWeight.x;
    vec3 newNorm = (vec4((bone[index] * vec4(norm.xyz, 0.0)) * skinWeight.x).xyz);
    
    if(skinIndex.y!=-1.0)
    {
        index=int(skinIndex.y);
        newPos = (bone[index] * pos) * skinWeight.y + newPos;
        newNorm = (vec4((bone[index] * vec4(norm.xyz, 0.0)) * skinWeight.y).xyz)+newNorm;
    }
    
    if(skinIndex.z!=-1.0)
    {
        index=int(skinIndex.z);
        newPos = (bone[index] * pos) * skinWeight.z + newPos;
        newNorm = (vec4((bone[index] * vec4(norm.xyz, 0.0)) * skinWeight.z).xyz)+newNorm;
    }

    if(skinIndex.w!=-1.0)
    {
        index=int(skinIndex.w);
        newPos = (bone[index] * pos) * skinWeight.w + newPos;
        newNorm = (vec4((bone[index] * vec4(norm.xyz, 0.0)) * skinWeight.w).xyz)+newNorm;
    }
    
    pos=newPos;
    norm=normalize(newNorm.xyz);
}
