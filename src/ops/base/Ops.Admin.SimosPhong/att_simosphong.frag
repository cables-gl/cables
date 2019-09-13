
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
 float ambientCoefficient;
 float constantAttenuation;
 float linearAttenuation;
 float quadraticAttenuation;
 float coneAngle;
 float cosConeAngle;
 float coneAngleInner;
 float cosConeAngleInner;
 float spotExponent;
 vec3 conePointAt;
};

uniform Material material;
uniform Light light;
uniform vec3 ambient;

UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;
UNI mat4 normalMatrix;

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

UNI float inDiffuseR;
UNI float inDiffuseG;
UNI float inDiffuseB;
UNI float shininess;
UNI float inSpecularCoefficient;

UNI float inNormalIntensity;

UNI int numLights;
UNI vec3 camPos;
UNI Light[MAX_LIGHTS] lights;

UNI float intensity;
UNI float constantAttenuation;
UNI float linearAttenuation;
UNI float quadraticAttenuation;

UNI float inAlpha;

IN vec2 texCoord;
IN vec3 norm;
IN vec3 normInterpolated;
IN vec3 vertPosOut;
IN vec3 noViewMatVertPos;
IN vec3 fragPos;
IN mat3 TBN_Matrix;
IN mat3 mvMatrixMat3;


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

#ifdef CONSERVE_ENERGY
// http://www.rorydriscoll.com/2009/01/25/energy-conservation-in-games/
float EnergyConservation(float shininess) {
    #ifndef SPECULAR_BLINN
    return (shininess + 2.)/TWO_PI;
    #endif
    #ifdef SPECULAR_BLINN
    return (shininess + 8.)/EIGHT_PI;
    #endif
}
#endif

float Attenuation(Light light, float distanceLightFrag)
{
    float denom = distanceLightFrag / light.radius; // + 1.0;
    // float attenuation = 1.0 / (denom*denom);
    float attenuation = light.intensity * (1./(light.constantAttenuation + 0.01*light.linearAttenuation*distanceLightFrag + light.quadraticAttenuation*0.001*(distanceLightFrag*distanceLightFrag)));

    float t = (attenuation - 0.1) / (1.0 - 0.1);

    //t = t * (light.falloff*light.falloff);

    return min(1.0,max(t, 0.0));
}

vec3 AmbientLight(Light light, Material material) {
    #ifdef HAS_TEXTURE_AO
        light.color *= texture(texAO, texCoord).rgb;
    #endif
    return light.intensity*light.color; //*material.diffuse;
}
vec3 DirectionalLight(Light light, Material material) {
    vec3 vertex = vertPosOut;
    vec3 normal = normalize(normInterpolated);

    #ifdef HAS_TEXTURE_NORMAL
    normal = texture(texNormal, texCoord).rgb;
    normal = normalize(normal * 2. - 1.);
    normal = normalize(TBN_Matrix * normal);
    #endif

    #ifdef DOUBLE_SIDED
    if(!gl_FrontFacing) normal = normal*-1.0;
    #endif

    vec3 viewDirection = normalize(camPos - fragPos);

//    viewDirection = normalize(camPos - fragPos);
    vec3 lightDirection = normalize(light.position);
    float lambertian = max(dot(lightDirection, normal), 0.0);

    vec3 ambientColor = vec3(0.);

    #ifdef HAS_TEXTURE_DIFFUSE
    vec2 uv = vec2(texCoord.s,1.0-texCoord.t);
    ambientColor = vec3(0.); //light.ambient * vec3(texture(texDiffuse, uv));
    #endif

    vec3 diffuseColor = lambertian*material.diffuse*light.color;
    vec3 specularColor = vec3(0.);
    float attenuation = 1.;

    if (lambertian > 0.0) {
        #ifndef SPECULAR_BLINN
        vec3 reflectDirection = reflect(-lightDirection, normal);
        float specularAngle = max(dot(reflectDirection, viewDirection), 0.);
        float specularFactor = pow(specularAngle, max(0.01, 1. - material.shininess)*256.);
        specularColor = specularFactor * material.specularCoefficient * light.color * light.specular; // * material.diffuse;

        #endif

        #ifdef SPECULAR_BLINN
        vec3 halfDirection = normalize(lightDirection + viewDirection);
        float specularAngle = max(dot(halfDirection, normal), 0.);
        float specularFactor = pow(specularAngle, max(0.01, 1. - material.shininess)*256.);
        specularColor = specularFactor * material.specularCoefficient * light.color * light.specular; // * material.diffuse;
        #endif

        #ifdef CONSERVE_ENERGY
        float conserveEnergyFactor = EnergyConservation(material.shininess);
        specularColor = conserveEnergyFactor * specularColor;
        #endif
    } else {
        attenuation = 0.;
    }

    return ambientColor + light.intensity*(diffuseColor + specularColor);
}

vec3 SpotLight(Light light, Material material) {
    vec3 normal = normalize(normInterpolated);
    #ifdef HAS_TEXTURE_NORMAL
    normal = texture(texNormal, texCoord).rgb;
    normal = normalize(normal * 2. - 1.);
    normal.z *= (1. -inNormalIntensity);
    normal = normalize(TBN_Matrix * normal);
    #endif

    #ifdef DOUBLE_SIDED
    if(!gl_FrontFacing) normal = normal*-1.0;
    #endif

    vec3 lightDirection = normalize(light.position - fragPos);
    vec3 viewDirection = normalize(camPos - fragPos);

    // ambient
    vec3 ambientColor = vec3(0.); //light.ambient*material.diffuse;

    #ifdef HAS_TEXTURE_DIFFUSE
    vec2 uv = vec2(texCoord.s,1.0-texCoord.t);
    //ambientColor = light.ambient * vec3(texture(texDiffuse, uv));
    #endif

    // diffuse coefficient
    float lambertian = max(dot(lightDirection, normal), 0.0);
    vec3 diffuseColor = lambertian*material.diffuse*light.color;

    vec3 specularColor = vec3(1.);


    // attenuation
    float distanceLightFrag = length(light.position - fragPos); //distance(light.position, noViewMatVertPos);
    float attenuation = light.intensity * (1./(light.constantAttenuation + 0.01*light.linearAttenuation*distanceLightFrag + light.quadraticAttenuation*0.001*(distanceLightFrag*distanceLightFrag)));
    //attenuation = Attenuation(light, distanceLightFrag);
    if (lambertian > 0.0) {
        #ifdef HAS_TEXTURE_SPECULAR
        vec2 uv2 = vec2(texCoord.s, 1.0-texCoord.t);
        specularColor = texture(texSpecular, texCoord).xyz;
        #endif

        // specular
        #ifndef SPECULAR_BLINN
        vec3 reflectDirection = reflect(-lightDirection, normal);
        float specularAngle = max(dot(viewDirection, reflectDirection), 0.);
        float specularFactor = pow(specularAngle, max(0.01, 1. - material.shininess)*256.);
        specularColor *= specularFactor * material.specularCoefficient * light.color * light.specular; // * material.diffuse;

        #endif

        #ifdef SPECULAR_BLINN
        vec3 halfDirection = normalize(lightDirection + viewDirection);
        float specularAngle = max(dot(halfDirection, normal), 0.);
        float specularFactor = pow(specularAngle, max(0.01, 1. - material.shininess)*256.);
        specularColor *= specularFactor * material.specularCoefficient * light.color * light.specular; // * material.diffuse;
        #endif

        // * SPOT LIGHT *
        vec3 spotLightDirection = -1.*normalize(light.position-light.conePointAt);
        float spotAngle = dot(lightDirection, spotLightDirection);

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
    return ambientColor+attenuation*(diffuseColor + specularColor);
}

vec3 PointLight(Light light, Material material) {


    vec3 normal = normalize(normInterpolated);

    #ifdef HAS_TEXTURE_NORMAL
    normal = texture(texNormal, texCoord).rgb;
    normal.b = inNormalIntensity*(1. - inNormalIntensity);
    normal = normalize(normal * 2. - 1.);
    normal = normalize(TBN_Matrix * normal);
    #endif

    #ifdef DOUBLE_SIDED
    if(!gl_FrontFacing) normal = normal*-1.0;
    #endif


    vec3 lightDirection = normalize(light.position - fragPos);
    vec3 viewDirection = normalize(camPos - fragPos);

    // ambient
    vec3 ambientColor = vec3(0.); //light.ambient*material.diffuse;

    #ifdef HAS_TEXTURE_DIFFUSE
    vec2 uv = vec2(texCoord.s,1.0-texCoord.t);
    //ambientColor = light.ambient * vec3(texture(texDiffuse, uv));
    #endif

    // diffuse coefficient
    float lambertian = max(dot(lightDirection, normal), 0.0);
    vec3 diffuseColor = lambertian*material.diffuse*light.color;

    vec3 specularColor = vec3(0.);

    // attenuation
    float distanceLightFrag = length(light.position - fragPos); //distance(light.position, noViewMatVertPos);
    float attenuation = light.intensity * (1./(light.constantAttenuation + light.linearAttenuation*distanceLightFrag + light.quadraticAttenuation*(distanceLightFrag*distanceLightFrag)));

    if (lambertian > 0.0) {
        // specular
        #ifndef SPECULAR_BLINN
        vec3 reflectDirection = reflect(-lightDirection, normal);
        float specularAngle = max(dot(viewDirection, reflectDirection), 0.);
        float specularFactor = pow(specularAngle, max(0.01, 1. - material.shininess)*256.);
        specularColor = specularFactor * material.specularCoefficient * light.color * light.specular; // * material.diffuse;
        #endif

        #ifdef SPECULAR_BLINN
        vec3 halfDirection = normalize(lightDirection + viewDirection);
        float specularAngle = max(dot(halfDirection, normal), 0.);
        float specularFactor = pow(specularAngle, max(0.01, 1. - material.shininess)*256.);
        specularColor = specularFactor * material.specularCoefficient * light.color * light.specular; // * material.diffuse;
        #endif

        #ifdef CONSERVE_ENERGY
        float conserveEnergyFactor = EnergyConservation(material.shininess);
        specularColor = conserveEnergyFactor * specularColor;
        #endif
    }
    else {
        attenuation = 0.;
    }
    return ambientColor+attenuation*(diffuseColor + specularColor);
}

void main() {
    {{MODULE_BEGIN_FRAG}}
    {{MODULE_COLOR}}

    vec3 normal = normalize(normInterpolated);
    vec3 vertex = vertPosOut;

    vec3 ambientColor = vec3(1.);
    vec3 specularColor = vec3(1.);
    vec3 diffuseColor = vec3(1.);
    Material _material = material;
    _material.diffuse = vec3(inDiffuseR, inDiffuseG, inDiffuseB);
    _material.shininess = shininess;
    _material.specularCoefficient = inSpecularCoefficient;
    float alpha = inAlpha;
    #ifdef HAS_TEXTURES
        vec2 uv = vec2(texCoord.s, 1.0-texCoord.t);

       #ifdef HAS_TEXTURE_DIFFUSE
            _material.diffuse = texture(texDiffuse,uv).xyz;
            #ifdef COLORIZE_TEXTURE
                _material.diffuse *= vec3(inDiffuseR, inDiffuseG, inDiffuseB);
            #endif
            alpha = inAlpha * texture(texDiffuse,uv).a;
        #endif

        #ifdef HAS_TEXTURE_SPECULAR
            vec2 uv2 = vec2(texCoord.s, 1.0-texCoord.t);
            _material.specular = texture(texSpecular, texCoord).xyz;
        #endif

        #ifdef HAS_TEXTURE_NORMAL
        // TODO: calc tangentspace light dir and view dir in vertex shader instead of normal transform here
        normal = texture(texNormal, texCoord).rgb;
        normal = normalize(normal * 2. - 1.);
        normal = normalize(TBN_Matrix * normal);
        #endif

    #endif

    vec3 color = vec3(0.);

    for (int i = 0; i < MAX_LIGHTS; i++) {
        Light light = lights[i];
        if (light.type == POINT) {
            color = PointLight(light, _material);
        }
        else if (light.type == SPOT) {
            color = SpotLight(light, _material);
            //continue;
        }
        else if (light.type == DIRECTIONAL) {
            color = DirectionalLight(light, _material);
        }
        else if (light.type == AMBIENT) {
            color = AmbientLight(light, _material);
        }
         else {
            continue;
        }

        outColor += vec4(color, inAlpha);
    }

}


