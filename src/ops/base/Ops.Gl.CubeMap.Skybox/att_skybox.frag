#define PI 3.14159265358 //97932384626433832795
#define PI_TWO 2. * PI
#define RECIPROCAL_PI 1./PI
#define RECIPROCAL_PI2 RECIPROCAL_PI/2.

UNI vec2 expGamma;


#ifdef TEX_FORMAT_CUBEMAP
    UNI samplerCube skybox;
    #ifndef WEBGL1
        #define SAMPLETEX texture
    #endif
    #ifdef WEBGL1
        #define SAMPLETEX textureCubeLodEXT
    #endif
#endif

#ifndef TEX_FORMAT_CUBEMAP
    #define TEX_FORMAT_EQUIRECT
    UNI sampler2D skybox;
    #ifdef WEBGL1
        #ifdef GL_EXT_shader_texture_lod
            #define textureLod texture2DLodEXT
        #endif
    #endif
    #define SAMPLETEX sampleEquirect

#endif

IN vec3 worldPos;

vec4 sampleEquirect(sampler2D tex, vec3 direction,float lod) {
    vec2 sampleUV;
    vec3 newDirection = normalize(direction);

    sampleUV.x = atan( newDirection.z, newDirection.x ) * RECIPROCAL_PI2 + 0.75;
    sampleUV.y = asin( clamp(newDirection.y, -1., 1.) ) * RECIPROCAL_PI + 0.5;

    return texture(tex, sampleUV);
}

vec4 sampleEquirect(sampler2D tex, vec3 direction) {
    return sampleEquirect(tex,direction,0.0);
}

highp vec3 DecodeRGBE8(highp vec4 rgbe)
{
    highp vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0-128.0);
    return vDecoded;
}

void main() {
    {{MODULE_BEGIN_FRAG}}
    vec4 col = vec4(1.);

    {{MODULE_COLOR}}

    vec3 newPos = worldPos;

    vec4 finalColor;
    #ifndef RGBE
        finalColor = vec4(SAMPLETEX(skybox, newPos,0.0));
    #endif

    #ifdef RGBE
        finalColor.rgb=DecodeRGBE8(SAMPLETEX(skybox, newPos));
    #endif

    float gamma=expGamma.x;
    float exposure=expGamma.y;
    finalColor.rgb = vec3(1.0) - exp(-finalColor.rgb * exposure);

    finalColor.rgb = pow(finalColor.rgb, vec3(1.0 / gamma));
    outColor=vec4(finalColor.rgb,1.0);

}
