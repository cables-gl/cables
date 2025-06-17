float when_gt_MOD(float x, float y) { return max(sign(x - y), 0.0); } // comparator function
float when_eq_MOD(float x, float y) { return 1. - abs(sign(x - y)); } // comparator function
float when_neq_MOD(float x, float y) { return abs(sign(x - y)); } // comparator function

#ifdef MODE_VSM
    float linstep(float value, float low, float high) {
        return clamp((value - low)/(high-low), 0., 1.);
    }
#endif

#ifdef WEBGL2
    #define textureCube texture
#endif

UNI vec3 camPos;

struct ModLight {
/*
    vec3 color;*/
    // * SPOT LIGHT * //
    /*vec3 conePointAt;
    #define COSCONEANGLE x
    #define COSCONEANGLEINNER y
    #define SPOTEXPONENT z
    vec3 spotProperties;*/

    /*#define INTENSITY x
    #define ATTENUATION y
    #define FALLOFF z
    #define RADIUS w
    vec4 lightProperties;
    */

    vec3 position;
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

UNI float sampleSpread;

#ifdef MODE_DEFAULT
    float ShadowFactorDefault(float shadowMapSample, float shadowMapDepth, float bias, float shadowStrength) {
        return shadowMapSample < shadowMapDepth - bias ? (1. - shadowStrength) : 1.; //step(shadowMapDepth - bias, shadowMapSample);
    }
#endif

#ifdef MODE_PCF

    #ifdef WEBGL2
        vec3 offsets[20] = vec3[]
        (
           vec3( 1,  1,  1), vec3( 1, -1,  1), vec3(-1, -1,  1), vec3(-1,  1,  1),
           vec3( 1,  1, -1), vec3( 1, -1, -1), vec3(-1, -1, -1), vec3(-1,  1, -1),
           vec3( 1,  1,  0), vec3( 1, -1,  0), vec3(-1, -1,  0), vec3(-1,  1,  0),
           vec3( 1,  0,  1), vec3(-1,  0,  1), vec3( 1,  0, -1), vec3(-1,  0, -1),
           vec3( 0,  1,  1), vec3( 0, -1,  1), vec3( 0, -1, -1), vec3( 0,  1, -1)
        );
    #endif
    #ifdef WEBGL1
        vec3 offsets[20];
        int CALLED_FILL_PCF_ARRAY = 0;
        void FillPCFArray() {
            if (CALLED_FILL_PCF_ARRAY == 1) return;
            offsets[0] = vec3( 1,  1,  1);
            offsets[1] = vec3( 1, -1,  1);
            offsets[2] = vec3(-1, -1,  1);
            offsets[3] = vec3(-1,  1,  1);
            offsets[4] = vec3( 1,  1, -1);
            offsets[5] = vec3( 1, -1, -1);
            offsets[6] = vec3(-1, -1, -1);
            offsets[7] = vec3(-1,  1, -1);
            offsets[8] = vec3( 1,  1,  0);
            offsets[9] = vec3( 1, -1,  0);
            offsets[10] = vec3(-1, -1,  0);
            offsets[11] = vec3(-1,  1,  0);
            offsets[12] = vec3( 1,  0,  1);
            offsets[13] = vec3(-1,  0,  1);
            offsets[14] = vec3( 1,  0, -1);
            offsets[15] = vec3(-1,  0, -1);
            offsets[16] = vec3( 0,  1,  1);
            offsets[17] = vec3( 0, -1,  1);
            offsets[18] = vec3( 0, -1, -1);
            offsets[19] = vec3( 0,  1, -1);
            CALLED_FILL_PCF_ARRAY = 1;
        }
    #endif
    // float diskRadius = 0.05;
    #define RIGHT_BOUND float((SAMPLE_AMOUNT-1.)/2.)
    #define LEFT_BOUND -RIGHT_BOUND
    #define PCF_DIVISOR float(SAMPLE_AMOUNT*SAMPLE_AMOUNT)

    #define SAMPLE_AMOUNT_POINT int(SAMPLE_AMOUNT * 2. + 4.)
    // https://learnopengl.com/Advanced-Lighting/Shadows/Point-Shadows
    float ShadowFactorPointPCF(
        samplerCube shadowMap,
        vec3 lightDirection,
        float shadowMapDepth,
        float nearPlane,
        float farPlane,
        float bias,
        float shadowStrength,
        vec3 modelPos
    ) {
        #ifdef WEBGL1
            FillPCFArray();
        #endif

        float visibility  = 0.0;
        float viewDistance = length(camPos - modelPos.xyz);
        float diskRadius = (1.0 + ((viewDistance) / (farPlane - nearPlane))) / sampleSpread;

        for (int i = 0; i < SAMPLE_AMOUNT_POINT; i++) {
            float shadowMapSample = textureCube(shadowMap, -lightDirection + offsets[i] * diskRadius).r;
            visibility += step(shadowMapDepth - bias, shadowMapSample);
        }
        visibility /= float(SAMPLE_AMOUNT_POINT);
        return clamp(visibility, 0., 1.);
    }

    float LinearShadowMapSample(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapDepth, float texelSize) {
        vec2 pixelPos = shadowMapLookup/texelSize + vec2(0.5); // tl pixel corner to middle
        vec2 fractPixelPos = fract(pixelPos);
        vec2 startTexel = (pixelPos - fractPixelPos) * texelSize;

        float bottomLeftTexel = step(shadowMapDepth, texture(shadowMap, startTexel).r);
        float bottomRightTexel = step(shadowMapDepth, texture(shadowMap, startTexel + vec2(texelSize, 0.)).r);
        float topLeftTexel = step(shadowMapDepth, texture(shadowMap, startTexel + vec2(0., texelSize)).r);
        float topRightTexel = step(shadowMapDepth, texture(shadowMap, startTexel + vec2(texelSize, texelSize)).r);

        float mixA = mix(bottomLeftTexel, topLeftTexel, fractPixelPos.y);
        float mixB = mix(bottomRightTexel, topRightTexel, fractPixelPos.y);

        return mix(mixA, mixB, fractPixelPos.x);

    }
    float ShadowFactorPCF(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapSize, float shadowMapDepth, float bias, float shadowStrength) {
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
#define INV_SAMPLE_AMOUNT 1./SAMPLE_AMOUNT
    float ShadowFactorPointPoisson(samplerCube shadowCubeMap, vec3 lightDirection, float shadowMapDepth, float bias) {
        float visibility = 1.;

        for (int i = 0; i < SAMPLE_AMOUNT_INT; i++) {
            visibility -= INV_SAMPLE_AMOUNT * step(textureCube(shadowCubeMap, (-lightDirection + poissonDisk[i].xyx/sampleSpread)).r, shadowMapDepth - bias);
        }

        return clamp(visibility, 0., 1.);
    }

    float ShadowFactorPoisson(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapDepth, float bias) {
        float visibility = 1.;

        for (int i = 0; i < SAMPLE_AMOUNT_INT; i++) {
            visibility -= INV_SAMPLE_AMOUNT * step(texture(shadowMap, (shadowMapLookup + poissonDisk[i]/sampleSpread)).r, shadowMapDepth - bias);
        }

        return clamp(visibility, 0., 1.);
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
