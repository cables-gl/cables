{{MODULES_HEAD}}

IN vec3 norm;
IN vec4 modelPos;

// UNI mat4 normalMatrix;
IN mat3 normalMatrix; // when instancing...

IN vec2 texCoord;
IN vec4 shadowCoord;

IN vec3 mvNormal;
IN vec3 mvTangent;
IN vec3 mvBiTangent;

UNI vec4 color;//r,g,b,a;

UNI sampler2D shadowMap;
UNI samplerCube shadowCubeMap;

UNI float inBias;
UNI float inShadowMapSize;
UNI float inShadowStrength;

#define POINT 0
#define DIRECTIONAL 1
#define SPOT 2

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

    vec3 sampleOffsetDirections[20]=vec3[](
        vec3(1,1,1),vec3(1,-1,1),vec3(-1,-1,1),vec3(-1,1,1),
        vec3(1,1,-1),vec3(1,-1,-1),vec3(-1,-1,-1),vec3(-1,1,-1),
        vec3(1,1,0),vec3(1,-1,0),vec3(-1,-1,0),vec3(-1,1,0),
        vec3(1,0,1),vec3(-1,0,1),vec3(1,0,-1),vec3(-1,0,-1),
        vec3(0,1,1),vec3(0,-1,1),vec3(0,-1,-1),vec3(0,1,-1)
    );

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
};

UNI Light lights[NUM_LIGHTS];

float getfallOff(Light light,float distLight)
{
    float denom = distLight / light.radius + 1.0;
    float attenuation = 1.0 / (denom*denom);
    float t = (attenuation - 0.1) / (1.0 - 0.1);

    t=t* (20.0*light.falloff*20.0*light.falloff);

    return min(1.0,max(t, 0.0));
}

float CalculateSpotLightEffect(Light light, vec3 lightDirection) {
    vec3 spotLightDirection = normalize(light.pos-light.conePointAt);
    float spotAngle = dot(-lightDirection, spotLightDirection);
    float epsilon = light.cosConeAngle - light.cosConeAngleInner;

    float spotIntensity = clamp((spotAngle - light.cosConeAngle)/epsilon, 0.0, 1.0);
    spotIntensity = pow(spotIntensity, max(0.01, light.spotExponent));

    return max(0., spotIntensity);
}

#ifdef SHADOW_MAP
    float CalculateShadow(Light light, float lambert) {
        float visibility = 1.;

            vec2 shadowMapLookup = shadowCoord.xy;
            vec3 cubemapLookup = modelPos.xyz - light.pos;

            float shadowMapDepth = shadowCoord.z;

            if (light.type == SPOT) {
                // project coordinates
                shadowMapLookup /= shadowCoord.w;
                shadowMapDepth /= shadowCoord.w;
            }

            float depthFromMapLookup = 0.;

            vec3 toLightNormal = vec3(0.);
            float cameraNear = 0.;
            float cameraFar = 0.;

            if (light.type == POINT) {

                cameraNear = light.nearFar.x; // uniforms
                cameraFar = light.nearFar.y;

                toLightNormal = normalize(light.pos - modelPos.xyz);

                float fromLightToFrag =
                    (length(modelPos.xyz - light.pos) - cameraNear) / (cameraFar - cameraNear);
                depthFromMapLookup = texture(shadowCubeMap, -toLightNormal).r;

                shadowMapDepth = fromLightToFrag;

            }

            else depthFromMapLookup = texture(shadowMap, shadowMapLookup).r;

            // modify bias according to slope of the surface
            float bias = clamp(inBias * tan(acos(lambert)), 0., 0.1);

            #ifdef MODE_DEFAULT
                if (depthFromMapLookup < shadowMapDepth) visibility = 0.2;
            #endif

            #ifdef MODE_BIAS
                if (depthFromMapLookup < shadowMapDepth - bias) visibility = 0.2;
            #endif

            #ifdef MODE_PCF
                float texelSize = 1. / inShadowMapSize;
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

                if (light.type == POINT) moments = texture(shadowCubeMap, -toLightNormal).rg;

                float p = step(distanceTo, moments.x);
                float variance =  max(moments.y - (moments.x * moments.x), 0.000002);

                float distanceToMean = distanceTo - moments.x;
                //there is a very small probability that something is being lit when its not
                // little hack: clamp pMax 0.2 - 1. then subtract - 0,2
                // bottom line helps make the shadows darker
                // float pMax = linstep((variance - bias) / (variance - bias + (distanceToMean * distanceToMean)), 0.0001, 1.);
                float pMax = linstep((variance) / (variance + (distanceToMean * distanceToMean)), (1. - bias), 1.);
                //float pMax = clamp(variance / (variance + distanceToMean*distanceToMean), 0.2, 1.) - 0.2;
                //pMax = variance / (variance + distanceToMean*distanceToMean);
                // visibility = clamp(pMax, 1., p);
                visibility = min(max(p, pMax), 1.);
            #endif

            return visibility;
    }
#endif

void main()
{
    {{MODULE_BEGIN_FRAG}}

    vec4 col=vec4(0.0);
    vec4 debugCol = vec4(0.);

    vec3 normal = normalize(mat3(normalMatrix)*norm);

    #ifdef DOUBLE_SIDED
    if(!gl_FrontFacing) normal = normal*-1.0;
    #endif

    for(int l=0;l<1;l++)
    {
        Light light=lights[l];

        vec3 lightModelDiff=light.pos - modelPos.xyz;



        if (light.type == DIRECTIONAL) lightModelDiff = light.pos;

        vec3 lightDir = normalize(lightModelDiff);
        float lambert = max(dot(lightDir,normal), 0.);

        vec3 newColor= lambert * light.color.rgb * light.mul;

        // if (light.type != 1) newColor*=getfallOff(light, length(lightModelDiff));

        col.rgb+=vec3(light.ambient);
        col.rgb+= newColor;

        if (light.type == SPOT) {
                float spotIntensity = CalculateSpotLightEffect(light, lightDir);
                col.rgb *= spotIntensity;
        }

        #ifdef SHADOW_MAP
            col.rgb *=  CalculateShadow(light, lambert);
        #endif
    }

    col.rgb*=color.rgb;
    col.a=color.a;

    {{MODULE_COLOR}}

    outColor=col;
}
