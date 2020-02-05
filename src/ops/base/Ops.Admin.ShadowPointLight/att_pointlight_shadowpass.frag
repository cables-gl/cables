// http://fabiensanglard.net/shadowmappingVSM/
IN vec4 vPos;
IN vec3 modelPos;
UNI vec3 lightPosition;
UNI vec2 inNearFar;

void main() {
    {{MODULE_BEGIN_FRAG}}
    vec4 col = vec4(1.);


    {{MODULE_COLOR}}

    vec3 fromLightToFrag = (modelPos - lightPosition);

    float depth = gl_FragCoord.z;
    depth = (length(fromLightToFrag) - inNearFar.x) / (inNearFar.y - inNearFar.x);

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

    outColor = vec4(depth, moment2, 0., 1.);
}