#define POINT 0
#define DIRECTIONAL 1
#define SPOT 2

IN vec4 modelPos;
IN vec3 viewDirection;
IN vec3 normInterpolated;
IN vec2 texCoord;
IN vec4 cameraSpace_pos;

IN mat3 normalMatrix; // when instancing...
IN mat3 TBN_Matrix; // tangent bitangent normal space transform matrix
IN vec3 fragPos;

IN vec3 mvNormal;
IN vec3 mvTangent;
IN vec3 mvBiTangent;
IN mat4 mvMatrix;

UNI vec4 inDiffuseColor;
UNI vec4 inMaterialProperties;
UNI mat4 viewMatrix;

#ifdef ENABLE_FRESNEL
    UNI vec4 inFresnel;
    UNI vec2 inFresnelWidthExponent;
#endif


struct Light {
    vec3 position;
    vec3 color;
    vec3 specular;
    // * SPOT LIGHT * //
    vec3 conePointAt;
    #define COSCONEANGLE x
    #define COSCONEANGLEINNER y
    #define SPOTEXPONENT z
    vec3 spotProperties;

    // * AREA LIGHT * //
    vec3 right;
    float width;
    float height;
    #define INTENSITY x
    #define ATTENUATION y
    #define FALLOFF z
    #define RADIUS w
    vec4 lightProperties;
};

/* CONSTANTS */
#define PI 3.1415926535897932384626433832795
#define NONE -1
#define ALBEDO x
#define ROUGHNESS y
#define SHININESS z
#define SPECULAR_AMT w
#define NORMAL x
#define AO y
#define SPECULAR z
#define EMISSIVE w
#define TWO_PI 2.*PI
#define EIGHT_PI 8.*PI;

// TEXTURES
#ifdef HAS_TEXTURES
    UNI vec4 inTextureIntensities;
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

float CalculateFalloffArea(float distance, float falloff) {
    float distanceSquared = distance * distance;
    float factor = distanceSquared * falloff;
    float smoothFactor = clamp(1. - factor * factor, 0., 1.);
    float attenuation = smoothFactor * smoothFactor;

    return attenuation * 1. / max(distanceSquared, 0.00001);
}

vec3 ProjectOnPlane(in vec3 p, in vec3 pc, in vec3 pn)
{
    float distance = dot(pn, p - pc);
    return p - distance * pn;
}

int SideOfPlane(in vec3 p, in vec3 pc, in vec3 pn) {
    //return int(when_ge(dot(p - pc, pn), 0.));
    if (dot(p - pc, pn)>=0.0) return 1;
    return 0;
}

vec3 LinePlaneIntersect(in vec3 lp, in vec3 lv, in vec3 pc, in vec3 pn){
   return lp + lv * (dot(pn, pc - lp) / dot(pn, lv));
}


#ifdef FALLOFF_MODE_A
    float CalculateFalloff(float distance, vec3 lightDirection, float falloff, float radius) {
        float distanceSquared = dot(lightDirection, lightDirection);
        float factor = distanceSquared * falloff;
        float smoothFactor = clamp(1. - factor * factor, 0., 1.);
        float attenuation = smoothFactor * smoothFactor;

        return attenuation * 1. / max(distanceSquared, 0.00001);
    }
#endif

#ifdef FALLOFF_MODE_B
    float CalculateFalloff(float distance, vec3 lightDirection, float falloff, float radius) {
        // inverse square falloff, "physically correct"
        return 1.0 / max(distance * distance, 0.0001);
        //return 1.0 / max(dot(lightDirection, lightDirection), 0.0001);
    }
#endif

#ifdef FALLOFF_MODE_C
    float CalculateFalloff(float distance, vec3 lightDirection, float falloff, float radius) {
        // https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
        // return clamp(1. - (distance/radius), 0., 1.)
        float falloffNumerator = 1. - pow(distance/radius, 4.);
        falloffNumerator = clamp(falloffNumerator, 0., 1.);
        falloffNumerator *= falloffNumerator;

        float denominator = distance*distance + falloff; //1.; //(falloff);
        return falloffNumerator/denominator;
        // float distanceSquared = dot(lightDirection, lightDirection);

        // clamp((1. - sqrt(distanceSquared)/radius), 0., 1.)
        // return 1.;
       // return 1. / max((1. + 0.5 * sqrt(distanceSquared) + 0.1 * distanceSquared), 0.00001);
    }
#endif

#ifdef ENABLE_FRESNEL
    float CalculateFresnel(vec3 direction, vec3 normal)
    {
        vec3 nDirection = normalize( direction );
        vec3 nNormal = normalize( mat3(viewMatrix) * normal );
        vec3 halfDirection = normalize( nNormal + nDirection );

        float cosine = dot( halfDirection, nDirection );
        float product = max( cosine, 0.0 );
        float factor = pow(product, inFresnelWidthExponent.y);

        return 5. * factor;
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
    vec3 normal,
    vec3 lightColor,
    vec3 materialColor,
    inout float lambert
) {
    #ifndef ENABLE_OREN_NAYAR_DIFFUSE
        lambert = clamp(dot(lightDirection, normal), 0., 1.);
    #endif

    #ifdef ENABLE_OREN_NAYAR_DIFFUSE
        float lambertian = CalculateOrenNayar(lightDirection, viewDirection, normal);
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
    inout float lambertian
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

        resultColor = lambertian*specularFactor * specularCoefficient * specularColor;
    #endif

    #ifdef CONSERVE_ENERGY
        float conserveEnergyFactor = EnergyConservation(shininess);
        resultColor = conserveEnergyFactor * specularColor;
    #endif

    return resultColor;
}

float CalculateSpotLightEffect(vec3 lightPosition, vec3 conePointAt, float cosConeAngle, float cosConeAngleInner, float spotExponent, vec3 lightDirection) {
    vec3 spotLightDirection = normalize(lightPosition-conePointAt);
    float spotAngle = dot(-lightDirection, spotLightDirection);
    float epsilon = cosConeAngle - cosConeAngleInner;

    float spotIntensity = clamp((spotAngle - cosConeAngle)/epsilon, 0.0, 1.0);
    spotIntensity = pow(spotIntensity, max(0.01, spotExponent));

    return max(0., spotIntensity);
}



{{PHONG_FRAGMENT_HEAD}}


void main()
{
    {{MODULE_BEGIN_FRAG}}

    vec4 col=vec4(0., 0., 0., inDiffuseColor.a);
    vec3 calculatedColor = vec3(0.);
    vec3 normal = normalize(normInterpolated);
    vec3 baseColor = inDiffuseColor.rgb;

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
        calculatedColor += inFresnel.rgb * (CalculateFresnel(vec3(cameraSpace_pos), normal) * inFresnel.w * inFresnelWidthExponent.x);
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

    #ifdef HAS_TEXTURE_EMISSIVE
        float emissiveIntensity = inTextureIntensities.EMISSIVE;
        calculatedColor += emissiveIntensity * baseColor * texture(texEmissive, texCoord).r;
    #endif


    #ifdef DISCARDTRANS
        if(col.a<0.2) discard;
    #endif


    col.rgb = clamp(calculatedColor, 0., 1.);

    {{MODULE_COLOR}}

    outColor = col;
}