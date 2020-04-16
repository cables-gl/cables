{{MODULES_HEAD}}

#define PI 3.14159265358
#define PI_TWO 2.*PI
#define RECIPROCAL_PI 1./PI
#define RECIPROCAL_PI2 RECIPROCAL_PI/2.

IN vec3 vCoords;
IN vec3 v_normal;
IN vec3 v_eyeCoords;
IN vec3 v_pos;
IN mat3 normalMatrix;
IN vec3 texCoords;
IN vec3 reflectionTexCoords;
IN vec3 normInterpolated;
IN vec3 fragPos;

UNI vec3 camPos;
UNI float inRotation;
UNI vec3 inColor;

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
UNI float miplevel;

#ifdef TEX_FORMAT_EQUIRECT
    const vec2 invAtan = vec2(0.1591, 0.3183);
    vec4 sampleEquirect(sampler2D tex,vec3 direction,float lod)
    {
        vec3 newDirection = normalize(direction);
		vec2 sampleUV;
		sampleUV.x = -1. * (atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.75);
		sampleUV.y = asin( clamp(direction.y, -1., 1.) ) * RECIPROCAL_PI + 0.5;

        return textureLod(tex,sampleUV,lod);
    }
#endif

void main()
{
    float rot = inRotation * PI_TWO;
    float sa = sin(rot);
    float ca = cos(rot);
    mat2 matRotation = mat2(ca,sa,-sa,ca);

    {{MODULE_BEGIN_FRAG}}

    vec3 normal = normalize(normInterpolated);

    vec4 col = vec4(1.0,1.0,1.0,1.0);
    vec3 viewDirection = normalize((camPos - fragPos));

    #ifdef DO_REFLECTION
        vec3 envMapNormal = normal;
        vec3 reflectDirection = reflect(-viewDirection, normal);

        #ifdef USE_SKYBOX
            if (gl_FrontFacing) {
                reflectDirection.yz *= -1.;
            } else {
                reflectDirection.x *= -1.;
            }
        #endif
        #ifndef USE_SKYBOX
            reflectDirection.x *= -1.;
        #endif
        #ifdef FLIP_X
            reflectDirection.x *= -1.;
        #endif
        #ifdef FLIP_Y
            reflectDirection.y *= -1.;
        #endif
        #ifdef FLIP_Z
            reflectDirection.z *= -1.;
        #endif

        reflectDirection.xz *= matRotation;
        col = SAMPLETEX(skybox, reflectDirection,1. + miplevel*10.0);
    #endif

    #ifndef DO_REFLECTION
          normal.x *= -1.;
        #ifdef FLIP_X
            normal.x *= -1.;
        #endif
        #ifdef FLIP_Y
            normal.y *= -1.;
        #endif
        #ifdef FLIP_Z
            normal.z *= -1.;
        #endif

        normal.xz *= matRotation;

        col = SAMPLETEX(skybox, normal, miplevel * 10.0);
    #endif

    #ifdef COLORIZE
        col.rgb *= inColor;
    #endif
    {{MODULE_COLOR}}

    outColor=col;
}
