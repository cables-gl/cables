IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texPos;
UNI sampler2D texAbsVel;
UNI sampler2D texCollision;
UNI sampler2D texLifeProgress;
UNI sampler2D texTargetPos;

UNI float strength;
UNI float size;
UNI vec3 areaPos;
UNI vec3 scale;
UNI vec3 rot;

UNI vec3 direction;
UNI vec4 collisionParams;
UNI float timeDiff;
UNI float collisionFade;

UNI vec3 ageMul; // x age start - y age end - z age fade
UNI sampler2D texTiming;

{{CGL.RANDOM_LOW}}


mat3 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
                );
}



void main()
{
    vec4 pos=texture(texPos,texCoord);
    vec4 col=texture(tex,texCoord);
    col.a=1.0;



    vec4 collisionCol=texture(texCollision,texCoord);

    vec4 timing=texture(texTiming,texCoord);
    float age=timing.g-timing.r;


    float lifeProgress=texture(texLifeProgress,texCoord).r;

    collisionCol.r*=(1.0-(timeDiff*collisionFade));
    collisionCol.a=1.0;
    collisionCol.g=collisionCol.b=0.0;


    vec3 p=pos.xyz-areaPos;
    float MOD_de=0.0;


    ////////////////////
    // build multiplyer strength + falloff + timing adjust ...
    // fade in to falloff...
    float mul=1.0;


    float finalStrength=strength*mul;
    vec3 finalStrength3=vec3(finalStrength);

    if(finalStrength > 0.0)
    {
        vec3 targetPos = texture(texTargetPos, texCoord).xyz;

        #ifdef DO_ROT
            targetPos*=rotationMatrix(vec3(1.0,0.0,0.0), rot.x/57.29577951308232);
            targetPos*=rotationMatrix(vec3(0.0,1.0,0.0), rot.y/57.29577951308232);
            targetPos*=rotationMatrix(vec3(0.0,0.0,1.0), rot.z/57.29577951308232);
        #endif

        targetPos*=scale;
        targetPos+=areaPos;

        vec3 direction = targetPos - pos.xyz;
        float distance = length(direction);

        float lerpFactor = min(finalStrength * timeDiff, 1.0); // / max(distance, falloff)

        // Lerp towards the target position
        vec3 newPos = mix(pos.xyz, targetPos, lerpFactor);

        // Set the velocity to move towards the new position
        col.xyz += (newPos - pos.xyz) / timeDiff;
    }

    if(isnan(col.r)||isnan(col.g))col=vec4(0.0,1.0,1.0,1.0);

    outColor0=col;
    outColor1=collisionCol;
    outColor2=col;
    outColor3=col;
}



//