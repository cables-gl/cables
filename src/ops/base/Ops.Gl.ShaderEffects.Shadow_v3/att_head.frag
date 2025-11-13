#define CAST_SHADOW y

#define NEAR x
#define FAR y
#define MAP_SIZE z
#define BIAS w

#ifdef WEBGL2
    #define textureCube texture
#endif

float MOD_when_gt(float x, float y) { return max(sign(x - y), 0.0); } // comparator function
float MOD_when_eq(float x, float y) { return 1. - abs(sign(x - y)); } // comparator function
float MOD_when_neq(float x, float y) { return abs(sign(x - y)); } // comparator function

#ifdef MODE_VSM
    float MOD_linstep(float value, float low, float high) {
        return clamp((value - low)/(high-low), 0., 1.);
    }
#endif





#ifdef MODE_DEFAULT
    float MOD_ShadowFactorDefault(float shadowMapSample, float shadowMapDepth, float bias, float shadowStrength) {
        return step(shadowMapDepth - bias, shadowMapSample);
    }
#endif

#ifdef MODE_PCF

    #ifdef WEBGL2
        vec3 MOD_offsets[20] = vec3[]
        (
           vec3( 1,  1,  1), vec3( 1, -1,  1), vec3(-1, -1,  1), vec3(-1,  1,  1),
           vec3( 1,  1, -1), vec3( 1, -1, -1), vec3(-1, -1, -1), vec3(-1,  1, -1),
           vec3( 1,  1,  0), vec3( 1, -1,  0), vec3(-1, -1,  0), vec3(-1,  1,  0),
           vec3( 1,  0,  1), vec3(-1,  0,  1), vec3( 1,  0, -1), vec3(-1,  0, -1),
           vec3( 0,  1,  1), vec3( 0, -1,  1), vec3( 0, -1, -1), vec3( 0,  1, -1)
        );
    #endif
    #ifdef WEBGL1
        vec3 MOD_offsets[20];
        int MOD_CALLED_FILL_PCF_ARRAY = 0;
        void MOD_FillPCFArray() {
            if (MOD_CALLED_FILL_PCF_ARRAY == 1) return;
            MOD_offsets[0] = vec3( 1,  1,  1);
            MOD_offsets[1] = vec3( 1, -1,  1);
            MOD_offsets[2] = vec3(-1, -1,  1);
            MOD_offsets[3] = vec3(-1,  1,  1);
            MOD_offsets[4] = vec3( 1,  1, -1);
            MOD_offsets[5] = vec3( 1, -1, -1);
            MOD_offsets[6] = vec3(-1, -1, -1);
            MOD_offsets[7] = vec3(-1,  1, -1);
            MOD_offsets[8] = vec3( 1,  1,  0);
            MOD_offsets[9] = vec3( 1, -1,  0);
            MOD_offsets[10] = vec3(-1, -1,  0);
            MOD_offsets[11] = vec3(-1,  1,  0);
            MOD_offsets[12] = vec3( 1,  0,  1);
            MOD_offsets[13] = vec3(-1,  0,  1);
            MOD_offsets[14] = vec3( 1,  0, -1);
            MOD_offsets[15] = vec3(-1,  0, -1);
            MOD_offsets[16] = vec3( 0,  1,  1);
            MOD_offsets[17] = vec3( 0, -1,  1);
            MOD_offsets[18] = vec3( 0, -1, -1);
            MOD_offsets[19] = vec3( 0,  1, -1);
            MOD_CALLED_FILL_PCF_ARRAY = 1;
        }
    #endif
    // float diskRadius = 0.05;
    #define RIGHT_BOUND float((SAMPLE_AMOUNT-1.)/2.)
    #define LEFT_BOUND -RIGHT_BOUND
    #define PCF_DIVISOR float(SAMPLE_AMOUNT*SAMPLE_AMOUNT)

    #define SAMPLE_AMOUNT_POINT int(SAMPLE_AMOUNT * 2. + 4.)
    // https://learnopengl.com/Advanced-Lighting/Shadows/Point-Shadows
    float MOD_ShadowFactorPointPCF(
        samplerCube shadowMap,
        vec3 lightDirection,
        float shadowMapDepth,
        float nearPlane,
        float farPlane,
        float bias,
        float shadowStrength,
        vec3 modelPos,
        vec3 camPos,
        float sampleSpread
    ) {
        #ifdef WEBGL1
            MOD_FillPCFArray();
        #endif

        float visibility  = 0.0;
        float viewDistance = length(camPos - modelPos.xyz);
        float diskRadius = (1.0 + ((viewDistance) / (farPlane - nearPlane))) / sampleSpread;

        for (int i = 0; i < SAMPLE_AMOUNT_POINT; i++) {
            float shadowMapSample = textureCube(shadowMap, -lightDirection + MOD_offsets[i] * diskRadius).r;
            visibility += step(shadowMapDepth - bias, shadowMapSample);
        }
        visibility /= float(SAMPLE_AMOUNT_POINT);
        return clamp(visibility, 0., 1.);
    }

    float MOD_ShadowFactorPCF(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapSize, float shadowMapDepth, float bias, float shadowStrength) {
        float texelSize = 1. / shadowMapSize;
        float visibility = 0.;

        // sample neighbouring pixels & get mean value
        for (float x = LEFT_BOUND; x <= RIGHT_BOUND; x += 1.0) {
            for (float y = LEFT_BOUND; y <= RIGHT_BOUND; y += 1.0) {
                float texelDepth = texture(shadowMap, shadowMapLookup + vec2(x, y) * texelSize).r;
                visibility += step(shadowMapDepth - bias, texelDepth);
            }
        }

        return clamp(visibility / PCF_DIVISOR, 0., 1.);
    }
#endif


#ifdef MODE_POISSON
    #ifdef WEBGL2
        vec2 MOD_poissonDisk[16] = vec2[16](
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
    int MOD_CALLED_FILL_POISSON_ARRAY = 0;
    // cannot allocate arrays like above in webgl1
        vec2 MOD_poissonDisk[16];
        void FillPoissonArray() {
            if (MOD_CALLED_FILL_POISSON_ARRAY == 1) return;
            MOD_poissonDisk[0] = vec2( -0.94201624, -0.39906216 );
            MOD_poissonDisk[1] = vec2( 0.94558609, -0.76890725 );
            MOD_poissonDisk[2] = vec2( -0.094184101, -0.92938870 );
            MOD_poissonDisk[3] = vec2( 0.34495938, 0.29387760 );
            MOD_poissonDisk[4] = vec2( -0.91588581, 0.45771432 );
            MOD_poissonDisk[5] = vec2( -0.81544232, -0.87912464 );
            MOD_poissonDisk[6] = vec2( -0.38277543, 0.27676845 );
            MOD_poissonDisk[7] = vec2( 0.97484398, 0.75648379 );
            MOD_poissonDisk[8] = vec2( 0.44323325, -0.97511554 );
            MOD_poissonDisk[9] = vec2( 0.53742981, -0.47373420 );
            MOD_poissonDisk[10] = vec2( -0.26496911, -0.41893023 );
            MOD_poissonDisk[11] = vec2( 0.79197514, 0.19090188 );
            MOD_poissonDisk[12] = vec2( -0.24188840, 0.99706507 );
            MOD_poissonDisk[13] = vec2( -0.81409955, 0.91437590 );
            MOD_poissonDisk[14] = vec2( 0.19984126, 0.78641367 );
            MOD_poissonDisk[15] = vec2( 0.14383161, -0.14100790);
            MOD_CALLED_FILL_POISSON_ARRAY = 1;
        }
    #endif
#define SAMPLE_AMOUNT_INT int(SAMPLE_AMOUNT)
#define INV_SAMPLE_AMOUNT 1./SAMPLE_AMOUNT
    float MOD_ShadowFactorPointPoisson(samplerCube shadowCubeMap, vec3 lightDirection, float shadowMapDepth, float bias, float sampleSpread) {
        float visibility = 1.;

        for (int i = 0; i < SAMPLE_AMOUNT_INT; i++) {
            visibility -= INV_SAMPLE_AMOUNT * step(textureCube(shadowCubeMap, (-lightDirection + MOD_poissonDisk[i].xyx/sampleSpread)).r, shadowMapDepth - bias);
        }

        return clamp(visibility, 0., 1.);
    }

    float MOD_ShadowFactorPoisson(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapDepth, float bias, float sampleSpread) {
        float visibility = 1.;

        for (int i = 0; i < SAMPLE_AMOUNT_INT; i++) {
            visibility -= INV_SAMPLE_AMOUNT * step(texture(shadowMap, (shadowMapLookup + MOD_poissonDisk[i]/sampleSpread)).r, shadowMapDepth - bias);
        }

        return clamp(visibility, 0., 1.);
    }
#endif

#ifdef MODE_VSM
    float MOD_ShadowFactorVSM(vec2 moments, float shadowBias, float shadowMapDepth, float shadowStrength) {

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
            float pMax = MOD_linstep((variance) / (variance + (distanceToMean * distanceToMean)), shadowBias, 1.);
            //float pMax = clamp(variance / (variance + distanceToMean*distanceToMean), 0.2, 1.) - 0.2;
            //pMax = variance / (variance + distanceToMean*distanceToMean);
            // visibility = clamp(pMax, 1., p);
            float visibility = min(max(p, pMax), 1.);

            return visibility;
    }
#endif
