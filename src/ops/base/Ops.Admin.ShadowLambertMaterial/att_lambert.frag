{{MODULES_HEAD}}

#define POINT 0
#define DIRECTIONAL 1
#define SPOT 2

IN vec3 norm;
IN vec4 modelPos;

// UNI mat4 normalMatrix;
IN mat3 normalMatrix; // when instancing...
IN vec3 normInterpolated;
IN vec2 texCoord;
// IN vec4 shadowCoord;

IN vec3 mvNormal;
IN vec3 mvTangent;
IN vec3 mvBiTangent;

IN vec4 shadowCoords[NUM_LIGHTS];
IN mat4 testMatrices[NUM_LIGHTS];


UNI vec4 materialColor;//r,g,b,a;

UNI sampler2D shadowMap;
UNI samplerCube shadowCubeMap;
UNI float inShadowStrength;

float when_gt(float x, float y) { return max(sign(x - y), 0.0); } // comparator function
float when_eq(float x, float y) { return 1. - abs(sign(x - y)); } // comparator function
float when_neq(float x, float y) { return abs(sign(x - y)); } // comparator function

#ifdef MODE_POISSON
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
#endif
/*
#ifdef MODE_STRATIFIED
    float Random(vec4 randomVec) {
        float dotProduct = dot(randomVec, vec4(12.9898,78.233,45.164,94.673));
        return fract(sin(dotProduct) * 43758.5453);
    }

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
#endif
*/
/*
    vec3 sampleOffsetDirections[20]=vec3[](
        vec3(1,1,1),vec3(1,-1,1),vec3(-1,-1,1),vec3(-1,1,1),
        vec3(1,1,-1),vec3(1,-1,-1),vec3(-1,-1,-1),vec3(-1,1,-1),
        vec3(1,1,0),vec3(1,-1,0),vec3(-1,-1,0),vec3(-1,1,0),
        vec3(1,0,1),vec3(-1,0,1),vec3(1,0,-1),vec3(-1,0,-1),
        vec3(0,1,1),vec3(0,-1,1),vec3(0,-1,-1),vec3(0,1,-1)
    );
*/
#ifdef MODE_VSM
    float linstep(float value, float low, float high) {
        return clamp((value - low)/(high-low), 0., 1.);
    }
#endif

struct Light {
  vec3 pos;
  vec3 color;
  vec3 conePointAt;
  float cosConeAngle;
  float cosConeAngleInner;
  float spotExponent;
  vec3 ambient;
  vec3 specular;
  float falloff;
  float radius;
  float mul;
  int type;
  vec2 nearFar;
  int castShadow;
  sampler2D shadowMap;
  float shadowMapWidth;
  float shadowBias;
  mat4 lightMatrix;
  // samplerCube cubemap;
};

UNI Light lights[NUM_LIGHTS];
/*
float getfallOff(Light light,float distLight)
{
    float denom = distLight / light.radius + 1.0;
    float attenuation = 1.0 / (denom*denom);
    float t = (attenuation - 0.1) / (1.0 - 0.1);

    t=t* (20.0*light.falloff*20.0*light.falloff);

    return min(1.0,max(t, 0.0));
}
*/


#ifdef SHADOW_MAP
    float CalculateShadow(vec3 lightPos, vec2 nearFar, int type, float lambert, sampler2D shadowMap, vec4 shadowCoord, float shadowMapSize, float shadowBias) {
        float visibility = 1.;

        vec2 shadowMapLookup = shadowCoord.xy;
        vec3 cubemapLookup = modelPos.xyz - lightPos;

        float shadowMapDepth = shadowCoord.z;

        if (type == SPOT) {
            // project coordinates
            shadowMapLookup /= shadowCoord.w;
            shadowMapDepth /= shadowCoord.w;
        }

        float depthFromMapLookup = 0.;

        vec3 toLightNormal = vec3(0.);
        float cameraNear = 0.;
        float cameraFar = 0.;

        if (type == POINT) {

            cameraNear = nearFar.x; // uniforms
            cameraFar = nearFar.y;

            toLightNormal = normalize(lightPos - modelPos.xyz);

            float fromLightToFrag =
                (length(modelPos.xyz - lightPos) - cameraNear) / (cameraFar - cameraNear);
            depthFromMapLookup = texture(shadowCubeMap, -toLightNormal).r;

            shadowMapDepth = fromLightToFrag;

        }

        else depthFromMapLookup = texture(shadowMap, shadowMapLookup).r;

        // modify bias according to slope of the surface
        float bias = clamp(shadowBias * tan(acos(lambert)), 0., 0.1);

        #ifdef MODE_DEFAULT
            if (depthFromMapLookup < shadowMapDepth) visibility = 0.2;
        #endif

        #ifdef MODE_BIAS
            if (depthFromMapLookup < shadowMapDepth - bias) visibility = 0.2;
        #endif

        #ifdef MODE_PCF
            float texelSize = 1. / shadowMapSize;
            visibility = 0.;

            // sample neighbouring pixels & get mean value
            for (int x = -1; x <= 1; x++) {
                for (int y = -1; y <= 1; y++) {
                    float texelDepth = texture(shadowMap, shadowMapLookup + vec2(x, y) * texelSize).r;
                    if (shadowMapDepth - bias < texelDepth) {
                        visibility += 1.;
                    }
                }
            }

            visibility /= 9.;
        #endif

        #ifdef MODE_POISSON
            for (int i = 0; i < SAMPLE_AMOUNT; i++) {
                if (texture(shadowMap, (shadowMapLookup + poissonDisk[i]/700.)).r < shadowMapDepth - bias) {
                    visibility -= 0.2;
                }
            }
        #endif

        #ifdef MODE_STRATIFIED
            for (int i = 0; i < SAMPLE_AMOUNT; i++) {
                int index = int(float(SAMPLE_AMOUNT) * Random(vec4(gl_FragCoord.xyy, i)))%SAMPLE_AMOUNT;
                if (texture(shadowMap, (shadowMapLookup + poissonDisk[index]/700.)).r < shadowMapDepth - bias) {
                    visibility -= 0.2;
                }
            }
        #endif

        #ifdef MODE_VSM
            float distanceTo = shadowMapDepth;
            // retrieve previously stored moments & variance
            vec2 moments = texture(shadowMap, shadowMapLookup).rg;

            if (type == POINT) moments = texture(shadowCubeMap, -toLightNormal).rg;

            float p = step(distanceTo, moments.x);
            float variance =  max(moments.y - (moments.x * moments.x), 0.00001);

            float distanceToMean = distanceTo - moments.x;
            //there is a very small probability that something is being lit when its not
            // little hack: clamp pMax 0.2 - 1. then subtract - 0,2
            // bottom line helps make the shadows darker
            // float pMax = linstep((variance - bias) / (variance - bias + (distanceToMean * distanceToMean)), 0.0001, 1.);
            float pMax = linstep((variance) / (variance + (distanceToMean * distanceToMean)), shadowBias, 1.);
            //float pMax = clamp(variance / (variance + distanceToMean*distanceToMean), 0.2, 1.) - 0.2;
            //pMax = variance / (variance + distanceToMean*distanceToMean);
            // visibility = clamp(pMax, 1., p);
            visibility = min(max(p, pMax), 1.);
        #endif

        return visibility;
    }
#endif

float ShadowFactorPCF(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapSize, float shadowMapDepth, float bias) {
        // #ifdef MODE_PCF
            float texelSize = 1. / shadowMapSize;
            float visibility = 0.;

            // sample neighbouring pixels & get mean value
            for (int x = -1; x <= 1; x++) {
                for (int y = -1; y <= 1; y++) {
                    float texelDepth = texture(shadowMap, shadowMapLookup + vec2(x, y) * texelSize).r;
                    if (shadowMapDepth - bias < texelDepth) {
                        visibility += 1.;
                    }
                }
            }

            return visibility / 9.;
        // #endif
}

#ifdef MODE_POISSON
    float ShadowFactorPoisson(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapDepth, float bias) {
        float visibility = 1.;

        for (int i = 0; i < SAMPLE_AMOUNT; i++) {
            if (texture(shadowMap, (shadowMapLookup + poissonDisk[i]/700.)).r < shadowMapDepth - bias) {
                visibility -= 0.2;
            }
        }

        return visibility;
    }
#endif

#ifdef MODE_VSM
    float ShadowFactorVSM(vec2 moments, float shadowBias, float shadowMapDepth) {
            float distanceTo = shadowMapDepth;
                // retrieve previously stored moments & variance
            float p = step(distanceTo, moments.x);
            float variance =  max(moments.y - (moments.x * moments.x), 0.00001);

            float distanceToMean = distanceTo - moments.x;
            //there is a very small probability that something is being lit when its not
            // little hack: clamp pMax 0.2 - 1. then subtract - 0,2
            // bottom line helps make the shadows darker
            // float pMax = linstep((variance - bias) / (variance - bias + (distanceToMean * distanceToMean)), 0.0001, 1.);
            float pMax = linstep((variance) / (variance + (distanceToMean * distanceToMean)), shadowBias, 1.);
            //float pMax = clamp(variance / (variance + distanceToMean*distanceToMean), 0.2, 1.) - 0.2;
            //pMax = variance / (variance + distanceToMean*distanceToMean);
            // visibility = clamp(pMax, 1., p);
            float visibility = min(max(p, pMax), 1.);

            return visibility;
    }
#endif

float CalculateSpotLightEffect(vec3 lightPosition, vec3 conePointAt, float cosConeAngle, float cosConeAngleInner, float spotExponent, vec3 lightDirection) {
    vec3 spotLightDirection = normalize(lightPosition-conePointAt);
    float spotAngle = dot(-lightDirection, spotLightDirection);
    float epsilon = cosConeAngle - cosConeAngleInner;

    float spotIntensity = clamp((spotAngle - cosConeAngle)/epsilon, 0.0, 1.0);
    spotIntensity = pow(spotIntensity, max(0.01, spotExponent));

    return max(0., spotIntensity);
}

vec3 CalculateDiffuseColor(vec3 lightDirection, vec3 normal, vec3 lightColor, vec3 materialColor, inout float lambert) {
    lambert = clamp(dot(lightDirection, normal), 0., 1.);
    vec3 diffuseColor = lambert * lightColor * materialColor;
    return diffuseColor;
}

void main()
{
    {{MODULE_BEGIN_FRAG}}

    vec4 col=vec4(0.0);
    vec3 calculatedColor = vec3(0.);
    vec3 normal = normalize(normInterpolated);

    #ifdef DOUBLE_SIDED
    if(!gl_FrontFacing) normal = normal*-1.0;
    #endif

    #ifdef SHADOW_MAP
        float visibility = 1.;
    #endif

    for(int l=0;l<NUM_LIGHTS;l++)
    {
        vec3 lightDirection = normalize(lights[l].pos - modelPos.xyz);
        if (lights[l].type == DIRECTIONAL) lightDirection = lights[l].pos;


        float lambert = 1.; // in out
        vec3 diffuseColor = CalculateDiffuseColor(lightDirection, normal, lights[l].color, materialColor.rgb, lambert);

        // if (lights[l].type != 1) newColor*=getfallOff(light, length(lightModelDiff));

        diffuseColor *= lights[l].mul;

        #ifdef SHADOW_MAP

            if (lights[l].castShadow == 1) {
                vec4 testCoord = lights[l].lightMatrix * modelPos;

                vec2 shadowMapLookup = shadowCoords[l].xy;
                float shadowMapDepth = shadowCoords[l].z;

                if (lights[l].type == SPOT) {
                    // project coordinates
                    shadowMapLookup /= shadowCoords[l].w;
                    shadowMapDepth /= shadowCoords[l].w;
                }

                #ifndef MODE_VSM
                    // modify bias according to slope of the surface
                    float bias = clamp(lights[l].shadowBias * tan(acos(lambert)), 0., 0.1);
                #endif

                #ifdef MODE_PCF
                    diffuseColor *= ShadowFactorPCF(lights[l].shadowMap, shadowMapLookup, lights[l].shadowMapWidth, shadowMapDepth, bias);
                #endif

                #ifdef MODE_POISSON
                    diffuseColor *= ShadowFactorPoisson(lights[l].shadowMap, shadowMapLookup, shadowMapDepth, bias);
                #endif
                #ifdef MODE_VSM
                    diffuseColor *= ShadowFactorVSM(texture(lights[l].shadowMap,shadowMapLookup).rg, lights[l].shadowBias, shadowMapDepth);
                #endif
            }

        #endif

        if (lights[l].type == SPOT) {
                float spotIntensity = CalculateSpotLightEffect(
                    lights[l].pos, lights[l].conePointAt, lights[l].cosConeAngle,
                    lights[l].cosConeAngleInner, lights[l].spotExponent, lightDirection
                );
                diffuseColor *= spotIntensity;
        }

         calculatedColor += diffuseColor;
    }

    col.rgb = clamp(calculatedColor, 0., 1.);
    col.a = materialColor.a;

    {{MODULE_COLOR}}

    outColor=col;
}
