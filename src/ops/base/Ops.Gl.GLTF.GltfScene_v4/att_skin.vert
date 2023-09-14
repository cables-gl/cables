int index=int(attrJoints.x);
vec4 newPos = (MOD_boneMats[index] * pos) * attrWeights.x;
vec3 newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.x).xyz);

index=int(attrJoints.y);
newPos += (MOD_boneMats[index] * pos) * attrWeights.y;
newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.y).xyz)+newNorm;

index=int(attrJoints.z);
newPos += (MOD_boneMats[index] * pos) * attrWeights.z;
newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.z).xyz)+newNorm;

index=int(attrJoints.w);
newPos += (MOD_boneMats[index] * pos) * attrWeights.w ;
newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.w).xyz)+newNorm;

pos=newPos;

norm=normalize(newNorm.xyz);


