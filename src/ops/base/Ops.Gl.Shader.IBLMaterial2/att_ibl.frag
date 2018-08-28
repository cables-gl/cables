{{MODULES_HEAD}}
IN vec3 vCoords;
// IN vec3 v_normal;
IN vec3 v_eyeCoords;
IN vec3 v_pos;
IN vec2 texCoord;

IN mat3 newNormalMatrix;

#ifdef TEX_FORMAT_CUBEMAP
    UNI samplerCube skybox;
    UNI samplerCube mapReflection;
    #define SAMPLETEX textureLod 
#endif
#ifndef TEX_FORMAT_CUBEMAP
    #define TEX_FORMAT_EQUIRECT
    UNI sampler2D skybox;
    UNI sampler2D mapReflection;
    #define SAMPLETEX sampleEquirect 
#endif

UNI sampler2D maskRoughness;
UNI sampler2D maskReflection;
#ifdef TEX_DIFFUSE
    UNI sampler2D texDiffuse;
#endif

#ifdef TEX_AO
    UNI sampler2D texAo;
    UNI float aoIntensity;
#endif

UNI mat4 modelMatrix;
UNI mat4 inverseViewMatrix;
UNI mat4 normalMatrix;

UNI float fRotation;

UNI float mulReflection;
UNI float mulRoughness;

#ifdef TEX_NORMAL
    IN vec3 N;
    IN vec3 B;
    IN vec3 T;
    UNI float normalIntensity;
    UNI sampler2D texNormal;

    vec3 normalMap() {
        vec3 theNormal=texture2D(texNormal,texCoord).rgb*2.0-1.0;

        theNormal=normalize(mix(vec3(0.0,0.0,1.0),theNormal,normalIntensity));

        vec3 r=normalize( newNormalMatrix * theNormal );
        r.xz*=-1.0;

        return r;
    }
#endif

vec3 desaturate(vec3 color, float amount)
{
   vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), color));
   return vec3(mix(color, gray, amount));
}

#ifdef TEX_FORMAT_EQUIRECT
    const vec2 invAtan = vec2(0.1591, 0.3183);
    vec2 sampleSphericalMap(vec3 direction)
    {
        vec2 uv = vec2(atan(direction.z, direction.x), asin(direction.y));
        uv *= invAtan;
        uv += 0.5;
        return uv;
    }
    
    vec4 sampleEquirect(sampler2D tex,vec3 coord,float lod)
    {
        return textureLod(tex,sampleSphericalMap(coord),lod);
    }
#endif

vec4 reflection(vec3 N, float amountReflect, float amountRough)
{
    vec3 V = (v_eyeCoords);
    vec3 R = reflect(V,N);
    
    // R.y*=-1.;
    vec3 T = ( normalize(R) ).xyz;

    // rotate 
    // float r = fRotation * 6.2831853071, sa=sin(r),ca=cos(r);
    // T.xz*=mat2(ca,sa,-sa,ca);

    #ifdef FLIPX
        T.x*=-1.0;
    #endif
    #ifdef FLIPY
        T.y*=-1.0;
    #endif

    return amountReflect*SAMPLETEX(mapReflection, T, amountRough*10.0);
}

void main()
{
    {{MODULE_BEGIN_FRAG}}

    vec3 theNormal;
    vec4 col = vec4(1.0,1.0,1.0,1.0);
    float amountRough=mulRoughness;
    float amountReflect=mulReflection;
    
    #ifdef TEX_ROUGHNESS
        amountRough=texture2D(maskRoughness,texCoord).r;
    #endif

    #ifdef TEX_REFLECTION
        amountReflect*=texture2D(maskReflection,texCoord).r;
    #endif
    amountReflect=smoothstep(0.0,1.0,amountReflect);

    vec3 N = newNormalMatrix[2];

    #ifdef TEX_NORMAL
       N=normalMap();
    #endif

    // vec3 no = ( mat3( inverseViewMatrix ) * normalize(N) ).xyz;

    // #ifdef FLIPY
    //     no.y*=-1.0;
    // #endif

    // no.xz*=mat2(ca,sa,-sa,ca);

    col=SAMPLETEX(skybox, normalize(N),8.0);

    #ifdef TEX_DIFFUSE
        col*=texture2D(texDiffuse,texCoord);
    #endif
    
    col+=reflection(N,amountReflect,amountRough);
    
    #ifdef TEX_AO
        float ao=texture2D(texAo,texCoord).r;
        col.rgb *= clamp(ao+(1.0-aoIntensity),0.0,1.0);
    #endif
    
    // col.rgb=N;//normalMap();
    // col.rgb=normalize(v_eyeCoords);

    {{MODULE_COLOR}}

    outColor=col;

}


