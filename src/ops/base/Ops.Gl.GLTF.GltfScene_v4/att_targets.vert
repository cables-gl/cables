


// int index=int(attrJoints.x);
// vec4 newPos = (MOD_boneMats[index] * pos) * attrWeights.x;
// vec3 newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.x).xyz);

// index=int(attrJoints.y);
// newPos += (MOD_boneMats[index] * pos) * attrWeights.y;
// newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.y).xyz)+newNorm;

// index=int(attrJoints.z);
// newPos += (MOD_boneMats[index] * pos) * attrWeights.z;
// newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.z).xyz)+newNorm;

// index=int(attrJoints.w);
// newPos += (MOD_boneMats[index] * pos) * attrWeights.w ;
// newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.w).xyz)+newNorm;

// pos=newPos;

// norm=normalize(newNorm.xyz);



float width=5646.0;
float height=57.0;
float numTargets=19.0;
float numLinesPerTarget=3.0;

float x=(attrVertIndex)/width;

float weights[19]=float[](
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.13333329558372498,
        0.0,
        0.053333330899477005,
        0.13333329558372498,
        0.0,
        0.03333333879709244,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0
      );

vec3 off;
for(float i=0.0;i<numTargets;i+=1.0)
{
    float targetIdx=i;
    float y=((numLinesPerTarget*targetIdx))/height;

    vec4 targetXYZ=texture(MOD_targetTex,vec2(x,1.0-y));

    int ii=int(i);
    off+=targetXYZ.xyz;//*weights[ii];

}
pos.xyz+=off;

// pos.x+=attrVertIndex;