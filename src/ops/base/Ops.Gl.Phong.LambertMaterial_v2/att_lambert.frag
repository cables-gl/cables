{{MODULES_HEAD}}

#define AMBIENT 0
#define POINT 1
#define DIRECTIONAL 2
#define SPOT 3

IN vec3 norm;
IN vec4 modelPos;

// UNI mat4 normalMatrix;
IN mat3 normalMatrix; // when instancing...

IN vec2 texCoord;

IN vec3 mvNormal;
IN vec3 mvTangent;
IN vec3 mvBiTangent;

UNI vec4 materialColor;//r,g,b,a;

struct Light {
    vec3 position;
    vec3 color;
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

    int type;
    int castLight;
    #define CASTLIGHT x
    #define TYPE y
    ivec2 castLightType;
};
#ifdef HAS_TEXTURES
    #ifdef HAS_TEXTURE_DIFFUSE
        UNI sampler2D texDiffuse;
    #endif
#endif

UNI Light lights[NUM_LIGHTS];

// * UTILITY FUNCTIONS */
float when_gt(float x, float y) { return max(sign(x - y), 0.0); } // comparator function
float when_eq(float x, float y) { return 1. - abs(sign(x - y)); } // comparator function
float when_neq(float x, float y) { return abs(sign(x - y)); } // comparator function


// * LIGHT CALCULATIONS */
float CalculateFalloff(float radius, float falloff, float distLight)
{
    float denom = distLight / radius + 1.0;
    float attenuation = 1.0 / (denom*denom);
    float t = (attenuation - 0.1) / (1.0 - 0.1);

    t = t * (20.0 * (1. - falloff) * 20.0 * (1. - falloff));

    return min(1.0,max(t, 0.0));
}

float Falloff2(vec3 lightDirection, float falloff) {
    float distanceSquared = dot(lightDirection, lightDirection);
    float factor = distanceSquared * falloff;
    float smoothFactor = clamp(1. - factor * factor, 0., 1.);
    float attenuation = smoothFactor * smoothFactor;

    return attenuation * 1. / max(distanceSquared, 0.00001);
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
vec3 CalculateDiffuseColor(vec3 lightDirection, vec3 normal, vec3 lightColor, vec3 materialColor, inout float lambert) {
    lambert = clamp(dot(lightDirection, normal), 0., 1.);
    vec3 diffuseColor = lambert * lightColor * materialColor;
    return diffuseColor;
}


// MAIN
void main()
{
    {{MODULE_BEGIN_FRAG}}

    vec4 col=vec4(0.0);
    vec3 normal = normalize(mat3(normalMatrix)*norm);

    #ifdef DOUBLE_SIDED
        if(!gl_FrontFacing) normal = normal*-1.0;
    #endif

    {{MODULE_NORMAL}}

    vec3 matColor = materialColor.rgb;

    #ifdef HAS_TEXTURES
        #ifdef HAS_TEXTURE_DIFFUSE
            matColor = texture(texDiffuse, texCoord).rgb;
            #ifdef COLORIZE_TEXTURE
                matColor *= materialColor.rgb;
            #endif
        #endif
    #endif

    for(int l=0;l<NUM_LIGHTS;l++) {
        if (lights[l].castLightType.TYPE == AMBIENT) {
            col.rgb += lights[l].lightProperties.INTENSITY * lights[l].color;
        } else {
            if (lights[l].castLightType.CASTLIGHT == 0) continue;

            vec3 lightModelDiff= lights[l].position - modelPos.xyz;
            vec3 lightDirection = normalize(lightModelDiff);

            if (lights[l].castLightType.TYPE == DIRECTIONAL) lightDirection = lights[l].position;

            float lambert = 1.; // inout variable
            vec3 diffuseColor = CalculateDiffuseColor(lightDirection, normal, lights[l].color, matColor, lambert);

            if (lights[l].castLightType.TYPE != DIRECTIONAL) diffuseColor *= Falloff2(lightDirection, lights[l].lightProperties.FALLOFF);

            #ifdef HAS_SPOT
                if (lights[l].castLightType.TYPE == SPOT) diffuseColor *= CalculateSpotLightEffect(
                    lights[l].position, lights[l].conePointAt, lights[l].spotProperties.COSCONEANGLE,
                    lights[l].spotProperties.COSCONEANGLEINNER, lights[l].spotProperties.SPOTEXPONENT,
                    lightDirection
                );
            #endif

            diffuseColor *= lights[l].lightProperties.INTENSITY;
            col.rgb += diffuseColor;
        }
    }


    col.a = materialColor.a;

    {{MODULE_COLOR}}


    outColor = col;
}
