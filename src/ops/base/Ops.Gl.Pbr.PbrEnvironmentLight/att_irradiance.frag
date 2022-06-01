precision highp float;
precision highp int;
precision highp sampler2D;


// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/hdrFilteringFunctions.fx
// modified to use different syntax for a number of variables, equirectangular projection and rgbe encoding
{{MODULES_HEAD}}
#ifndef WEBGL1
#define NUM_SAMPLES 2048u
#else
#define NUM_SAMPLES 2048
#endif
#define PI 3.14159265358
#define PI_TWO 2.*PI
#define RECIPROCAL_PI 1./PI
#define RECIPROCAL_PI2 RECIPROCAL_PI/2.


#ifdef WEBGL1
    #ifdef GL_EXT_shader_texture_lod
        #define textureLod texture2DLodEXT
    #endif
#endif
#define SAMPLETEX textureLod

// set by cables
UNI vec3 camPos;

IN  vec3 FragPos;
UNI float rotation;
UNI vec2 filteringInfo;
UNI sampler2D EquiCubemap;

vec2 SampleSphericalMap(vec3 direction, float rotation)
{
    #ifndef WEBGL1
        vec3 newDirection = normalize(direction);
		vec2 sampleUV;
		sampleUV.x = -1. * (atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5);
		sampleUV.y = asin( clamp(direction.y, -1., 1.) ) * RECIPROCAL_PI + 0.5;
    #endif

    #ifdef WEBGL1
        vec3 newDirection = normalize(direction);
		vec2 sampleUV = vec2(atan(newDirection.z, newDirection.x), asin(newDirection.y+1e-6));
        sampleUV *= vec2(-0.1591, 0.3183);
        sampleUV += 0.5;
    #endif
    sampleUV.x += rotation;
    return sampleUV * vec2(-1.,1.);
}

// https://community.khronos.org/t/addition-of-two-hdr-rgbe-values/55669
vec4 EncodeRGBE8(vec3 rgb)
{
    vec4 vEncoded;
    float maxComponent = max(max(rgb.r, rgb.g), rgb.b);
    float fExp = ceil(log2(maxComponent));
    vEncoded.rgb = rgb / exp2(fExp);
    vEncoded.a = (fExp + 128.0) / 255.0;
    return vEncoded;
}
// https://enkimute.github.io/hdrpng.js/
vec3 DecodeRGBE8(vec4 rgbe)
{
    vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0 - 128.0);
    return vDecoded;
}

// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/importanceSampling.fx
vec3 hemisphereCosSample(vec2 u) {
    // pdf = cosTheta / M_PI;
    float phi = 2. * PI * u.x;

    float cosTheta2 = 1. - u.y;
    float cosTheta = sqrt(cosTheta2);
    float sinTheta = sqrt(1. - cosTheta2);

    return vec3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);
}

#ifndef WEBGL1
    // https://learnopengl.com/PBR/IBL/Specular-IBL
    // Hammersley
    float radicalInverse_VdC(uint bits)
    {
        bits = (bits << 16u) | (bits >> 16u);
        bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
        bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
        bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
        bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
        return float(bits) * 2.3283064365386963e-10; // / 0x100000000
    }

    vec2 hammersley(uint i, uint N)
    {
        return vec2(float(i)/float(N), radicalInverse_VdC(i));
    }
#else
    float vanDerCorpus(int n, int base)
    {
        float invBase = 1.0 / float(base);
        float denom   = 1.0;
        float result  = 0.0;

        for(int i = 0; i < 32; ++i)
        {
            if(n > 0)
            {
                denom   = mod(float(n), 2.0);
                result += denom * invBase;
                invBase = invBase / 2.0;
                n       = int(float(n) / 2.0);
            }
        }

        return result;
    }

    vec2 hammersley(int i, int N)
    {
        return vec2(float(i)/float(N), vanDerCorpus(i, 2));
    }
#endif

// from https://github.com/google/filament/blob/main/shaders/src/light_indirect.fs
float prefilteredImportanceSampling(float ipdf, float omegaP)
{
    // See: "Real-time Shading with Filtered Importance Sampling", Jaroslav Krivanek
    // Prefiltering doesn't work with anisotropy
    const float numSamples = float(NUM_SAMPLES);
    const float invNumSamples = 1.0 / float(numSamples);
    const float K = 4.0;
    float omegaS = invNumSamples * ipdf;
    float mipLevel = log2(K * omegaS / omegaP) * 0.5;    // log4
    return mipLevel;
}

const float NUM_SAMPLES_FLOAT = float(NUM_SAMPLES);
const float NUM_SAMPLES_FLOAT_INVERSED = 1. / NUM_SAMPLES_FLOAT;

const float K = 4.;

void main()
{
    {{MODULE_BEGIN_FRAG}}
    vec4 col = vec4(0.0, 0.0, 0.0, 0.0);

    vec3 n = normalize(FragPos);
    vec3 tangent = normalize(cross(vec3(0.0, 0.0, 1.0), n));
    vec3 bitangent = cross(n, tangent);
    mat3 tbn = mat3(tangent, bitangent, n);

    float maxLevel = filteringInfo.y;
    float dim0 = filteringInfo.x;
    float omegaP = (4. * PI) / (6. * dim0 * dim0);

    #ifndef WEBGL1
    for(uint i = 0u; i < NUM_SAMPLES; ++i)
    #else
    for(int i = 0; i < NUM_SAMPLES; ++i)
    #endif
    {
        vec2 Xi = hammersley(i, NUM_SAMPLES);
        vec3 Ls = hemisphereCosSample(Xi);

        Ls = normalize(Ls);

        vec3 Ns = vec3(0., 0., 1.);

        float NoL = dot(Ns, Ls);

        if (NoL > 0.) {
            float pdf_inversed = PI / NoL;

            float omegaS = NUM_SAMPLES_FLOAT_INVERSED * pdf_inversed;
            // from https://github.com/google/filament/blob/main/shaders/src/light_indirect.fs
            float l = log2(K * omegaS / omegaP) * 0.5;
            float mipLevel = clamp(l + 1.0, 0.0, maxLevel);

            #ifndef DONT_USE_RGBE_CUBEMAPS
            vec3 c = DecodeRGBE8(SAMPLETEX(EquiCubemap, SampleSphericalMap(tbn * Ls, rotation), mipLevel)).rgb;
            #else
            vec3 c = SAMPLETEX(EquiCubemap, SampleSphericalMap(tbn * Ls, rotation), mipLevel).rgb;
            #endif
            col.rgb += c;
        }
    }

    col = EncodeRGBE8(col.rgb * PI * NUM_SAMPLES_FLOAT_INVERSED);

    {{MODULE_COLOR}}
    outColor = col;
}
