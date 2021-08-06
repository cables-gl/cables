IN vec3 viewDirection;
IN vec3 normInterpolated;
IN vec2 texCoord;

#ifdef ENABLE_FRESNEL
    IN vec4 cameraSpace_pos;
#endif

// IN mat3 normalMatrix; // when instancing...

#ifdef HAS_TEXTURE_NORMAL
    IN mat3 TBN_Matrix; // tangent bitangent normal space transform matrix
#endif

IN vec3 fragPos;
IN vec3 v_viewDirection;

UNI vec4 inDiffuseColor;
UNI vec4 inMaterialProperties;

#ifdef ADD_EMISSIVE_COLOR
    UNI vec4 inEmissiveColor; // .w = intensity
#endif

#ifdef ENABLE_FRESNEL
    UNI mat4 viewMatrix;
    UNI vec4 inFresnel;
    UNI vec2 inFresnelWidthExponent;
#endif

#ifdef ENVMAP_MATCAP
    IN vec3 viewSpaceNormal;
    IN vec3 viewSpacePosition;
#endif

struct Light {
    vec3 color;
    vec3 position;
    vec3 specular;


    // * SPOT LIGHT * //
    #ifdef HAS_SPOT
        vec3 conePointAt;
        #define COSCONEANGLE x
        #define COSCONEANGLEINNER y
        #define SPOTEXPONENT z
        vec3 spotProperties;
    #endif

    #define INTENSITY x
    #define ATTENUATION y
    #define FALLOFF z
    #define RADIUS w
    vec4 lightProperties;

    int castLight;
};

/* CONSTANTS */
#define NONE -1
#define ALBEDO x
#define ROUGHNESS y
#define SHININESS z
#define SPECULAR_AMT w
#define NORMAL x
#define AO y
#define SPECULAR z
#define EMISSIVE w
const float PI = 3.1415926535897932384626433832795;
const float TWO_PI = (2. * PI);
const float EIGHT_PI = (8. * PI);

#define RECIPROCAL_PI 1./PI
#define RECIPROCAL_PI2 RECIPROCAL_PI/2.

// TEXTURES
#ifdef HAS_TEXTURES
    UNI vec4 inTextureIntensities;

    #ifdef HAS_TEXTURE_ENV
        #ifdef TEX_FORMAT_CUBEMAP
            UNI samplerCube texEnv;
            #ifndef WEBGL1
                #define SAMPLETEX textureLod
            #endif
            #ifdef WEBGL1
                #define SAMPLETEX textureCubeLodEXT
            #endif
        #endif

        #ifdef TEX_FORMAT_EQUIRECT
            UNI sampler2D texEnv;
            #ifdef WEBGL1
                // #extension GL_EXT_shader_texture_lod : enable
                #ifdef GL_EXT_shader_texture_lod
                    #define textureLod texture2DLodEXT
                #endif
                // #define textureLod texture2D
            #endif

            #define SAMPLETEX sampleEquirect

            const vec2 invAtan = vec2(0.1591, 0.3183);
            vec4 sampleEquirect(sampler2D tex,vec3 direction,float lod)
            {
                #ifndef WEBGL1
                    vec3 newDirection = normalize(direction);
            		vec2 sampleUV;
            		sampleUV.x = -1. * (atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.75);
            		sampleUV.y = asin( clamp(direction.y, -1., 1.) ) * RECIPROCAL_PI + 0.5;
                #endif

                #ifdef WEBGL1
                    vec3 newDirection = normalize(direction);
                		vec2 sampleUV = vec2(atan(newDirection.z, newDirection.x), asin(newDirection.y+1e-6));
                        sampleUV *= vec2(0.1591, 0.3183);
                        sampleUV += 0.5;
                #endif
                return textureLod(tex, sampleUV, lod);
            }
        #endif
        #ifdef ENVMAP_MATCAP
            UNI sampler2D texEnv;
            #ifdef WEBGL1
                // #extension GL_EXT_shader_texture_lod : enable
                #ifdef GL_EXT_shader_texture_lod
                    #define textureLod texture2DLodEXT
                #endif
                // #define textureLod texture2D
            #endif


            // * taken & modified from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshmatcap_frag.glsl.js
            vec2 getMatCapUV(vec3 viewSpacePosition, vec3 viewSpaceNormal) {
                vec3 viewDir = normalize(-viewSpacePosition);
            	vec3 x = normalize(vec3(viewDir.z, 0.0, - viewDir.x));
            	vec3 y = normalize(cross(viewDir, x));
            	vec2 uv = vec2(dot(x, viewSpaceNormal), dot(y, viewSpaceNormal)) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks
            	return uv;
            }
        #endif

        UNI float inEnvMapIntensity;
        UNI float inEnvMapWidth;
    #endif

    #ifdef HAS_TEXTURE_LUMINANCE_MASK
        UNI sampler2D texLuminance;
        UNI float inLuminanceMaskIntensity;
    #endif

    #ifdef HAS_TEXTURE_DIFFUSE
        UNI sampler2D texDiffuse;
    #endif

    #ifdef HAS_TEXTURE_SPECULAR
        UNI sampler2D texSpecular;
    #endif

    #ifdef HAS_TEXTURE_NORMAL
        UNI sampler2D texNormal;
    #endif

    #ifdef HAS_TEXTURE_AO
        UNI sampler2D texAO;
    #endif

    #ifdef HAS_TEXTURE_EMISSIVE
        UNI sampler2D texEmissive;
    #endif
    #ifdef HAS_TEXTURE_ALPHA
        UNI sampler2D texAlpha;
    #endif
#endif

{{MODULES_HEAD}}

float when_gt(float x, float y) { return max(sign(x - y), 0.0); } // comparator function
float when_lt(float x, float y) { return max(sign(y - x), 0.0); }
float when_eq(float x, float y) { return 1. - abs(sign(x - y)); } // comparator function
float when_neq(float x, float y) { return abs(sign(x - y)); } // comparator function
float when_ge(float x, float y) { return 1.0 - when_lt(x, y); }
float when_le(float x, float y) { return 1.0 - when_gt(x, y); }

#ifdef FALLOFF_MODE_A
    float CalculateFalloff(float distance, vec3 lightDirection, float falloff, float radius) {
        // * original falloff
        float denom = distance / radius + 1.0;
        float attenuation = 1.0 / (denom*denom);
        float t = (attenuation - falloff) / (1.0 - falloff);
        return max(t, 0.0);
    }
#endif

#ifdef FALLOFF_MODE_B
    float CalculateFalloff(float distance, vec3 lightDirection, float falloff, float radius) {
        float distanceSquared = dot(lightDirection, lightDirection);
        float factor = distanceSquared * falloff;
        float smoothFactor = clamp(1. - factor * factor, 0., 1.);
        float attenuation = smoothFactor * smoothFactor;

        return attenuation * 1. / max(distanceSquared, 0.00001);
    }
#endif

#ifdef FALLOFF_MODE_C
    float CalculateFalloff(float distance, vec3 lightDirection, float falloff, float radius) {
        // https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
        float falloffNumerator = 1. - pow(distance/radius, 4.);
        falloffNumerator = clamp(falloffNumerator, 0., 1.);
        falloffNumerator *= falloffNumerator;

        float denominator = distance*distance + falloff;

        return falloffNumerator/denominator;
    }
#endif

#ifdef FALLOFF_MODE_D
    float CalculateFalloff(float distance, vec3 lightDirection, float falloff, float radius) {
        // inverse square falloff, "physically correct"
        return 1.0 / max(distance * distance, 0.0001);
    }
#endif

#ifdef ENABLE_FRESNEL
    float CalculateFresnel(vec3 direction, vec3 nrml)
    {
        vec3 nDirection = normalize( direction );
        vec3 nNormal = normalize( mat3(viewMatrix) * nrml );
        vec3 hlfDirection = normalize( nNormal + nDirection );

        float cosine = dot( hlfDirection, nDirection );
        float prodct = max(cosine,0.0);
        float y=inFresnelWidthExponent.y;
        float fctor = pow( prodct , y );

        return (5.0 * fctor);
    }
#endif

#ifdef CONSERVE_ENERGY
    // http://www.rorydriscoll.com/2009/01/25/energy-conservation-in-games/
    // http://www.farbrausch.de/~fg/articles/phong.pdf
    float EnergyConservation(float shininess) {
        #ifdef SPECULAR_PHONG
            return (shininess + 2.)/TWO_PI;
        #endif
        #ifdef SPECULAR_BLINN
            return (shininess + 8.)/EIGHT_PI;
        #endif

        #ifdef SPECULAR_SCHLICK
            return (shininess + 8.)/EIGHT_PI;
        #endif

        #ifdef SPECULAR_GAUSS
            return (shininess + 8.)/EIGHT_PI;
        #endif
    }
#endif

#ifdef ENABLE_OREN_NAYAR_DIFFUSE
    float CalculateOrenNayar(vec3 lightDirection, vec3 viewDirection, vec3 normal) {
        float LdotV = dot(lightDirection, viewDirection);
        float NdotL = dot(lightDirection, normal);
        float NdotV = dot(normal, viewDirection);

        float albedo = inMaterialProperties.ALBEDO;
        albedo *= 1.8;
        float s = LdotV - NdotL * NdotV;
        float t = mix(1., max(NdotL, NdotV), step(0., s));

        float roughness = inMaterialProperties.ROUGHNESS;
        float sigma2 = roughness * roughness;
        float A = 1. + sigma2 * (albedo / (sigma2 + 0.13) + 0.5 / (sigma2 + 0.33));
        float B = 0.45 * sigma2 / (sigma2 + 0.09);

        float factor = albedo * max(0., NdotL) * (A + B * s / t) / PI;

        return factor;

    }
#endif

vec3 CalculateDiffuseColor(
    vec3 lightDirection,
    vec3 viewDirection,
    vec3 normal,
    vec3 lightColor,
    vec3 materialColor,
    inout float lambert
) {
    #ifndef ENABLE_OREN_NAYAR_DIFFUSE
        lambert = clamp(dot(lightDirection, normal), 0., 1.);
    #endif

    #ifdef ENABLE_OREN_NAYAR_DIFFUSE
        lambert = CalculateOrenNayar(lightDirection, viewDirection, normal);
    #endif

    vec3 diffuseColor = lambert * lightColor * materialColor;
    return diffuseColor;
}

vec3 CalculateSpecularColor(
    vec3 specularColor,
    float specularCoefficient,
    float shininess,
    vec3 lightDirection,
    vec3 viewDirection,
    vec3 normal,
    float lambertian
) {
    vec3 resultColor = vec3(0.);

    #ifdef SPECULAR_PHONG
        vec3 reflectDirection = reflect(-lightDirection, normal);
        float specularAngle = max(dot(reflectDirection, viewDirection), 0.);
        float specularFactor = pow(specularAngle, max(0., shininess));
    resultColor = lambertian * specularFactor * specularCoefficient * specularColor;
    #endif

    #ifdef SPECULAR_BLINN
        vec3 halfDirection = normalize(lightDirection + viewDirection);
        float specularAngle = max(dot(halfDirection, normal), 0.);
        float specularFactor = pow(specularAngle, max(0., shininess));
        resultColor = lambertian * specularFactor * specularCoefficient * specularColor;
    #endif

    #ifdef SPECULAR_SCHLICK
        vec3 halfDirection = normalize(lightDirection + viewDirection);
        float specularAngle = dot(halfDirection, normal);
        float schlickShininess = max(0., shininess);
        float specularFactor = specularAngle / (schlickShininess - schlickShininess*specularAngle + specularAngle);
        resultColor = lambertian * specularFactor * specularCoefficient * specularColor;
    #endif

    #ifdef SPECULAR_GAUSS
        vec3 halfDirection = normalize(lightDirection + viewDirection);
        float specularAngle = acos(max(dot(halfDirection, normal), 0.));
        float exponent = specularAngle * shininess * 0.17;
        exponent = -(exponent*exponent);
        float specularFactor = exp(exponent);

        resultColor = lambertian * specularFactor * specularCoefficient * specularColor;
    #endif

    #ifdef CONSERVE_ENERGY
        float conserveEnergyFactor = EnergyConservation(shininess);
        resultColor = conserveEnergyFactor * resultColor;
    #endif

    return resultColor;
}

#ifdef HAS_SPOT
    float CalculateSpotLightEffect(vec3 lightPosition, vec3 conePointAt, float cosConeAngle, float cosConeAngleInner, float spotExponent, vec3 lightDirection) {
        vec3 spotLightDirection = normalize(lightPosition-conePointAt);
        float spotAngle = dot(-lightDirection, spotLightDirection);
        float epsilon = cosConeAngle - cosConeAngleInner;

        float spotIntensity = clamp((spotAngle - cosConeAngle)/epsilon, 0.0, 1.0);
        spotIntensity = pow(spotIntensity, max(0.01, spotExponent));

        return max(0., spotIntensity);
    }
#endif



{{PHONG_FRAGMENT_HEAD}}


void main()
{
    {{MODULE_BEGIN_FRAG}}

    vec4 col=vec4(0., 0., 0., inDiffuseColor.a);
    vec3 calculatedColor = vec3(0.);
    vec3 normal = normalize(normInterpolated);
    vec3 baseColor = inDiffuseColor.rgb;

    {{MODULE_BASE_COLOR}}


    vec3 viewDirection = normalize(v_viewDirection);

    #ifdef DOUBLE_SIDED
        if(!gl_FrontFacing) normal = normal * -1.0;
    #endif

    #ifdef HAS_TEXTURES
        #ifdef HAS_TEXTURE_DIFFUSE
            baseColor = texture(texDiffuse, texCoord).rgb;

            #ifdef COLORIZE_TEXTURE
                baseColor *= inDiffuseColor.rgb;
            #endif
        #endif

        #ifdef HAS_TEXTURE_NORMAL

            normal = texture(texNormal, texCoord).rgb;
            normal = normalize(normal * 2. - 1.);
            float normalIntensity = inTextureIntensities.NORMAL;
            normal = normalize(mix(vec3(0., 0., 1.), normal, 2. * normalIntensity));
            normal = normalize(TBN_Matrix * normal);
        #endif
    #endif

    {{PHONG_FRAGMENT_BODY}}






    #ifdef ENABLE_FRESNEL
        calculatedColor += inFresnel.rgb* (CalculateFresnel(vec3(cameraSpace_pos), normal) * inFresnel.w * inFresnelWidthExponent.x);
    #endif

     #ifdef HAS_TEXTURE_ALPHA
        #ifdef ALPHA_MASK_ALPHA
            col.a*=texture(texAlpha,texCoord).a;
        #endif
        #ifdef ALPHA_MASK_LUMI
            col.a*= dot(vec3(0.2126,0.7152,0.0722), texture(texAlpha,texCoord).rgb);
        #endif
        #ifdef ALPHA_MASK_R
            col.a*=texture(texAlpha,texCoord).r;
        #endif
        #ifdef ALPHA_MASK_G
            col.a*=texture(texAlpha,texCoord).g;
        #endif
        #ifdef ALPHA_MASK_B
            col.a*=texture(texAlpha,texCoord).b;
        #endif
    #endif

    #ifdef ADD_EMISSIVE_COLOR
        vec3 emissiveRadiance = inEmissiveColor.rgb * inEmissiveColor.w; // .w = intensity of color;

        #ifdef HAS_TEXTURE_EMISSIVE
            float emissiveIntensity = inTextureIntensities.EMISSIVE;
            // calculatedColor += emissiveIntensity * baseColor * texture(texEmissive, texCoord).r;
            emissiveRadiance *= (emissiveIntensity * texture(texEmissive, texCoord).rgb);
        #endif

        calculatedColor += emissiveRadiance;
    #endif


    #ifdef DISCARDTRANS
        if(col.a<0.2) discard;
    #endif


    #ifdef HAS_TEXTURE_ENV
        vec3 luminanceColor = vec3(0.);

        #ifndef ENVMAP_MATCAP
            float environmentMapWidth = inEnvMapWidth;
            float glossyExponent = inMaterialProperties.SHININESS;
            float glossyCoefficient = inMaterialProperties.SPECULAR_AMT;

            vec3 envMapNormal =  normal;
            vec3 reflectDirection = reflect(normalize(-viewDirection), normal);

            float lambertianCoefficient = dot(viewDirection, reflectDirection); //0.44; // TODO: need prefiltered map for this
            // lambertianCoefficient = 1.;
            float specularAngle = max(dot(reflectDirection, viewDirection), 0.);
            float specularFactor = pow(specularAngle, max(0., inMaterialProperties.SHININESS));

            glossyExponent = specularFactor;

            float maxMIPLevel = 10.;
            float MIPlevel = log2(environmentMapWidth / 1024. * sqrt(3.)) - 0.5 * log2(glossyExponent + 1.);

            luminanceColor = inEnvMapIntensity * (
                inDiffuseColor.rgb *
                SAMPLETEX(texEnv, envMapNormal, maxMIPLevel).rgb
                +
                glossyCoefficient * SAMPLETEX(texEnv, reflectDirection, MIPlevel).rgb
            );
        #endif
        #ifdef ENVMAP_MATCAP
            luminanceColor = inEnvMapIntensity * (
                texture(texEnv, getMatCapUV(viewSpacePosition, viewSpaceNormal)).rgb
                //inDiffuseColor.rgb
                //* textureLod(texEnv, getMatCapUV(envMapNormal), maxMIPLevel).rgb
                //+
                //glossyCoefficient * textureLod(texEnv, getMatCapUV(reflectDirection), MIPlevel).rgb
            );
        #endif



        #ifdef HAS_TEXTURE_LUMINANCE_MASK
            luminanceColor *= texture(texLuminance, texCoord).r * inLuminanceMaskIntensity;
        #endif

        #ifdef HAS_TEXTURE_AO
            luminanceColor *= mix(vec3(1.), texture(texAO, texCoord).rgb, inTextureIntensities.AO);
        #endif

        calculatedColor.rgb += luminanceColor;
    #endif

    col.rgb = clamp(calculatedColor, 0., 1.);


    {{MODULE_COLOR}}

    outColor = col;
}
