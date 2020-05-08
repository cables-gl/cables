// http://fabiensanglard.net/shadowmappingVSM/

#define SQRT3 1.73205081
#define SQRT3DIV2 0.86602540378
#define SQRT12DIV9 -0.38490017946

// FOR MOMENT SHADOW MAPPING
/*
const mat4 ENCODE_MATRIX = mat4(
vec4(1.5, 0., SQRT3DIV2, 0.),
vec4(0., 4., 0., 0.5),
vec4(-2., 0., SQRT12DIV9, 0.),
vec4(0., -4., 0., 0.5)
);
*/

void main() {
    {{MODULE_BEGIN_FRAG}}
    vec4 col = vec4(1.);

    {{MODULE_COLOR}}


    float depth =gl_FragCoord.z;
    float dx = dFdx(depth); // for biasing depth-per-pixel
    float dy = dFdy(depth); // for biasing depth-per-pixel

     /*
    dot(x, x) = x*x
    Finally, it is usually beneficial to clamp the partial derivative portion of M 2
    to avoid an excessively high variance if an occluder is almost parallel to the light direction.
    Hardware-generated partial derivatives become somewhat unstable in these cases
    and a correspondingly unstable variance can produce random, flashing pixels of light
    in regions that should be fully shadowed.
    https://developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-8-summed-area-variance-shadow-maps
    */
    float clampedDerivative = clamp(dot(dx, dx) + dot(dy, dy), 0., 1.);
    float moment2 = dot(depth, depth) + 0.25 * clampedDerivative;


    outColor = vec4(
    depth,
    moment2,
    depth,
    moment2);
}