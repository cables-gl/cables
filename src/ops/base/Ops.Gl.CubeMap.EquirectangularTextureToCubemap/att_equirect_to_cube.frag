#define PI 3.14159265358 //97932384626433832795
#define PI_TWO 2. * PI
#define RECIPROCAL_PI 1./PI
#define RECIPROCAL_PI2 RECIPROCAL_PI/2.

UNI sampler2D equirectangularMap;
IN vec3 worldPos;

vec4 sampleEquirect(sampler2D tex, vec3 direction) {
vec2 sampleUV;
vec3 newDirection = normalize(direction);

sampleUV.x = -1. * (atan( newDirection.z, newDirection.x ) * RECIPROCAL_PI2 + 0.75);
    sampleUV.y = asin( clamp(newDirection.y, -1., 1.) ) * RECIPROCAL_PI + 0.5;

    return texture(tex, sampleUV);
}

void main() {
    {{MODULE_BEGIN_FRAG}}
    vec4 col = vec4(1.);

    {{MODULE_COLOR}}

     outColor = vec4(1., 0., 0., 1.);
    vec3 newPos = worldPos;
    outColor = vec4(sampleEquirect(equirectangularMap, newPos));
}

