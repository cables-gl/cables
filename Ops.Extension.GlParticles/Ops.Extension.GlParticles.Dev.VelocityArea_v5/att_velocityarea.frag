IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texPos;
UNI sampler2D texAbsVel;

UNI sampler2D texLifeProgress;
UNI sampler2D texCollision;
UNI sampler2D texCollided;
UNI sampler2D texTiming;

UNI float reset;
UNI float strength;
UNI float falloff;
UNI float size;
UNI vec3 areaPos;
UNI vec3 scale;
UNI vec3 direction;
UNI vec4 collisionParams;
UNI float timeDiff;
UNI float collisionFade;

UNI vec3 ageMul; // x age start - y age end - z age fade


{{CGL.RANDOM_LOW}}


#ifdef HAS_TEX_MUL
    UNI sampler2D texMul;
#endif

float MOD_sdSphere( vec3 p, float s )
{
    return length(p)-s;
}

float MOD_map(float value,float min1,float max1,float min2,float max2)
{
    return max(min2,min(max2,min2 + (value - min1) * (max2 - min2) / (max1 - min1)));
}

float MOD_sdRoundBox( vec3 p, vec3 b, float r )
{
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}


void pR(inout vec2 p, float a)
{
	p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}


mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}



void main()
{
    vec4 pos=texture(texPos,texCoord);
    vec4 col=texture(tex,texCoord);
    col.a=1.0;

    vec4 collisionCol=texture(texCollision,texCoord);
    vec4 collidedCol=texture(texCollided,texCoord);

    vec4 timing=texture(texTiming,texCoord);
    float age=timing.g-timing.r;


    float lifeProgress=texture(texLifeProgress,texCoord).r;

    collisionCol.r*=(1.0-(timeDiff*collisionFade));
    collisionCol.a=1.0;
    collisionCol.g=collisionCol.b=0.0;



    // if(age<0.1)collisionCol.r=0.0;
    // collisionCol.r*=1.0-step(0.3,age);

    vec3 p=pos.xyz-areaPos;
    float MOD_de=0.0;

    #ifdef MOD_AREA_SPHERE
        MOD_de=MOD_sdSphere(p,size+falloff);
    #endif

    #ifdef MOD_AREA_BOX
        MOD_de=MOD_sdRoundBox(p,scale+falloff,0.0);
    #endif

    #ifdef MOD_AREA_EVERYWHERE
        MOD_de=0.0;
    #endif

    #ifdef INVERT_SHAPE
        MOD_de=1.0-MOD_de;
    #endif


    ////////////////////
    // build multiplyer strength + falloff + timing adjust ...
    // fade in to falloff...
    float mul=1.0-MOD_map(
        MOD_de,
        0.0, falloff,
        0.0,1.0
        );
    #ifdef HAS_TEX_TIMING
        mul*=smoothstep(0.0,1.0, MOD_map(age,ageMul.x,ageMul.x+ageMul.z,0.0,1.0));
    #endif

    float finalStrength=strength*mul;
    vec3 finalStrength3=vec3(finalStrength);

    #ifdef HAS_TEX_MUL
        finalStrength3*=texture(texMul,texCoord).rgb;
    #endif


    ///////////////////////////////////////////
    // methods...

    #ifdef METHOD_DIR
        if(length(direction)>0.0)
            col.xyz+=normalize(direction)*finalStrength3;
    #endif

    #ifdef METHOD_VORTEX
        vec3 np= vec3( -(pos.xyz+areaPos).y, (pos.xyz+areaPos).x ,(pos.xyz+areaPos).z) / dot(pos.xyz,pos.xyz);      // field around a vortex
        col.xyz+=(pos.xyz-np)*strength;
    #endif


    if(finalStrength>0.1) collidedCol=vec4(1.0,1.0,1.0,1.0);
    // else collidedCol=vec4(0.0,0.0,0.0,1.0);
    if(lifeProgress<0.1)collidedCol=vec4(0.0,0.0,0.0,1.0);
    collidedCol.a=1.0;


    #ifdef METHOD_POINT
        col.xyz+=normalize(pos.xyz-areaPos)*finalStrength3;
    #endif


    #ifdef METHOD_ROTATE

        if(finalStrength>0.0)
        {
            // 2d rot....
            // vec2 a=pos.xy;
            // pR(a, timeDiff);
            // col.xy=normalize(pos.xy-a)*strength;

            vec3 p=pos.xyz;
            vec4 vecV=normalize(vec4(areaPos-p,1.0));

            vecV*=rotationMatrix(vec3(1.0,0.0,0.0), direction.x)*
            rotationMatrix(vec3(0.0,1.0,0.0), direction.y)*
            rotationMatrix(vec3(0.0,0.0,1.0), direction.z);

            col.rgb+=(normalize(vecV.rgb).rgb*finalStrength);
        }

    #endif



    #ifdef METHOD_COLLISION

        if(finalStrength>0.0)
        {
            // collisionParams
            // x: bouncyness
            // y: dir randomness
            // z: forceoutwards
            // w: tbd

            collisionCol.ra=vec2(1.0);

            float bouncyness=collisionParams.x*cgl_random(texCoord*13.0+MOD_de)*collisionParams.x;

            bouncyness*=lifeProgress;

            float outwardForce=collisionParams.z;

            vec4 oldVel=texture(texAbsVel,texCoord);
            // vec3 oppositeDir=oldVel.xyz*-vec3(1.0+(MOD_de*2.0));
            vec3 oppositeDir=oldVel.xyz*-1.0;

            vec3 r=normalize((vec3( cgl_random(texCoord),cgl_random(texCoord*200.0),cgl_random(texCoord*10.0) )-0.5)*2.0)*collisionParams.y;


            if(MOD_de>0.5)
            {
                col.xyz+=1110000.0;
                col.a=0.0;
            }
            else
            col.xyz+=((oppositeDir*(bouncyness) + (pos.xyz-areaPos) * outwardForce)+r) * finalStrength;
        }

    #endif

    if(isnan(col.r)||isnan(col.g))col=vec4(0.0,1.0,1.0,1.0);

    outColor0=col;
    outColor1=collisionCol;
    outColor2=collidedCol;
    outColor3=col;
}


