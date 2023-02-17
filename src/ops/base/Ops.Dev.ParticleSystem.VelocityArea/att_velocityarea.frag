IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texPos;
UNI float strength;
UNI float falloff;
UNI float size;
UNI vec3 areaPos;
UNI vec3 scale;
UNI vec3 direction;

UNI float noiseStrength;
UNI vec4 noise;

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

void main()
{
    vec4 pos=texture(texPos,texCoord);
    vec4 col=texture(tex,texCoord);

    // col.xyz=(normalize(col.xyz)*mul)*fade+col.xyz*(1.0-fade);

    // if(pos.y<2.0)
    // col.g=1.0;
    // col.b=1.0;

    // float mul=clamp(abs(length(areaPos-pos.xyz)),0.0,size)/size;

    vec3 p=pos.xyz-areaPos;

    #ifdef MOD_AREA_SPHERE
        float MOD_de=MOD_sdSphere(p,size);
    #endif

    #ifdef MOD_AREA_BOX
        float MOD_de=MOD_sdRoundBox(p,scale,0.0);
    #endif

    MOD_de=1.0-MOD_map(
        MOD_de,
        0.0, falloff,
        0.0,1.0
        );

    // mul=clamp(mul,0.0,1.0);

    #ifdef METHOD_DIR
        if(length(direction)>0.0)
            col.xyz+=normalize(direction)*strength*MOD_de;
    #endif

    #ifdef METHOD_POINT

        // col.xyz+=normalize( pos.xyz-areaPos )*strength*MOD_de;

        if(MOD_de>0.0)
            col.xyz+=normalize( pos.xyz-areaPos )*strength*10.0*MOD_de;
    #endif


    #ifdef METHOD_COLLISION
        col.xyz+=(( pos.xyz-areaPos )*strength*10.0*MOD_de);
    #endif


    // vec4 noise
    // x: strngth
    // y: scale

    float noiseStrength=noise.x;
    float noiseScale=noise.y/10.0;

    col.xyz+=
        noiseStrength*
        vec3(
            Perlin3D( ( (pos.xyz+20.0) + pos.xyz) *noiseScale ),
            Perlin3D( ( (pos.xyz-20.0) + pos.xyz) *noiseScale ),
            Perlin3D( ( (pos.xyz+60.0) + pos.xyz) *noiseScale )
        );

// col.xyz=noise.rgb;

    outColor=col;
}



//