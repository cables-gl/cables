

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


#ifdef GL_EXT_shader_texture_lod
    #define textureLod texture2DLodEXT
#endif


#ifdef TEX_NORMAL
    UNI float normalIntensity;
    UNI sampler2D texNormal;
    vec3 normalMap() {
        vec3 theNormal=texture2D(texNormal,texCoord).rgb*2.-1.;
        #ifdef TEX_NORMAL_FLIP
            theNormal.xy*=-1.;
        #endif
        theNormal=normalize(mix(vec3(0,0,1),theNormal,normalIntensity));
        return normalize( newNormalMatrix * theNormal );
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
        vec2 uv = vec2(atan(direction.z, direction.x), asin(direction.y+1e-6));
        uv *= invAtan;
        uv += 0.5;
        return uv;
    }
    
    vec4 sampleEquirect(sampler2D tex,vec3 coord,float lod)
    {
        return textureLod(tex,sampleSphericalMap(coord),lod);
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
    N=normalize(N);

    vec3 RN=N;
    RN.xz*=matRotation;
    col=SAMPLETEX(irradiance,RN,8.0);

    #ifdef TEX_AO
        col.rgb *= clamp(texture2D(texAo,texCoord).r+(1.0-aoIntensity),0.0,1.0);
    #endif

    #ifdef TEX_DIFFUSE
        col*=texture2D(texDiffuse,texCoord);
    #endif


    vec3 L = reflect(normalize(viewDirection),normalize(N));
    L.xz*=matRotation;
    
    // col.rgb=mix(col.rgb,SAMPLETEX(mapReflection, L, amountRough*10.0).rgb,amountReflect);
    col.rgb+=SAMPLETEX(mapReflection, L, amountRough*10.0).rgb*amountReflect;

    {{MODULE_COLOR}}

    outColor=col;

}


