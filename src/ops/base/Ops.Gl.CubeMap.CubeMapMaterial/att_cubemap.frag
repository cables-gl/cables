{{MODULES_HEAD}}
IN vec3 vCoords;
IN vec3 v_normal;
IN vec3 v_eyeCoords;
IN vec3 v_pos;

#ifdef TEX_FORMAT_CUBEMAP
    UNI samplerCube skybox;
    #define SAMPLETEX textureLod 
#endif
#ifndef TEX_FORMAT_CUBEMAP
    #define TEX_FORMAT_EQUIRECT
    UNI sampler2D skybox;
    #define SAMPLETEX sampleEquirect 
#endif

UNI mat4 modelMatrix;
UNI mat4 inverseViewMatrix;
UNI mat4 normalMatrix;
UNI float miplevel;

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
        return textureLod(tex,sampleSphericalMap(normalize(coord)),lod);
    }
#endif

void main()
{
    {{MODULE_BEGIN_FRAG}}

    vec3 N = normalize( mat3(normalMatrix) * v_normal).xyz;
    vec4 col = vec4(1.0,1.0,1.0,1.0);
    
    #ifdef DO_REFLECTION
        vec3 V = -v_eyeCoords;
        vec3 R = -reflect(V,N);
        vec3 T = ( mat3( inverseViewMatrix ) * R ).xyz;

        col = SAMPLETEX(skybox, T,miplevel*10.0);
    #endif

    #ifndef DO_REFLECTION
        vec3 no = ( mat3( inverseViewMatrix ) * N ).xyz;
        col = SAMPLETEX(skybox, normalize(no),miplevel*10.0);
    #endif

    {{MODULE_COLOR}}

    outColor=col;
}
