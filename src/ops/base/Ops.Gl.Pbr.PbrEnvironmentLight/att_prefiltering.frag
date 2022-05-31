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
#define MINIMUMVARIANCE 0.0005


#ifdef WEBGL1
    #ifdef GL_EXT_shader_texture_lod
        #define textureLod texture2DLodEXT
    #endif
#endif
#define SAMPLETEX textureLod

IN  vec3 FragPos;
UNI float roughness;
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
    vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0-128.0);
    return vDecoded;
}

// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/importanceSampling.fx
vec3 hemisphereImportanceSampleDggx(vec2 u, float a) {
    // pdf = D(a) * cosTheta
    float phi = 2. * PI * u.x;

    // NOTE: (aa-1) == (a-1)(a+1) produces better fp accuracy
    float cosTheta2 = (1. - u.y) / (1. + (a + 1.) * ((a - 1.) * u.y));
    float cosTheta = sqrt(cosTheta2);
    float sinTheta = sqrt(1. - cosTheta2);

    return vec3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);
}

// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/pbrBRDFFunctions.fx
float normalDistributionFunction_TrowbridgeReitzGGX(float NdotH, float alphaG)
{
    // Note: alphaG is average slope (gradient) of the normals in slope-space.
    // It is also the (trigonometric) tangent of the median distribution value, i.e. 50% of normals have
    // a tangent (gradient) closer to the macrosurface than this slope.
    float a2 = alphaG * alphaG;
    float d = NdotH * NdotH * (a2 - 1.0) + 1.0;
    return a2 / (PI * d * d);
}

// from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/pbrHelperFunctions.fx
float convertRoughnessToAverageSlope(float roughness)
{
    // Calculate AlphaG as square of roughness (add epsilon to avoid numerical issues)
    return (roughness * roughness) + MINIMUMVARIANCE;
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

float log4(float x)
{
    return log2(x) / 2.;
}

const float NUM_SAMPLES_FLOAT = float(NUM_SAMPLES);
const float NUM_SAMPLES_FLOAT_INVERSED = 1. / NUM_SAMPLES_FLOAT;

const float K = 4.;

void main()
{
    {{MODULE_BEGIN_FRAG}}
    vec3 n = normalize(FragPos);
    float alphaG = convertRoughnessToAverageSlope(roughness);
    vec4 result = vec4(0.);

    if (alphaG == 0.)
    {
        result = SAMPLETEX(EquiCubemap, SampleSphericalMap(n, rotation), 0.0);
    }
    else
    {
        vec3 tangent = abs(n.z) < 0.999 ? vec3(0., 0., 1.) : vec3(1., 0., 0.);
        tangent = normalize(cross(tangent, n));
        vec3 bitangent = cross(n, tangent);
        mat3 tbn = mat3(tangent, bitangent, n);

        float maxLevel = filteringInfo.y;
        float dim0 = filteringInfo.x;
        float omegaP = (4. * PI) / (6. * dim0 * dim0);

        float weight = 0.;
        #if defined(WEBGL2)
        for(uint i = 0u; i < NUM_SAMPLES; ++i)
        #else
        for(int i = 0; i < NUM_SAMPLES; ++i)
        #endif
        {
            vec2 Xi = hammersley(i, NUM_SAMPLES);
            vec3 H = hemisphereImportanceSampleDggx(Xi, alphaG);

            float NoV = 1.;
            float NoH = H.z;
            float NoH2 = H.z * H.z;
            float NoL = 2. * NoH2 - 1.;
            vec3 L = vec3(2. * NoH * H.x, 2. * NoH * H.y, NoL);
            L = normalize(L);

            if (NoL > 0.)
            {
                float pdf_inversed = 4. / normalDistributionFunction_TrowbridgeReitzGGX(NoH, alphaG);

                float omegaS = NUM_SAMPLES_FLOAT_INVERSED * pdf_inversed;
                float l = log4(omegaS) - log4(omegaP) + log4(K);
                float mipLevel = clamp(l, 0.0, maxLevel);

                weight += NoL;

                #ifndef DONT_USE_RGBE_CUBEMAPS
                vec3 c = DecodeRGBE8(SAMPLETEX(EquiCubemap, SampleSphericalMap(tbn * L, rotation), mipLevel)).rgb;
                #else
                vec3 c = SAMPLETEX(EquiCubemap, SampleSphericalMap(tbn * L, rotation), mipLevel).rgb;
                #endif
                result.rgb += c * NoL;
            }
        }

        result = result / weight;
        result = EncodeRGBE8(result.rgb);
    }

    {{MODULE_COLOR}}
    outColor = result;
}
