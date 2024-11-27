IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texPos;
UNI sampler2D texAbsVel;
UNI sampler2D texCollision;
UNI sampler2D texLifeProgress;

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
UNI sampler2D texTiming;

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

    vec4 timing=texture(texTiming,texCoord);
    float age=timing.g-timing.r;


    float lifeProgress=texture(texLifeProgress,texCoord).r;

    // collisionCol.r*=(1.0-(timeDiff*collisionFade));
    // collisionCol.a=1.0;
    // collisionCol.g=collisionCol.b=0.0;

    // if(age<0.1)collisionCol.r=0.0;
    // collisionCol.r*=1.0-step(0.3,age);

    vec3 p=pos.xyz-areaPos;
    float MOD_de=0.0;

    MOD_de=MOD_sdSphere(p,1.0); //size+falloff

    if(MOD_de>0.001)col.rgb=vec3(MOD_de,MOD_de,MOD_de)*-20.0;
col.a=1.0;




if(isnan(col.r)||isnan(col.g))col=vec4(0.0,1.0,1.0,1.0);

col=vec4(0.0,1.0,1.0,1.0);


    outColor0=col;
    outColor1=collisionCol;
    outColor2=col;
    outColor3=col;
}



//