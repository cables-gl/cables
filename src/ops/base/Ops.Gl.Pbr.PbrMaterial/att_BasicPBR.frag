precision highp float;
precision highp int;
{{MODULES_HEAD}}

// set by cables
UNI vec3 camPos;
// utility maps
uniform sampler2D IBL_BRDF_LUT;
// mesh maps
#ifdef USE_ALBEDO_TEX
    UNI sampler2D _AlbedoMap;
#else
    UNI vec4 _Albedo;
#endif
#ifdef USE_NORMAL_TEX
    UNI sampler2D _NormalMap;
#endif
#ifdef USE_AORM_TEX
    UNI sampler2D _AORMMap;
#else
    UNI float _Roughness;
    UNI float _Metalness;
#endif
// IBL inputs
UNI samplerCube _irradiance;
UNI samplerCube _prefilteredEnvironmentColour;
UNI float MAX_REFLECTION_LOD;
UNI float tonemappingExposure;
UNI float diffuseIntensity;
UNI float specularIntensity;

IN vec2 texCoord;
IN vec4 FragPos;
IN mat3 TBN;
IN vec3 norm;


#ifdef WEBGL1
    #ifdef GL_EXT_shader_texture_lod
        #define textureLod textureCubeLodEXT
    #endif
#endif
#define SAMPLETEX textureLod

// from https://github.com/BabylonJS/Babylon.js/blob/993b28ea5189b846a6b02594a15d743d973aee4b/src/Shaders/background.fragment.fx
// modified to fit variable names / structure
float pow5(float value) {
    float sq = value * value;
    return sq * sq * value;
}
highp vec3 F_Schlick(float VoH, const vec3 f0, float roughness)
{
    float weight = mix(0.25, 1.0, 1.0 - roughness);
    return f0 + weight * (1.0 - f0) * pow5(clamp(1.0 - VoH, 0.0, 1.0));
}

// https://community.khronos.org/t/addition-of-two-hdr-rgbe-values/55669
highp vec4 EncodeRGBE8(highp vec3 rgb)
{
    highp vec4 vEncoded;
    float maxComponent = max(max(rgb.r, rgb.g), rgb.b);
    float fExp = ceil(log2(maxComponent));
    vEncoded.rgb = rgb / exp2(fExp);
    vEncoded.a = (fExp + 128.0) / 255.0;
    return vEncoded;
}
// https://enkimute.github.io/hdrpng.js/
highp vec3 DecodeRGBE8(highp vec4 rgbe)
{
    highp vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0-128.0);
    return vDecoded;
}

// from https://github.com/BabylonJS/Babylon.js/blob/master/src/Shaders/ShadersInclude/pbrIBLFunctions.fx
float environmentRadianceOcclusion(float ambientOcclusion, float NdotVUnclamped) {
    // Best balanced (implementation time vs result vs perf) analytical environment specular occlusion found.
    // http://research.tri-ace.com/Data/cedec2011_RealtimePBR_Implementation_e.pptx
    float temp = NdotVUnclamped + ambientOcclusion;
    return clamp(temp * temp - 1.0 + ambientOcclusion, 0.0, 1.0);
}
float environmentHorizonOcclusion(vec3 view, vec3 normal, vec3 geometricNormal) {
    // http://marmosetco.tumblr.com/post/81245981087
    vec3 reflection = reflect(view, normal);
    float temp = clamp(1.0 + 1.1 * dot(reflection, geometricNormal), 0.0, 1.0);
    return temp * temp;
}
#ifdef ALPHA_DITHERED
// from https://github.com/google/filament/blob/main/shaders/src/dithering.fs
// modified to use this to discard based on factor instead of dithering
float interleavedGradientNoise(highp vec2 n) {
    return fract(52.982919 * fract(dot(vec2(0.06711, 0.00584), n)));
}
float Dither_InterleavedGradientNoise(float a) {
    // Jimenez 2014, "Next Generation Post-Processing in Call of Duty"
    highp vec2 uv = gl_FragCoord.xy;

    // The noise variable must be highp to workaround Adreno bug #1096.
    highp float noise = interleavedGradientNoise(uv);

    return step(noise, a);
}
#endif
void main()
{
    vec4 col;

    // set up interpolated vertex data
    vec2 UV0             = texCoord;
    vec3 V               = normalize(camPos - FragPos.xyz);

    // load relevant mesh maps
    #ifdef USE_ALBEDO_TEX
        vec4 AlbedoMap   = texture2D(_AlbedoMap, UV0);
    #else
        vec4 AlbedoMap   = _Albedo;
    #endif
    #ifdef ALPHA_MASKED
	if ( AlbedoMap.a <= 0.5 )
	    discard;
	#endif

	#ifdef ALPHA_DITHERED
	if ( Dither_InterleavedGradientNoise(AlbedoMap.a) <= 0.5 )
	    discard;
	#endif

    #ifdef USE_AORM_TEX
        vec4 AORM        = texture2D(_AORMMap, UV0);
    #else
        vec4 AORM        = vec4(1.0, _Roughness, _Metalness, 1.0);
    #endif
    #ifdef USE_NORMAL_TEX
        vec3 internalNormals = texture2D(_NormalMap, UV0).rgb;
        internalNormals      = internalNormals * 2.0 - 1.0;
        internalNormals      = normalize(TBN * internalNormals);
    #else
        vec3 internalNormals = norm;
    #endif

    // initialize texture values
    float AO             = AORM.r;
    float specK          = AORM.g;
    float metalness      = AORM.b;
    vec3  N              = normalize(internalNormals);
    vec3  albedo         = pow(AlbedoMap.rgb, vec3(2.2));

    // set up values for later calculations
    float NdotV          = abs(dot(N, V));
    vec3  F0             = mix(vec3(0.04), AlbedoMap.rgb, metalness);
    vec3  kS             = F_Schlick(NdotV, F0, specK);
    vec3  kD             = 1.0 - kS;
    kD                  *= 1.0 - metalness; // remove diffuse lighting from metals

    #ifndef WEBGL1
    #ifndef DONT_USE_GR
    // from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/pbrHelperFunctions.fx
    // modified to fit variable names
    vec3 nDfdx = dFdx(norm.xyz);
    vec3 nDfdy = dFdy(norm.xyz);
    float slopeSquare = max(dot(nDfdx, nDfdx), dot(nDfdy, nDfdy));

    // Vive analytical lights roughness factor.
    float geometricRoughnessFactor = pow(clamp(slopeSquare, 0.0, 1.0), 0.333);

    specK = max(specK, geometricRoughnessFactor);
    #endif
    #endif

	// IBL
	// diffuse irradiance
	vec3 IBLIrradiance         = DecodeRGBE8(SAMPLETEX(_irradiance, N.xyz, 0.0)) * diffuseIntensity;
    vec3 diffuse               = IBLIrradiance * albedo * AO;
    // environment reflections
	float envSampleSpecK       = specK * MAX_REFLECTION_LOD;
	vec3  R                    = reflect(-V, N);
	vec3  envSampleUV          = normalize(R);
	vec3  prefilteredEnvColour = DecodeRGBE8(SAMPLETEX(_prefilteredEnvironmentColour, envSampleUV.xyz, envSampleSpecK)) * specularIntensity;

    vec2 envBRDF  = texture(IBL_BRDF_LUT, vec2(max(NdotV, 0.0), specK)).rg;
    vec3 specular = prefilteredEnvColour * (kS * envBRDF.x + envBRDF.y);

    float specOcclusion    = environmentRadianceOcclusion(AO, NdotV);
    float horizonOcclusion = environmentHorizonOcclusion(-V, N, norm);

    // combine IBL
    vec3 ambient  = (kD * diffuse + specular * specOcclusion * horizonOcclusion);

    col.rgb = pow(ambient, vec3(1.0/2.2));
    col.a   = 1.0;

    #ifdef ALPHA_BLEND
    col.a = AlbedoMap.a;
    #endif

    col.rgb = clamp(col.rgb, vec3(0.0), vec3(1.0));
    {{MODULE_COLOR}}
    outColor = col;
}



















