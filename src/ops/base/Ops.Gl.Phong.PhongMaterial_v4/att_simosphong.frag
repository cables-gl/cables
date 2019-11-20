
// https://www.mathematik.uni-marburg.de/~thormae/lectures/graphics1/code/WebGLShaderLightMat/ShaderLightMat.html
struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
	float specularCoefficient;
};

struct Light {
    vec3 position;
    vec3 color;
    vec3 ambient;
    vec3 specular;
    int type;
    float intensity;
    float radius;
    float falloff;
    float cosConeAngle;
    float cosConeAngleInner;
    float spotExponent;
    vec3 conePointAt;
};


#ifdef HAS_TEXTURE_DIFFUSE
    UNI sampler2D texDiffuse;
#endif

#ifdef HAS_TEXTURE_SPECULAR
    UNI sampler2D texSpecular;
    UNI float inSpecularIntensity;
#endif

#ifdef HAS_TEXTURE_NORMAL
    UNI sampler2D texNormal;
    UNI float inNormalIntensity;
#endif

#ifdef HAS_TEXTURE_AO
    UNI sampler2D texAO;
    UNI float inAoIntensity;
#endif

#ifdef HAS_TEXTURE_EMISSIVE
    UNI sampler2D texEmissive;
    UNI float inEmissiveIntensity;
#endif
#ifdef HAS_TEXTURE_ALPHA
    UNI sampler2D texAlpha;
#endif

UNI Light lights[MAX_LIGHTS];

UNI Material material;
UNI float inDiffuseR;
UNI float inDiffuseG;
UNI float inDiffuseB;
UNI float inAlpha;
UNI float shininess;
UNI float inSpecularCoefficient;

#ifdef ENABLE_FRESNEL
    UNI float inFresnel;
    UNI float inFresnelR;
    UNI float inFresnelG;
    UNI float inFresnelB;
#endif

#ifdef ENABLE_OREN_NAYAR_DIFFUSE
    UNI float inAlbedo;
    UNI float inRoughness;
#endif


UNI vec3 camPos;

IN vec2 texCoord;
IN vec3 normInterpolated;
IN vec3 fragPos;
IN mat3 TBN_Matrix;
IN vec4 cameraSpace_pos;

UNI mat4 normalMatrix;
UNI mat4 viewMatrix;

#define PI 3.1415926535897932384626433832795
#define NONE -1
#define AMBIENT 0
#define POINT 1
#define DIRECTIONAL 2
#define SPOT 3
#define AREA 4
const float TWO_PI = 2.*PI;
const float EIGHT_PI = 8.*PI;

{{MODULES_HEAD}}

/*
float FalloffInverseSquare(Light light, float distance) {
    if (light.radius <= distance) return 0.;
    return 1./(distance*distance);
}

float FalloffB(Light light, float distance) {
    if (distance < (1.-light.falloff) * light.radius) {
        return 1.;
    }

    else if (distance >= light.radius) {
        return 0.;
    }

    else {
        return ((light.radius - distance) / (light.radius - light.radius*(1.-light.falloff)));
    }
}

float FalloffC(Light light, float distance) {
    float radius = light.radius*(1.-light.falloff);
    float attenuation = clamp(1.0 - distance*distance/(radius*radius), 0., 1.);
    attenuation*=attenuation;
    return attenuation;
}
*/
/*
float Attenuation(Light light, float distanceLightFrag)
{

    float denom = distanceLightFrag / light.radius + 1.0;
    float attenuation = 1.0 / (denom*denom);
    float t = (attenuation - 0.1) / (1.0 - 0.1);
    t = t * ((1.-light.falloff)*(1.-light.falloff));

    return clamp(t, 0., 1.);

}
*/


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

        float albedo = inAlbedo * 1.8;
        float s = LdotV - NdotL * NdotV;
        float t = mix(1., max(NdotL, NdotV), step(0., s));

        float sigma2 = inRoughness * inRoughness;
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


        /*
        float n1 = inRefracIndex1; //1.;
        float n2 = inRefracIndex2; //0.2;
        float r0 = pow((n1-n2) / (n1+n2), 2.);

        float factor = r0 * (1. - r0)*pow((max(dot(nDirection, halfDirection), 0.)), 5.);
        */
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
    ambientColor = vec3(0.); //light.ambient * vec3(texture(texDiffuse, uv));
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

    vec3 color = ambientColor + light.intensity*(diffuseColor + specularColor);

    #ifdef ENABLE_FRESNEL
        color += vec3(inFresnelR, inFresnelG, inFresnelB) * (CalculateFresnel(vec3(cameraSpace_pos), normal) * inFresnel);
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
        color += vec3(inFresnelR, inFresnelG, inFresnelB) * (CalculateFresnel(vec3(cameraSpace_pos), normal) * inFresnel);
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
        color += vec3(inFresnelR, inFresnelG, inFresnelB) * (CalculateFresnel(vec3(cameraSpace_pos), normal) * inFresnel);
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
    _material.diffuse = vec3(inDiffuseR, inDiffuseG, inDiffuseB);
    _material.shininess = shininess;
    _material.specularCoefficient = inSpecularCoefficient;

    float alpha = inAlpha;

    #ifdef HAS_TEXTURES
       #ifdef HAS_TEXTURE_DIFFUSE
            _material.diffuse = texture(texDiffuse, texCoord).rgb;

            #ifdef COLORIZE_TEXTURE
                _material.diffuse *= vec3(inDiffuseR, inDiffuseG, inDiffuseB);
            #endif

        #endif

        #ifdef HAS_TEXTURE_NORMAL
            // TODO: calc tangentspace light dir and view dir in vertex shader instead of normal transform here

          //          vec3 tnorm=texture( texNormal, vec2(texCoord.x*repeatX,texCoord.y*repeatY) ).xyz * 2.0 - 1.0;


        // old code
             normal = texture(texNormal, texCoord).rgb;
            normal = normalize(normal * 2. - 1.);
             normal = normalize(mix(vec3(0., 0., 1.), normal, 2. * inNormalIntensity));
            normal =normalize(TBN_Matrix * normal);


        //tnorm = normalize(tnorm*normalScale);
        /*
        vec3 normalFromMap = texture(texNormal, texCoord).rgb;
        normalFromMap = normalFromMap * 2. - 1.;
        normalFromMap = normalize(mix(vec3(0., 0., 1.), normalFromMap, inNormalIntensity));
        normalFromMap = normalize(TBN_Matrix * normalFromMap);
        normal = normalize(mat3(normalMatrix) * (normalize(normal + normalFromMap) * max(0.0000001, inNormalIntensity)));
        */
//                    vec3 n = normalize( mat3(normalMatrix) * (norm+tnorm*normalScale) );

        #endif
    #endif

    vec3 color = vec3(0.);
    vec4 col = vec4(0.);

    for (int i = 0; i < MAX_LIGHTS; i++) {
        Light light = lights[i];

        #ifdef HAS_TEXTURE_AO
            light.color *= mix(vec3(1.), texture(texAO, texCoord).rgb, inAoIntensity);
        #endif

        #ifdef HAS_TEXTURE_SPECULAR
            light.specular *= mix(1., texture(texSpecular, texCoord).r, inSpecularIntensity);
        #endif

        if (light.type == POINT) {
            color = PointLight(light, _material, normal);
        }
        else if (light.type == SPOT) {
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
        //col += col * (CalculateFresnel(lightDirection, normal) * inFresnel * 5.0);
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
        // #endif
    #endif

    #ifdef HAS_TEXTURE_EMISSIVE
    // wenn weiß dann nur diffuse color, wenn schwarz dann specular etc.
        col.rgb += inEmissiveIntensity * _material.diffuse * texture(texEmissive, texCoord).r;
    #endif


    {{MODULE_COLOR}}

    #ifdef DISCARDTRANS
        if(col.a<0.2) discard;
    #endif

    outColor = clamp(col, 0., 1.);
}


