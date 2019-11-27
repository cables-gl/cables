
// https://www.mathematik.uni-marburg.de/~thormae/lectures/graphics1/code/WebGLShaderLightMat/ShaderLightMat.html
struct Material {
	vec3 diffuse;
	float shininess;
	float specularCoefficient;
};

struct Light {
    vec3 position;
    vec3 color;
    vec3 specular;
    int type;
    vec3 lightProperties; // x - intensity, y - radius, z - falloff
    vec3 spotProperties; // x - spotExponent, y - cosConeAngle, z - cosConeAngleInner
    float intensity;
    float radius;
    float falloff;
    float cosConeAngle;
    float cosConeAngleInner;
    float spotExponent;
    vec3 conePointAt;
};

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

UNI vec3 camPos;
UNI mat4 viewMatrix;
UNI Light lights[MAX_LIGHTS];
UNI vec4 inDiffuseColor;
UNI vec4 inMaterialProperties;


#ifdef ENABLE_FRESNEL
    UNI vec4 inFresnel;
    UNI vec2 inFresnelWidthExponent;
#endif


IN vec2 texCoord;
IN vec3 normInterpolated;
IN vec3 fragPos;
IN mat3 TBN_Matrix;
IN vec4 cameraSpace_pos;
IN vec3 v_viewDirection;


/* CONSTANTS */
#define PI 3.1415926535897932384626433832795
#define NONE -1
#define AMBIENT 0
#define POINT 1
#define DIRECTIONAL 2
#define SPOT 3
#define ALBEDO x;
#define ROUGHNESS y;
#define SHININESS z;
#define SPECULAR_AMT w;
#define NORMAL x;
#define AO y;
#define SPECULAR z;
#define EMISSIVE w;
const float TWO_PI = 2.*PI;
const float EIGHT_PI = 8.*PI;

{{MODULES_HEAD}}

float when_gt(float x, float y) { return max(sign(x - y), 0.0); } // comparator function
float when_eq(float x, float y) { return 1. - abs(sign(x - y)); } // comparator function
float when_neq(float x, float y) { return abs(sign(x - y)); } // comparator function

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


float CalculateFalloff(Light light, float distance) {
    float denom = distance / light.radius + 1.0;
    float attenuation = 1.0 / (denom*denom);
    float t = (attenuation - light.falloff) / (1.0 - light.falloff);
    return max(t, 0.0);
}

vec4 CalculateDiffuseColor(Material material, Light light, vec3 lightDirection, vec3 viewDirection, vec3 normal) {
    #ifndef ENABLE_OREN_NAYAR_DIFFUSE
        float lambertian = clamp(dot(lightDirection, normal), 0., 1.);
    #endif

    #ifdef ENABLE_OREN_NAYAR_DIFFUSE
        float lambertian = CalculateOrenNayar(lightDirection, viewDirection, normal);
    #endif

    vec3 diffuseColor = lambertian*material.diffuse*light.color;
    return vec4(diffuseColor, lambertian);
}

vec3 CalculateSpecularColor(Material material, Light light, vec3 lightDirection, vec3 viewDirection, vec3 normal, float lambertian) {
    vec3 specularColor = vec3(0.);

    #ifdef SPECULAR_PHONG
        vec3 reflectDirection = reflect(-lightDirection, normal);
        float specularAngle = max(dot(reflectDirection, viewDirection), 0.);
        float specularFactor = pow(specularAngle, max(0., material.shininess));
    specularColor = lambertian * specularFactor * material.specularCoefficient * light.specular;
    #endif

    #ifdef SPECULAR_BLINN
        vec3 halfDirection = normalize(lightDirection + viewDirection);
        float specularAngle = max(dot(halfDirection, normal), 0.);
        float specularFactor = pow(specularAngle, max(0., material.shininess));
        specularColor = lambertian * specularFactor * material.specularCoefficient * light.specular;
    #endif

    #ifdef SPECULAR_SCHLICK
        vec3 halfDirection = normalize(lightDirection + viewDirection);
        float specularAngle = dot(halfDirection, normal);
        float shininess = max(0., material.shininess);
        float specularFactor = specularAngle / (shininess - shininess*specularAngle + specularAngle);
        specularColor = lambertian * specularFactor * material.specularCoefficient * light.specular;
    #endif

    #ifdef SPECULAR_GAUSS
        vec3 halfDirection = normalize(lightDirection + viewDirection);
        float specularAngle = acos(max(dot(halfDirection, normal), 0.));
        float exponent = specularAngle * material.shininess * 0.17;
        exponent = -(exponent*exponent);
        float specularFactor = exp(exponent);

        specularColor = lambertian*specularFactor * material.specularCoefficient * light.specular;
    #endif

    #ifdef CONSERVE_ENERGY
        float conserveEnergyFactor = EnergyConservation(material.shininess);
        specularColor = conserveEnergyFactor * specularColor;
    #endif

    return specularColor;
}

float CalculateSpotLightEffect(Light light, vec3 lightDirection) {
    vec3 spotLightDirection = normalize(light.position-light.conePointAt);
    float spotAngle = dot(-lightDirection, spotLightDirection);
    float epsilon = light.cosConeAngle - light.cosConeAngleInner;

    float spotIntensity = clamp((spotAngle - light.cosConeAngle)/epsilon, 0.0, 1.0);
    spotIntensity = pow(spotIntensity, max(0.01, light.spotExponent));

    return max(0., spotIntensity);
}

void main() {
    {{MODULE_BEGIN_FRAG}}

    vec3 normal = normalize(normInterpolated);
    vec2 uv = texCoord;

    #ifdef DOUBLE_SIDED
        if(!gl_FrontFacing) normal = normal*-1.0;
    #endif

    Material material;
    material.diffuse = inDiffuseColor.rgb;
    material.shininess = inMaterialProperties.SHININESS;
    material.specularCoefficient = inMaterialProperties.SPECULAR_AMT;

    float alpha = inDiffuseColor.a;

    #ifdef HAS_TEXTURES
        #ifdef HAS_TEXTURE_DIFFUSE
        material.diffuse = texture(texDiffuse, texCoord).rgb;

        #ifdef COLORIZE_TEXTURE
            material.diffuse *= inDiffuseColor.rgb;
        #endif
        #endif

        #ifdef HAS_TEXTURE_NORMAL
            normal = texture(texNormal, texCoord).rgb;
            normal = normalize(normal * 2. - 1.);
            float normalIntensity = inTextureIntensities.NORMAL;
            normal = normalize(mix(vec3(0., 0., 1.), normal, 2. * normalIntensity));
            normal =normalize(TBN_Matrix * normal);
        #endif
    #endif

    vec3 color = vec3(0.);
    vec4 col = vec4(0.);

    for (int i = 0; i < MAX_LIGHTS; i++) {
        Light light = lights[i];
        light.intensity = light.lightProperties.x;

        if (light.type == NONE) continue;

        else if (light.type == AMBIENT) {
            color = light.intensity*light.color;
        }
        else {

            // lightProperties; // x - intensity, y - radius, z - falloff
            light.radius = light.lightProperties.y;
            light.falloff = light.lightProperties.z;

            // spotProperties; // x - spotExponent, y - cosConeAngle, z - cosConeAngleInner
            light.spotExponent = light.spotProperties.x;
            light.cosConeAngle = light.spotProperties.y;
            light.cosConeAngleInner = light.spotProperties.z;

             // when light is not directional, we subtract fragpos, if it is we just use position
            vec3 lightDirection = normalize(light.position - when_neq(float(light.type), float(DIRECTIONAL)) * fragPos);
            vec3 viewDirection = normalize(v_viewDirection);


            #ifdef HAS_TEXTURES
                #ifdef HAS_TEXTURE_AO
                    float aoIntensity = inTextureIntensities.AO;
                    light.color *= mix(vec3(1.), texture(texAO, texCoord).rgb, aoIntensity);
                #endif

                #ifdef HAS_TEXTURE_SPECULAR
                    float specularIntensity = inTextureIntensities.SPECULAR;
                    light.specular *= mix(1., texture(texSpecular, texCoord).r, specularIntensity);
                #endif
            #endif

            vec4 diffuseColorLambert = CalculateDiffuseColor(material, light, lightDirection, viewDirection, normal);
            vec3 diffuseColor = diffuseColorLambert.rgb;
            float lambertian = diffuseColorLambert.w;

            // attenuation
            float distanceLightFrag = length(light.position - fragPos);
            float attenuation = CalculateFalloff(light, distanceLightFrag);
            attenuation *= when_gt(lambertian, 0.);

            // when_eq returns 1 when light type == DIRECTIONAL, 0 else, we take the max -> dirLight gets attenuation of 1.
            attenuation = max(attenuation, when_eq(float(light.type), float(DIRECTIONAL)));

            vec3 specularColor = CalculateSpecularColor(material, light, lightDirection, viewDirection, normal, lambertian);

            color = light.intensity * (diffuseColor + specularColor);

            color *= attenuation;

            if (light.type == SPOT) {
                float spotIntensity = CalculateSpotLightEffect(light, lightDirection);
                color *= spotIntensity;
            }

        }

        #ifdef ENABLE_FRESNEL
            color += inFresnel.rgb * (CalculateFresnel(vec3(cameraSpace_pos), normal) * inFresnel.w * inFresnelWidthExponent.x);
        #endif

        col += vec4(clamp(color, 0.0, 1.0), alpha);
    }

    col.a = alpha;

    #ifdef HAS_TEXTURE_ALPHA
        #ifdef TRANSFORMALPHATEXCOORDS
            uv=vec2(texCoord.s,1.0-texCoord.t);
        #endif
        #ifdef ALPHA_MASK_ALPHA
            col.a*=texture(texAlpha,uv).a;
        #endif
        #ifdef ALPHA_MASK_LUMI
            col.a*= dot(vec3(0.2126,0.7152,0.0722), texture(texAlpha,uv).rgb);
        #endif
        #ifdef ALPHA_MASK_R
            col.a*=texture(texAlpha,uv).r;
        #endif
        #ifdef ALPHA_MASK_G
            col.a*=texture(texAlpha,uv).g;
        #endif
        #ifdef ALPHA_MASK_B
            col.a*=texture(texAlpha,uv).b;
        #endif
    #endif

    #ifdef HAS_TEXTURE_EMISSIVE
        float emissiveIntensity = inTextureIntensities.EMISSIVE;
        col.rgb += emissiveIntensity * material.diffuse * texture(texEmissive, texCoord).r;
    #endif


    {{MODULE_COLOR}}

    #ifdef DISCARDTRANS
        if(col.a<0.2) discard;
    #endif

    // outColor = vec4(1., 0., 0., 1.);
    outColor = clamp(col, 0., 1.);
    //outColor = vec4()
}