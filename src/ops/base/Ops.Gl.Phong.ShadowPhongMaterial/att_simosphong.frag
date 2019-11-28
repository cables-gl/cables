
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
    mat4 lightBiasMVP;
    int shadowMapIndex;

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

UNI Light lights[MAX_LIGHTS];
// UNI Light light;
#ifdef RECEIVE_SHADOW
    UNI sampler2D shadowMaps[MAX_SHADOWMAPS];
    IN vec4 lightSpace_fragPos[MAX_SHADOWMAPS];
    IN vec4 shadowCoords[MAX_SHADOWMAPS];
#endif

UNI Material material;
UNI vec4 inDiffuseColor;
UNI vec4 inMaterialProperties;

//UNI float shininess;
//UNI float inSpecularCoefficient;

#ifdef ENABLE_FRESNEL
    UNI vec4 inFresnel;
#endif


UNI vec3 camPos;

IN vec2 texCoord;
IN vec3 normInterpolated;
IN vec3 fragPos;
IN mat3 TBN_Matrix;
IN vec4 cameraSpace_pos;

IN vec4 shadowCoord;

UNI mat4 normalMatrix;
UNI mat4 viewMatrix;

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

// #define ALIASING_VARIANCE


#ifdef RECEIVE_SHADOW
    float linstep(float value, float low, float high) {
        return clamp((value - low)/(high-low), 0., 1.) ;
    }

    float ChebyshevUpperBound(sampler2D shadowMap, vec4 shadowCoord) {
        float distanceTo = shadowCoord.z;
        // retrieve previously stored moments & variance

        vec3 moments = texture(shadowMap, shadowCoord.xy).rgb;

        //if (distanceTo <= moments.x) return 1.;
        float p = step(distanceTo, moments.x);

        // could this be done in shadow pass? no because we interpolate with linear filtering
        float variance = max(moments.y - (moments.x * moments.x), 0.00002);

        float distanceToMean = distanceTo - moments.x;
        //there is a very small probability that something is being lit when its not
        // little hack: clamp pMax 0.2 - 1. then subtract - 0,2
        float pMax = linstep(variance / (variance + distanceToMean * distanceToMean), 0.0001, 1.);

        float origRes = clamp(pMax, 1., p);
        //float res = 1. - clamp(pMax, 1., p);
        //if (res < 0.00001) return 1.;
        return origRes; //- 0.80002; // min(max(pMax, p), 1.);
    }
#endif

// http://www.chinedufn.com/webgl-shadow-mapping-tutorial/
#ifdef ALIASING_PCF
    float decodeFloat (vec4 color) {
    const vec4 bitShift = vec4(
    1.0 / (256.0 * 256.0 * 256.0),
    1.0 / (256.0 * 256.0),
    1.0 / 256.0,
    1);

    return dot(color, bitShift);
}

    float PCFSampling(sampler2D shadowMap, vec4 shadowCoord, float bias) {
        vec3 fragmentDepth = shadowCoord.xyz;

        float texelSize = 1. / shadowMapWidth;
        float visibility = 0.;

        for (int x = -1; x <= 1; x++) {
            for (int y = -1; y <= 1; y++) {
                float texelDepth = texture(shadowMap, fragmentDepth.xy + vec2(x, y) * texelSize).r;
                // float texelDepth = decodeFloat(shadowColor);
                if (fragmentDepth.z - bias < texelDepth) {
                    visibility += 1.;
                }
            }
        }

        visibility /= 9.;
        return visibility;
    }
#endif

#ifdef ALIASING_POISSON

    vec2 poissonDisk[16] = vec2[](
       vec2( -0.94201624, -0.39906216 ),
       vec2( 0.94558609, -0.76890725 ),
       vec2( -0.094184101, -0.92938870 ),
       vec2( 0.34495938, 0.29387760 ),
       vec2( -0.91588581, 0.45771432 ),
       vec2( -0.81544232, -0.87912464 ),
       vec2( -0.38277543, 0.27676845 ),
       vec2( 0.97484398, 0.75648379 ),
       vec2( 0.44323325, -0.97511554 ),
       vec2( 0.53742981, -0.47373420 ),
       vec2( -0.26496911, -0.41893023 ),
       vec2( 0.79197514, 0.19090188 ),
       vec2( -0.24188840, 0.99706507 ),
       vec2( -0.81409955, 0.91437590 ),
       vec2( 0.19984126, 0.78641367 ),
       vec2( 0.14383161, -0.14100790 )
    );

    const int SAMPLE_AMOUNT = 16;

    float PoissonSampling(sampler2D shadowMap, vec4 shadowCoord, float bias) {
        float visibility = 1.;
        for (int i = 0; i < SAMPLE_AMOUNT; i++) {
            if (texture(shadowMap, (shadowCoord.xy + poissonDisk[i]/700.)).r < shadowCoord.z - bias) {
                visibility -= 0.2;
            }
        }
        return visibility;
    }
#endif
#ifdef ALIASING_STRATIFIED
    vec2 poissonDisk[16] = vec2[](
       vec2( -0.94201624, -0.39906216 ),
       vec2( 0.94558609, -0.76890725 ),
       vec2( -0.094184101, -0.92938870 ),
       vec2( 0.34495938, 0.29387760 ),
       vec2( -0.91588581, 0.45771432 ),
       vec2( -0.81544232, -0.87912464 ),
       vec2( -0.38277543, 0.27676845 ),
       vec2( 0.97484398, 0.75648379 ),
       vec2( 0.44323325, -0.97511554 ),
       vec2( 0.53742981, -0.47373420 ),
       vec2( -0.26496911, -0.41893023 ),
       vec2( 0.79197514, 0.19090188 ),
       vec2( -0.24188840, 0.99706507 ),
       vec2( -0.81409955, 0.91437590 ),
       vec2( 0.19984126, 0.78641367 ),
       vec2( 0.14383161, -0.14100790 )
    );
    const int SAMPLE_AMOUNT = 16;

    float Random(vec4 randomVec) {
        float dotProduct = dot(randomVec, vec4(12.9898,78.233,45.164,94.673));
        return fract(sin(dotProduct) * 43758.5453);
    }

    float StratifiedSampling(sampler2D shadowMap, vec4 shadowCoord, float bias) {
        float visibility = 1.;
        for (int i = 0; i < SAMPLE_AMOUNT; i++) {
            int index = int(16. * Random(vec4(gl_FragCoord.xyy, i)))%16;
            if (texture(shadowMap, (shadowCoord.xy + poissonDisk[index]/700.)).r < shadowCoord.z - bias) {
                visibility -= 0.2;
            }
        }
        return visibility;
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
            //return ((shininess+2.)*(shininess+4.))/(EIGHT_PI*(pow(2., -shininess/2.) + shininess));
        #endif

        #ifdef SPECULAR_SCHLICK
            return (shininess + 8.)/EIGHT_PI;
        #endif

        #ifdef SPECULAR_GAUSS
            return (shininess + 8.)/EIGHT_PI;
            //return ((shininess+2.)*(shininess+4.))/(EIGHT_PI*(pow(2., -shininess/2.) + shininess));
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
        float factor = pow( product, 5.0 );

        return 5. * factor;

    }
#endif


float CalculateFalloff(Light light, float distance) {
    float denom = distance / light.radius + 1.0;
    float attenuation = 1.0 / (denom*denom);
    float t = (attenuation - light.falloff) / (1.0 - light.falloff);
    return max(t, 0.0);
}

vec3 AmbientLight(Light light, Material material) {
    return light.intensity*light.color; //*material.diffuse;
}

vec3 DirectionalLight(Light light, Material material, vec3 normal) {


    vec3 viewDirection = normalize(camPos - fragPos);
    vec3 lightDirection = normalize(light.position);

    // diffuse coefficient
    #ifndef ENABLE_OREN_NAYAR_DIFFUSE
        float lambertian = clamp(dot(lightDirection, normal), 0., 1.);
    #endif

    #ifdef ENABLE_OREN_NAYAR_DIFFUSE
        float lambertian = CalculateOrenNayar(lightDirection, viewDirection, normal);
    #endif

    vec3 ambientColor = vec3(0.);

    #ifdef HAS_TEXTURE_DIFFUSE
    vec2 uv = vec2(texCoord.s,1.0-texCoord.t);
    ambientColor = vec3(0.);
    #endif

    vec3 diffuseColor = lambertian*material.diffuse*light.color;
    vec3 specularColor = vec3(0.);
    float attenuation = 1.;

    if (lambertian > 0.0) {
        #ifdef SPECULAR_PHONG
            vec3 reflectDirection = reflect(-lightDirection, normal);
            float specularAngle = max(dot(reflectDirection, viewDirection), 0.);
            float specularFactor = pow(specularAngle, max(0., material.shininess)); //max(0.01, 1. - material.shininess)*256.);
            specularColor = lambertian * specularFactor * material.specularCoefficient * light.specular; // * material.diffuse;
        #endif

        #ifdef SPECULAR_BLINN
            vec3 halfDirection = normalize(lightDirection + viewDirection);
            float specularAngle = max(dot(halfDirection, normal), 0.);
            float specularFactor = pow(specularAngle, max(0., material.shininess)); //max(0.01, 1. - material.shininess)*256.);
            specularColor = lambertian * specularFactor * material.specularCoefficient * light.specular; // * material.diffuse;
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
            float exponent = specularAngle * material.shininess * 0.17; // * 10.;
            exponent = -(exponent*exponent);
            float specularFactor = exp(exponent);

            specularColor = lambertian*specularFactor * material.specularCoefficient * light.specular;
        #endif

        #ifdef CONSERVE_ENERGY
            float conserveEnergyFactor = EnergyConservation(material.shininess);
            specularColor = conserveEnergyFactor * specularColor;
        #endif

    } else {
        attenuation = 0.;
    }


    #ifdef RECEIVE_SHADOW
        float visibility = 1.;
        vec4 shadowCoord = shadowCoords[light.shadowMapIndex];
        //if (texture(shadowMaps[light.shadowMapIndex], shadowCoord.xy).w < shadowCoord.z - 0.3) visibility = 0.2;
        visibility = ChebyshevUpperBound(shadowMaps[light.shadowMapIndex], shadowCoord);

        specularColor *= visibility;
        diffuseColor *= visibility;
    #endif

    vec3 color = ambientColor + light.intensity*(diffuseColor + specularColor);

    #ifdef ENABLE_FRESNEL
        color += inFresnel.rgb * (CalculateFresnel(vec3(cameraSpace_pos), normal) * inFresnel.w);
    #endif

    return color;
}

vec3 SpotLight(Light light, Material material, vec3 normal) {


    vec3 lightDirection = normalize(light.position - fragPos);
    vec3 viewDirection = normalize(camPos - fragPos);

    // ambient
    vec3 ambientColor = vec3(0.);

    // diffuse coefficient

    #ifndef ENABLE_OREN_NAYAR_DIFFUSE
        float lambertian = clamp(dot(lightDirection, normal), 0., 1.);
    #endif

    #ifdef ENABLE_OREN_NAYAR_DIFFUSE
        float lambertian = CalculateOrenNayar(lightDirection, viewDirection, normal);
    #endif

    vec3 diffuseColor = lambertian*material.diffuse*light.color;

    vec3 specularColor = vec3(1.);


    // attenuation
    float distanceLightFrag = length(light.position - fragPos); //distance(light.position, noViewMatVertPos);

    float attenuation = CalculateFalloff(light, distanceLightFrag);

    if (lambertian > 0.0) {
        #ifdef HAS_TEXTURE_SPECULAR
            vec2 uv2 = vec2(texCoord.s, 1.0-texCoord.t);
            specularColor = texture(texSpecular, texCoord).xyz;
        #endif

        // specular
        #ifdef SPECULAR_PHONG
            vec3 reflectDirection = reflect(-lightDirection, normal);
            float specularAngle = max(dot(viewDirection, reflectDirection), 0.);
            float specularFactor = pow(specularAngle, material.shininess);
            specularColor = lambertian * specularFactor * material.specularCoefficient * light.specular;

        #endif

        #ifdef SPECULAR_BLINN
            vec3 halfDirection = normalize(lightDirection + viewDirection);
            float specularAngle = max(dot(halfDirection, normal), 0.);
            float specularFactor = pow(specularAngle, material.shininess);
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
            float exponent = specularAngle * material.shininess * 0.17; // * 10.;
            exponent = -(exponent*exponent);
            float specularFactor = exp(exponent);

            specularColor = lambertian*specularFactor * material.specularCoefficient * light.specular;
        #endif

        // * SPOT LIGHT *
        vec3 spotLightDirection = normalize(light.position-light.conePointAt);
        float spotAngle = dot(-lightDirection, spotLightDirection);

        if (spotAngle > light.cosConeAngle) {
            attenuation = 0.;
        } else {
            float epsilon = light.cosConeAngle - light.cosConeAngleInner;
            float spotIntensity = clamp((spotAngle - light.cosConeAngle)/epsilon, 0.0, 1.0);
            spotIntensity = pow(spotIntensity, max(0.01, light.spotExponent));

            diffuseColor *= spotIntensity;
            specularColor *= spotIntensity;

        }

        #ifdef CONSERVE_ENERGY
            float conserveEnergyFactor = EnergyConservation(material.shininess);
            specularColor = conserveEnergyFactor * specularColor;
        #endif
    }
    else {
        attenuation = 0.;
    }


    vec3 color = ambientColor+attenuation*light.intensity*(diffuseColor + specularColor);

    #ifdef ENABLE_FRESNEL
        color += inFresnel.rgb * (CalculateFresnel(vec3(cameraSpace_pos), normal) * inFresnel.w);
    #endif

    return color;
}

vec3 PointLight(Light light, Material material, vec3 normal) {


    vec3 lightDirection = normalize((light.position - fragPos));
    vec3 viewDirection = normalize((camPos - fragPos));

    // ambient
    vec3 ambientColor = vec3(0.);

    // diffuse coefficient
        float lambertian = clamp(dot(lightDirection, normal), 0., 1.);

    // float CalculateOrenNayar(vec3 lightDirection, vec3 viewDirection, vec3 normal) {
    #ifdef ENABLE_OREN_NAYAR_DIFFUSE
        vec3 diffuseColor = CalculateOrenNayar(lightDirection, viewDirection, normal)*material.diffuse*light.color;
    #endif
    #ifndef ENABLE_OREN_NAYAR_DIFFUSE
        vec3 diffuseColor = lambertian*material.diffuse*light.color;
    #endif

    vec3 specularColor = vec3(0.);

    // attenuation
    float distanceLightFrag = length((light.position - fragPos));
    float attenuation = CalculateFalloff(light, distanceLightFrag);

    if (lambertian > 0.0) {
        // specular
        #ifdef SPECULAR_PHONG
            vec3 reflectDirection = reflect(-lightDirection, normal);
            float specularAngle = max(dot(viewDirection, reflectDirection), 0.);
            float specularFactor = pow(specularAngle, max(0., material.shininess));
            specularColor = lambertian * specularFactor * material.specularCoefficient * light.specular;
        #endif

        #ifdef SPECULAR_BLINN
            vec3 halfDirection = normalize(lightDirection + viewDirection);
            float specularAngle = dot(halfDirection, normal);
            float specularFactor = pow(specularAngle, max(0., material.shininess)); // max(0.01, 1. - material.shininess)*256.);
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
            float exponent = specularAngle * material.shininess * 0.17; // * 10.;
            exponent = -(exponent*exponent);
            float specularFactor = exp(exponent);
            specularColor = lambertian*specularFactor * material.specularCoefficient * light.specular;
        #endif

        #ifdef CONSERVE_ENERGY
            float conserveEnergyFactor = EnergyConservation(material.shininess);
            specularColor = conserveEnergyFactor * specularColor;
        #endif
    }
    else {
        attenuation = 0.;
    }
    // col.rgb += col.rgb *(CalculateFresnel(vec3(cameraSpace_pos),normal)*inFresnel*5.);


    vec3 color = ambientColor+attenuation*light.intensity* (diffuseColor + specularColor);

    #ifdef ENABLE_FRESNEL
        color += inFresnel.rgb * (CalculateFresnel(vec3(cameraSpace_pos), normal) * inFresnel.w);
    #endif
    return color;
}

void main() {
    {{MODULE_BEGIN_FRAG}}

    vec3 normal = normalize(normInterpolated);
    vec2 uv = texCoord;

    #ifdef DOUBLE_SIDED
        if(!gl_FrontFacing) normal = normal*-1.0;
    #endif

    Material _material = material;
    _material.diffuse = inDiffuseColor.rgb;
    _material.shininess = inMaterialProperties.SHININESS;
    _material.specularCoefficient = inMaterialProperties.SPECULAR_AMT;

    float alpha = inDiffuseColor.a;

    #ifdef HAS_TEXTURES
       #ifdef HAS_TEXTURE_DIFFUSE
            _material.diffuse = texture(texDiffuse, texCoord).rgb;

            #ifdef COLORIZE_TEXTURE
                _material.diffuse *= inDiffuseColor.rgb;
            #endif

        #endif

        #ifdef HAS_TEXTURE_NORMAL
            // TODO: calc tangentspace light dir and view dir in vertex shader instead of normal transform here

          //          vec3 tnorm=texture( texNormal, vec2(texCoord.x*repeatX,texCoord.y*repeatY) ).xyz * 2.0 - 1.0;


        // old code
             normal = texture(texNormal, texCoord).rgb;
            normal = normalize(normal * 2. - 1.);
            float normalIntensity = inTextureIntensities.NORMAL;
             normal = normalize(mix(vec3(0., 0., 1.), normal, 2. * normalIntensity));
            normal =normalize(TBN_Matrix * normal);


        //tnorm = normalize(tnorm*normalScale);
        /*
        vec3 normalFromMap = texture(texNormal, texCoord).rgb;
        normalFromMap = normalFromMap * 2. - 1.;
        normalFromMap = normalize(mix(vec3(0., 0., 1.), normalFromMap, inTextureIntensities.NORMAL));
        normalFromMap = normalize(TBN_Matrix * normalFromMap);
        normal = normalize(mat3(normalMatrix) * (normalize(normal + normalFromMap) * max(0.0000001, inTextureIntensities.NORMAL)));
        */
//                    vec3 n = normalize( mat3(normalMatrix) * (norm+tnorm*normalScale) );

        #endif
    #endif

    vec3 color = vec3(0.);
    vec4 col = vec4(0.);

    for (int i = 0; i < MAX_LIGHTS; i++) {
        Light light = lights[i];

            // lightProperties; // x - intensity, y - radius, z - falloff
        light.intensity = light.lightProperties.x;
        light.radius = light.lightProperties.y;
        light.falloff = light.lightProperties.z;
        #ifdef HAS_TEXTURE_AO
            float aoIntensity = inTextureIntensities.AO;
            light.color *= mix(vec3(1.), texture(texAO, texCoord).rgb, aoIntensity);
        #endif

        #ifdef HAS_TEXTURE_SPECULAR
            float specularIntensity = inTextureIntensities.SPECULAR;
            light.specular *= mix(1., texture(texSpecular, texCoord).r, specularIntensity);
        #endif

        if (light.type == POINT) {
            color = PointLight(light, _material, normal);
        }
        else if (light.type == SPOT) {
            // spotProperties; // x - spotExponent, y - cosConeAngle, z - cosConeAngleInner
            light.spotExponent = light.spotProperties.x;
            light.cosConeAngle = light.spotProperties.y;
            light.cosConeAngleInner = light.spotProperties.z;

            color = SpotLight(light, _material, normal);
        }
        else if (light.type == DIRECTIONAL) {
            color = DirectionalLight(light, _material, normal);
        }
        else if (light.type == AMBIENT) {
            color = AmbientLight(light, _material);
        }
         else {
            continue;
        }

        col += vec4(clamp(color, 0.0, 1.0), alpha);
        // TODO: optimize

        //vec3 lightDirection = normalize(light.position - fragPos);
        //if (light.type == DIRECTIONAL) lightDirection = light.position;
        //col += col * (CalculateFresnel(lightDirection, normal) * inFresnel.w * 5.0);
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
            col.a*=dot(vec3(0.2126,0.7152,0.0722), texture(texAlpha,uv).rgb);
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
        // #endif
    #endif

    #ifdef HAS_TEXTURE_EMISSIVE
    float emissiveIntensity = inTextureIntensities.EMISSIVE;
    // wenn weiß dann nur diffuse color, wenn schwarz dann specular etc.
        col.rgb += emissiveIntensity * _material.diffuse * texture(texEmissive, texCoord).r;
    #endif


    {{MODULE_COLOR}}

    #ifdef DISCARDTRANS
        if(col.a<0.2) discard;
    #endif

    outColor = clamp(col, 0., 1.);
}

/*
    // #ifdef HAS_SHADOW_MAP
       // float visibility = 1.;
        float bias = 0.05;

        // * FIXING SELF SHDAOWING ? * //

        // from stackoverflow
        bias = max(0.05 * (1. - dot(normal, lightDirection)), 0.005);
       // from openGL tut: http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-16-shadow-mapping/
       //bias = clamp(0.005*tan(acos(dot(normal,lightDirection))), 0.01, 0.06);



        //vec3 actualShadowCoords = shadowCoord.xyz / shadowCoord.w;
        //actualShadowCoords = actualShadowCoords * 0.5 + 0.5;
        //ec3 projCoords = lightSpace_fragPos.xyz / lightSpace_fragPos.w;
        //projCoords = projCoords * 0.5 + 0.5;

        float closestDepth = texture(shadowMap, shadowCoord.xy).z;
        float currentDepth = shadowCoord.z;

        // float visibility = currentDepth > closestDepth ? 1. : 0.5;
        float visibility = 1.0;

        #ifdef ALIASING_PCF
            visibility = PCFSampling(shadowMap, shadowCoord, bias);
          if (texture(shadowMap, shadowCoord.xy).r < shadowCoord.z - bias) visibility = 0.2;

         #endif

        #ifdef ALIASING_POISSON
            visibility = PoissonSampling(shadowMap, shadowCoord, bias);
        #endif

        #ifdef ALIASING_STRATIFIED
            visibility = StratifiedSampling(shadowMap, shadowCoord, bias);
        #endif

        #ifdef ALIASING_VARIANCE
            visibility = VarianceSampling(shadowMap, shadowCoord, bias);
        #endif


        if (texture(shadowMap, actualShadowCoords.xy).r < shadowCoord.z - bias) {
            // visibility = 0.5;
        }

        // visibility=closestDepth;


        diffuseColor *= (visibility); // (visibility);
        specularColor *= (visibility); // (visibility);

    // #endif
*/

