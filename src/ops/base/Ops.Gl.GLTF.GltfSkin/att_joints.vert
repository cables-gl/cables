




    // if(attrJoints.x!=-1.0)
    {
        int index=int(attrJoints.x);
        vec4 newPos = (MOD_boneMats[index] * pos) * attrWeights.x;
        vec3 newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.x).xyz);

        // if(attrJoints.y!=-1.0)
        {
            index=int(attrJoints.y);
            newPos += (MOD_boneMats[index] * pos) * attrWeights.y;
            newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.y).xyz)+newNorm;
        }

        // if(attrJoints.z!=-1.0)
        {
            index=int(attrJoints.z);
            newPos += (MOD_boneMats[index] * pos) * attrWeights.z;
            newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.z).xyz)+newNorm;
        }

        // if(attrJoints.w!=-1.0)
        {
            index=int(attrJoints.w);
            newPos += (MOD_boneMats[index] * pos) * attrWeights.w ;
            newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.w).xyz)+newNorm;
        }

        pos=newPos;
        norm=normalize(newNorm.xyz);
    }



// mat4 skinMatrix =
//     attrWeights.x * MOD_boneMats[int(attrJoints.x)] +
//     attrWeights.y * MOD_boneMats[int(attrJoints.y)] +
//     attrWeights.z * MOD_boneMats[int(attrJoints.z)] +
//     attrWeights.w * MOD_boneMats[int(attrJoints.w)];

// mMatrix*=skinMatrix;









