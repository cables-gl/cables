

UNI float time;

UNI sampler2D tex;
UNI sampler2D texSpawnCoords;
UNI sampler2D texLifetimes;



IN vec2 texCoord;

void main()
{
    vec4 col=texture(tex,texCoord);

    float lifeTime=texture(texLifetimes,texCoord).r;


    // do respawn!
    if(lifeTime<0.1)
    {
        col=texture(texSpawnCoords,texCoord);
    }

    // #ifdef TEX_MASK
    //     col.a=texture(texMask,texCoord).r;
    // #endif


    // #ifdef GREY_R
    //     col.rgb=vec3(col.r);
    // #endif

    // #ifdef GREY_G
    //     col.rgb=vec3(col.g);
    // #endif

    // #ifdef GREY_B
    //     col.rgb=vec3(col.b);
    // #endif

    // #ifdef GREY_A
    //     col.rgb=vec3(col.a);
    // #endif

    // #ifdef GREY_LUMI
    //     col.rgb=vec3( dot(vec3(0.2126,0.7152,0.0722), col.rgb) );
    // #endif


    // #ifdef INVERT_A
    //     col.a=1.0-col.a;
    // #endif

    // #ifdef INVERT_R
    //     col.r=1.0-col.r;
    // #endif

    // #ifdef INVERT_G
    //     col.g=1.0-col.g;
    // #endif

    // #ifdef INVERT_B
    //     col.b=1.0-col.b;
    // #endif

    // #ifdef ALPHA_1
    //     col.a=1.0;
    // #endif


// col.a=time
col.a=1.0;
    // col=texture(texSpawnCoords,texCoord);
    outColor= col;

}