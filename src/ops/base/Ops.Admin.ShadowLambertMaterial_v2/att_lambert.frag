{{MODULES_HEAD}}

#define POINT 0
#define DIRECTIONAL 1
#define SPOT 2

IN vec4 modelPos;

IN mat3 normalMatrix; // when instancing...
IN vec3 normInterpolated;
IN vec2 texCoord;

IN vec3 mvNormal;
IN vec3 mvTangent;
IN vec3 mvBiTangent;

UNI vec4 materialColor;//r,g,b,a;
UNI float poissonSpread;

float when_gt(float x, float y) { return max(sign(x - y), 0.0); } // comparator function
float when_eq(float x, float y) { return 1. - abs(sign(x - y)); } // comparator function
float when_neq(float x, float y) { return abs(sign(x - y)); } // comparator function

#ifdef MODE_VSM
    float linstep(float value, float low, float high) {
        return clamp((value - low)/(high-low), 0., 1.);
    }
#endif

#ifdef WEBGL2
    #define textureCube texture
#endif

struct Light {
    vec3 position;
    vec3 color;
    // * SPOT LIGHT * //
    vec3 conePointAt;
    #define COSCONEANGLE x
    #define COSCONEANGLEINNER y
    #define SPOTEXPONENT z
    vec3 spotProperties;

    #define INTENSITY x
    #define ATTENUATION y
    #define FALLOFF z
    #define RADIUS w
    vec4 lightProperties;

    #define TYPE x
    #define CAST_SHADOW y
    ivec2 typeCastShadow;

    #define NEAR x
    #define FAR y
    #define MAP_SIZE z
    #define BIAS w
    vec4 shadowProperties;
    float shadowStrength;

};

//{SHADOW_FRAGMENT_HEAD}


float CalculateFalloff(float radius, float falloff, float distLight)
{
    float denom = distLight / radius + 1.0;
    float attenuation = 1.0 / (denom*denom);
    float t = (attenuation - 0.1) / (1.0 - 0.1);

    t = t * (20.0 * (1. - falloff) * 20.0 * (1. - falloff));

    return min(1.0,max(t, 0.0));
}

#ifdef MODE_DEFAULT
    float ShadowFactorDefault(float shadowMapSample, float shadowMapDepth, float bias, float shadowStrength) {
        if (shadowMapSample < shadowMapDepth - bias) return (1. - shadowStrength);
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
    float ShadowFactorPointPCF(samplerCube shadowMap, vec3 lightDirection, float shadowMapDepth, float nearPlane, float farPlane, float bias, float shadowStrength) {
        float visibility  = 0.0;

        // EARLY EXIT ... cant figure it out
        if (shadowMapDepth - bias < textureCube(shadowMap, -lightDirection).r) {
            return 1.;
        }

        for(float x = LEFT_BOUND_POINT; x < RIGHT_BOUND_POINT; x += PCF_INCREMENT_POINT)
        {
            for(float y = LEFT_BOUND_POINT; y < RIGHT_BOUND_POINT; y += PCF_INCREMENT_POINT)
            {
                for(float z = LEFT_BOUND_POINT; z < RIGHT_BOUND_POINT; z += PCF_INCREMENT_POINT)
                {
                    float closestDepth = textureCube(shadowMap, -lightDirection + vec3(x, y, z)).r;


                    //if (closestDepth == 0.) return 1.; // early exit?
                     // closestDepth = closestDepth; // / farPlane*0.1; // * nearPlane; //   * (farPlane+nearPlane);   // Undo mapping [0;1]
                    if(shadowMapDepth - bias < closestDepth)
                        visibility += 1.0;
                }
            }
        }

        visibility /= PCF_DIVISOR_POINT;
        return visibility;

    }

    float ShadowFactorPCF(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapSize, float shadowMapDepth, float bias, float shadowStrength) {
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
    #ifdef WEBGL2
        vec2 poissonDisk[16] = vec2[16](
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
    #ifdef WEBGL1
    int CALLED_FILL_POISSON_ARRAY = 0;
    // cannot allocate arrays like above in webgl1
        vec2 poissonDisk[16];
        void FillPoissonArray() {
            if (CALLED_FILL_POISSON_ARRAY == 1) return;
            poissonDisk[0] = vec2( -0.94201624, -0.39906216 );
            poissonDisk[1] = vec2( 0.94558609, -0.76890725 );
            poissonDisk[2] = vec2( -0.094184101, -0.92938870 );
            poissonDisk[3] = vec2( 0.34495938, 0.29387760 );
            poissonDisk[4] = vec2( -0.91588581, 0.45771432 );
            poissonDisk[5] = vec2( -0.81544232, -0.87912464 );
            poissonDisk[6] = vec2( -0.38277543, 0.27676845 );
            poissonDisk[7] = vec2( 0.97484398, 0.75648379 );
            poissonDisk[8] = vec2( 0.44323325, -0.97511554 );
            poissonDisk[9] = vec2( 0.53742981, -0.47373420 );
            poissonDisk[10] = vec2( -0.26496911, -0.41893023 );
            poissonDisk[11] = vec2( 0.79197514, 0.19090188 );
            poissonDisk[12] = vec2( -0.24188840, 0.99706507 );
            poissonDisk[13] = vec2( -0.81409955, 0.91437590 );
            poissonDisk[14] = vec2( 0.19984126, 0.78641367 );
            poissonDisk[15] = vec2( 0.14383161, -0.14100790);
            CALLED_FILL_POISSON_ARRAY = 1;
        }
    #endif
#define SAMPLE_AMOUNT_INT int(SAMPLE_AMOUNT)
    float ShadowFactorPointPoisson(samplerCube shadowCubeMap, vec3 lightDirection, float shadowMapDepth, float bias) {
        float visibility = 1.;

        for (int i = 0; i < SAMPLE_AMOUNT_INT; i++) {
            if (textureCube(shadowCubeMap, (-lightDirection + poissonDisk[i].xyx/poissonSpread)).r < shadowMapDepth - bias) {
                visibility -= 0.2;
            }
        }

        return visibility;
    }

    float ShadowFactorPoisson(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapDepth, float bias) {
        float visibility = 1.;

        for (int i = 0; i < SAMPLE_AMOUNT_INT; i++) {
            if (texture(shadowMap, (shadowMapLookup + poissonDisk[i]/poissonSpread)).r < shadowMapDepth - bias) {
                visibility -= 0.2;
            }
        }

        return visibility;
    }
#endif

#ifdef MODE_VSM
    float ShadowFactorVSM(vec2 moments, float shadowBias, float shadowMapDepth, float shadowStrength) {

            float depthScale = shadowBias * 0.01 * shadowMapDepth; // - shadowBias;
            float minVariance = depthScale*depthScale; // = 0.00001

            float distanceTo = shadowMapDepth; //shadowMapDepth; // - shadowBias;

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
        float shadowFactor = 1.;
    #endif

    //{SHADOW_FRAGMENT_BODY}


    col.rgb = clamp(calculatedColor, 0., 1.);
    col.a = materialColor.a;

    {{MODULE_COLOR}}

    outColor=col;
}
