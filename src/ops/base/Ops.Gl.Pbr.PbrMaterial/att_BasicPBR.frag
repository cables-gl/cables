precision highp float;
precision highp int;
{{MODULES_HEAD}}

// set by cables
UNI vec3 camPos;
// utility maps
#ifdef USE_ENVIRONMENT_LIGHTING
uniform sampler2D IBL_BRDF_LUT;
#endif
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
#ifdef USE_ENVIRONMENT_LIGHTING
UNI samplerCube _irradiance;
UNI samplerCube _prefilteredEnvironmentColour;
UNI float MAX_REFLECTION_LOD;
UNI float diffuseIntensity;
UNI float specularIntensity;
#endif
UNI float tonemappingExposure;

IN vec2 texCoord;
IN vec4 FragPos;
IN mat3 TBN;
IN vec3 norm;
IN vec3 normM;
#ifdef VERTEX_COLORS
IN vec4 vCol0;
#endif

// structs
struct Light {
    vec3 color;
    vec3 position;
    vec3 specular;

    #define INTENSITY x
    #define ATTENUATION y
    #define FALLOFF z
    #define RADIUS w
    vec4 lightProperties;

    int castLight;

    vec3 conePointAt;
    #define COSCONEANGLE x
    #define COSCONEANGLEINNER y
    #define SPOTEXPONENT z
    vec3 spotProperties;
};


#ifdef WEBGL1
    #ifdef GL_EXT_shader_texture_lod
        #define textureLod textureCubeLodEXT
    #endif
#endif
#define SAMPLETEX textureLod

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

{{PBR_FRAGMENT_HEAD}}
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
        vec3 internalNormals = normM;
    #endif

    // initialize texture values
    float AO             = AORM.r;
    float specK          = AORM.g;
    float metalness      = AORM.b;
    vec3  N              = normalize(internalNormals);
    vec3  albedo         = pow(AlbedoMap.rgb, vec3(2.2));

    #ifdef VERTEX_COLORS
    #ifdef VCOL_COLOUR
        albedo.rgb *= pow(vCol0.rgb, vec3(2.2));
    #endif
    #ifdef VCOL_AORM
        AO = vCol0.r;
        specK = vCol0.g;
        metalness = vCol0.b;
    #endif
    #ifdef VCOL_AO
        AO = vCol0.r;
    #endif
    #ifdef VCOL_R
        specK = vCol0.g;
    #endif
    #ifdef VCOL_M
        metalness = vCol0.b;
    #endif
    #endif

    // set up values for later calculations
    float NdotV          = abs(dot(N, V));
    vec3  F0             = mix(vec3(0.04), albedo.rgb, metalness);

    #ifndef WEBGL1
    #ifndef DONT_USE_GR
    // from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/ShadersInclude/pbrHelperFunctions.fx
    // modified to fit variable names
    #ifndef DONT_USE_NMGR
    vec3 nDfdx = dFdx(normM.xyz);
    vec3 nDfdy = dFdy(normM.xyz);
    #else
    vec3 nDfdx = dFdx(N.xyz) + dFdx(normM.xyz);
    vec3 nDfdy = dFdy(N.xyz) + dFdy(normM.xyz);
    #endif
    float slopeSquare = max(dot(nDfdx, nDfdx), dot(nDfdy, nDfdy));

    // Vive analytical lights roughness factor.
    float geometricRoughnessFactor = pow(clamp(slopeSquare, 0.0, 1.0), 0.333);

    specK = max(specK, geometricRoughnessFactor);
    #endif
    #endif

	// IBL
	// from https://github.com/google/filament/blob/df6a100fcba66d9c99328a49d41fe3adecc0165d/shaders/src/light_indirect.fs
	// and https://github.com/google/filament/blob/df6a100fcba66d9c99328a49d41fe3adecc0165d/shaders/src/shading_lit.fs
	// modified to fit structure/variable names
	#ifdef USE_ENVIRONMENT_LIGHTING
	vec2 envBRDF = texture(IBL_BRDF_LUT, vec2(NdotV, specK)).xy;
	vec3 E = mix(envBRDF.xxx, envBRDF.yyy, F0);
    #endif
    float specOcclusion    = environmentRadianceOcclusion(AO, NdotV);
    float horizonOcclusion = environmentHorizonOcclusion(-V, N, normM);

    #ifdef USE_ENVIRONMENT_LIGHTING
    float envSampleSpecK = specK * MAX_REFLECTION_LOD;
    vec3  R = reflect(-V, N);

	vec3  prefilteredEnvColour = DecodeRGBE8(SAMPLETEX(_prefilteredEnvironmentColour, R, envSampleSpecK)) * specularIntensity;

	vec3 Fr = E * prefilteredEnvColour;
	Fr *= specOcclusion * horizonOcclusion * (1.0 + F0 * (1.0 / envBRDF.y - 1.0));
	Fr *= 1.0 + F0; // TODO: this might be wrong, figure this out

    vec3 IBLIrradiance = DecodeRGBE8(SAMPLETEX(_irradiance, N, 0.0)) * diffuseIntensity;
	vec3 Fd = (1.0 - metalness) * albedo * IBLIrradiance * (1.0 - E) * AO;
    #endif
    vec3 directLighting = vec3(0.0);

    {{PBR_FRAGMENT_BODY}}

    // combine IBL
    col.rgb = directLighting;
    #ifdef USE_ENVIRONMENT_LIGHTING
    col.rgb += Fr + Fd;
    #endif
    col.a   = 1.0;

    #ifdef ALPHA_BLEND
    col.a = AlbedoMap.a;
    #endif

    // from https://github.com/BabylonJS/Babylon.js/blob/5e6321d887637877d8b28b417410abbbeb651c6e/src/Shaders/tonemap.fragment.fx
    // modified to fit variable names
    #ifdef TONEMAP_HejiDawson
        col.rgb *= tonemappingExposure;

        vec3 X = max(vec3(0.0, 0.0, 0.0), col.rgb - 0.004);
        vec3 retColor = (X * (6.2 * X + 0.5)) / (X * (6.2 * X + 1.7) + 0.06);

        col.rgb = retColor * retColor;
    #elif defined(TONEMAP_Photographic)
        col.rgb =  vec3(1.0, 1.0, 1.0) - exp2(-tonemappingExposure * col.rgb);
    #else
        col.rgb *= tonemappingExposure;
        //col.rgb = clamp(col.rgb, vec3(0.0), vec3(1.0));
    #endif

    col.rgb = pow(col.rgb, vec3(1.0/2.2));
    {{MODULE_COLOR}}
    outColor = col;
}

