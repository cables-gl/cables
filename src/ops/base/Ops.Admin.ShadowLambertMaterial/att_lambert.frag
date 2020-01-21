{{MODULES_HEAD}}

#define POINT 0
#define DIRECTIONAL 1
#define SPOT 2

IN vec3 norm;
IN vec4 modelPos;

IN mat3 normalMatrix; // when instancing...
IN vec3 normInterpolated;
IN vec2 texCoord;

IN vec3 mvNormal;
IN vec3 mvTangent;
IN vec3 mvBiTangent;

IN vec4 shadowCoords[NUM_LIGHTS];
IN mat4 testMatrices[NUM_LIGHTS];


UNI vec4 materialColor;//r,g,b,a;

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
};

struct CubeMap { // hack to be able to use cube maps in arrays ? you cannot put 2 samplers in a struct somehow
    samplerCube cubeMap;
};

UNI CubeMap shadowCubeMaps[NUM_LIGHTS];
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

#ifdef MODE_DEFAULT
    float shadowFactorDefault(float shadowMapSample, float shadowMapDepth, float bias) {
        if (shadowMapSample < shadowMapDepth - bias) return 0.2; // todo: make this uniform value from light or from material?
        return 1.;
    }
#endif

#ifdef MODE_PCF
#define RIGHT_BOUND float(SAMPLE_AMOUNT/2.)
#define LEFT_BOUND -RIGHT_BOUND
#define PCF_DIVISOR float(SAMPLE_AMOUNT*4.)

#define RIGHT_BOUND_POINT 0.01
#define LEFT_BOUND_POINT -0.01
#define PCF_INCREMENT_POINT RIGHT_BOUND_POINT/(SAMPLE_AMOUNT * 0.5)
#define PCF_DIVISOR_POINT SAMPLE_AMOUNT*SAMPLE_AMOUNT*SAMPLE_AMOUNT

    // https://learnopengl.com/Advanced-Lighting/Shadows/Point-Shadows
    float ShadowFactorPointPCF(samplerCube shadowMap, vec3 lightDirection, float shadowMapDepth, float nearPlane, float farPlane, float bias) {
        float visibility  = 0.0;

        for(float x = LEFT_BOUND_POINT; x < RIGHT_BOUND_POINT; x += PCF_INCREMENT_POINT)
        {
            for(float y = LEFT_BOUND_POINT; y < RIGHT_BOUND_POINT; y += PCF_INCREMENT_POINT)
            {
                for(float z = LEFT_BOUND_POINT; z < RIGHT_BOUND_POINT; z += PCF_INCREMENT_POINT)
                {
                    float closestDepth = texture(shadowMap, -lightDirection + vec3(x, y, z)).r;
                     closestDepth = closestDepth; // / farPlane*0.1; // * nearPlane; //   * (farPlane+nearPlane);   // Undo mapping [0;1]
                    if(shadowMapDepth - bias < closestDepth)
                        visibility += 1.0;
                }
            }
        }

        visibility /= PCF_DIVISOR_POINT;
        return visibility;

    }

    float ShadowFactorPCF(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapSize, float shadowMapDepth, float bias) {
        float texelSize = 1. / shadowMapSize;
        float visibility = 0.;

        // sample neighbouring pixels & get mean value
        for (float x = LEFT_BOUND; x <= RIGHT_BOUND; x += 1.0) {
            for (float y = LEFT_BOUND; y <= RIGHT_BOUND; y += 1.0) {
                float texelDepth = texture(shadowMap, shadowMapLookup + vec2(x, y) * texelSize).r;
                if (shadowMapDepth - bias < texelDepth) {
                    visibility += 1.;
                }
            }
        }

        return clamp(visibility / PCF_DIVISOR, 0., 1.);
    }
#endif

#ifdef MODE_POISSON
#define SAMPLE_AMOUNT_INT int(SAMPLE_AMOUNT)
    float ShadowFactorPointPoisson(samplerCube shadowCubeMap, vec3 lightDirection, float shadowMapDepth, float bias) {
        float visibility = 1.;

        for (int i = 0; i < SAMPLE_AMOUNT_INT; i++) {
            if (texture(shadowCubeMap, (-lightDirection + poissonDisk[i].xyx/500.)).r < shadowMapDepth - bias) {
                visibility -= 0.2;
            }
        }

        return visibility;
    }

    float ShadowFactorPoisson(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapDepth, float bias) {
        float visibility = 1.;

        for (int i = 0; i < SAMPLE_AMOUNT_INT; i++) {
            if (texture(shadowMap, (shadowMapLookup + poissonDisk[i]/500.)).r < shadowMapDepth - bias) {
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


        float lambert = 1.; // inout variable
        vec3 diffuseColor = CalculateDiffuseColor(lightDirection, normal, lights[l].color, materialColor.rgb, lambert);

        // if (lights[l].type != 1) newColor*=getfallOff(light, length(lightModelDiff));

        diffuseColor *= lights[l].mul;

        #ifdef SHADOW_MAP
            if (lights[l].castShadow == 1) {
                vec4 testCoord = lights[l].lightMatrix * modelPos;


                vec2 shadowMapLookup = shadowCoords[l].xy / shadowCoords[l].w;
                float shadowMapDepth = shadowCoords[l].z  / shadowCoords[l].w;

                vec2 shadowMapSample = vec2(1.);
                float cameraNear, cameraFar;
                if (lights[l].type == POINT) {
                    cameraNear = lights[l].nearFar.x; // uniforms
                    cameraFar =  lights[l].nearFar.y;

                    float fromLightToFrag = (length(modelPos.xyz - lights[l].pos) - cameraNear) / (cameraFar - cameraNear);
                    shadowMapSample = texture(shadowCubeMap, -lightDirection).rg;
                    shadowMapDepth = fromLightToFrag;
                } else {
                    shadowMapSample = texture(lights[l].shadowMap, shadowMapLookup).rg;
                }

                #ifndef MODE_VSM
                    // https://digitalrune.github.io/DigitalRune-Documentation/html/3f4d959e-9c98-4a97-8d85-7a73c26145d7.htm
                    // Depth Bias: The pixel is moved in the direction of the light.
                    // Slope-Scaled Depth Bias: Like the depth bias, but the offset depends on the slope of the surface because shadow acne is bigger on slopes which are nearly parallel to the light.
                    // Normal Offset [1]: The pixels are moved in the direction of the surface normal. The offset can be proportional to the slope.
                    // View Direction Offset [2]: Like the normal offset but instead of moving into the normal direction, the pixel is moved in the view direction. This is cheaper but not as good as the normal offset.
                    // Receiver Plane Depth Bias [3][4]: The receiver plane is calculated to analytically find the ideal bias.

                    // modify bias according to slope of the surface
                    float bias = clamp(lights[l].shadowBias * tan(acos(lambert)), 0., 0.1);

                #endif

                #ifdef MODE_DEFAULT
                    diffuseColor *= shadowFactorDefault(shadowMapSample.r, shadowMapDepth, bias);

                #endif
                #ifdef MODE_PCF
                    if (lights[l].type == POINT) {
                        diffuseColor *= ShadowFactorPointPCF(shadowCubeMap, lightDirection, shadowMapDepth, cameraNear, cameraFar, bias);;
                    }
                    else diffuseColor *= ShadowFactorPCF(lights[l].shadowMap, shadowMapLookup, lights[l].shadowMapWidth, shadowMapDepth, bias);
                #endif

                #ifdef MODE_POISSON
                    if (lights[l].type == POINT) diffuseColor *= ShadowFactorPointPoisson(shadowCubeMap, lightDirection, shadowMapDepth, bias);
                    else diffuseColor *= ShadowFactorPoisson(lights[l].shadowMap, shadowMapLookup, shadowMapDepth, bias);
                #endif
                #ifdef MODE_VSM
                  diffuseColor *= ShadowFactorVSM(shadowMapSample, lights[l].shadowBias, shadowMapDepth);
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
