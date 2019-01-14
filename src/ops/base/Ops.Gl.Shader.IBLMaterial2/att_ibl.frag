{{MODULES_HEAD}}

IN vec3 vCoords;
IN vec3 viewDirection;
IN vec2 texCoord;

IN mat3 newNormalMatrix;

#ifdef TEX_FORMAT_CUBEMAP
    UNI samplerCube irradiance;
    UNI samplerCube mapReflection;
    #define SAMPLETEX textureLod
#endif
#ifndef TEX_FORMAT_CUBEMAP
    #define TEX_FORMAT_EQUIRECT
    UNI sampler2D irradiance;
    UNI sampler2D mapReflection;
    #define SAMPLETEX sampleEquirect
#endif

#ifdef TEX_ROUGHNESS
    UNI sampler2D maskRoughness;
#endif
UNI sampler2D maskReflection;
#ifdef TEX_DIFFUSE
    UNI sampler2D texDiffuse;
#endif

#ifdef TEX_AO
    UNI sampler2D texAo;
    UNI float aoIntensity;
#endif

#ifdef TEX_OPACITY
    UNI sampler2D texOpacity;
#endif

UNI float opacity;

UNI mat4 modelMatrix;
UNI mat4 inverseViewMatrix;
UNI mat4 normalMatrix;

UNI float fRotation;

UNI float mulReflection;
UNI float mulRoughness;

#ifdef GL_EXT_shader_texture_lod
    #define textureLod texture2DLodEXT
#endif

#ifdef TEX_NORMAL
    UNI float normalIntensity;
    UNI sampler2D texNormal;
#endif

#ifdef TEX_FORMAT_EQUIRECT

    vec4 sampleEquirect(sampler2D tex,vec3 coord,float lod)
    {
        vec2 uv = vec2(atan(coord.z, coord.x), asin(coord.y+1e-6));
        uv *= vec2(0.1591, 0.3183);
        uv += 0.5;

        return textureLod(tex,uv,lod);
    }

#endif

void main()
{
    {{MODULE_BEGIN_FRAG}}

    float rot=fRotation*6.28318531, sa=sin(rot), ca=cos(rot);
    mat2 matRotation = mat2(ca,sa,-sa,ca);

    vec3 theNormal;
    vec4 col = vec4(1.0,1.0,1.0,1.0);
    float amountRough=mulRoughness;
    float amountReflect=mulReflection;

    #ifdef TEX_ROUGHNESS
        amountRough*=texture2D(maskRoughness,texCoord).r ;
    #endif

    #ifdef TEX_REFLECTION
        amountReflect*=texture(maskReflection,texCoord).r;
    #endif




    #ifndef TEX_NORMAL
        vec3 N = newNormalMatrix[2];
    #else
        theNormal=texture(texNormal,texCoord).rgb*2.-1.;
        #ifdef TEX_NORMAL_FLIP
            theNormal.xy*=-1.;
        #endif
        theNormal=normalize(mix(vec3(0,0,1),theNormal,normalIntensity));
        vec3 N=newNormalMatrix * theNormal;
    #endif

    N=normalize(N);

    vec3 RN=N;
    RN.xz *= matRotation;
    col=SAMPLETEX(irradiance,RN,8.0);

    #ifdef TEX_AO
        col.rgb *= clamp(texture(texAo,texCoord).r+(1.0-aoIntensity),0.0,1.0);
    #endif

    #ifdef TEX_DIFFUSE
        col.rgb *= texture(texDiffuse,texCoord).rgb;
    #endif


    vec3 L = reflect(normalize(viewDirection),N);
    L.xz*=matRotation;
    L=normalize(L);
    // col.rgb=mix(col.rgb,SAMPLETEX(mapReflection, L, amountRough*10.0).rgb,amountReflect);
    col.rgb+=SAMPLETEX(mapReflection, L, amountRough*10.0).rgb*amountReflect;


    col.a=1.0;
    #ifdef TEX_OPACITY
        col.a*=texture(texOpacity,texCoord).r;
    #endif

    col.a*=opacity;
    // col.rgb=N.rgb;
    // col.rgb=vec3(opacity);

    {{MODULE_COLOR}}


    // #ifdef TEX_ROUGHNESS
    //     col=texture(maskRoughness,texCoord);
    // #endif

    outColor=col;

}


