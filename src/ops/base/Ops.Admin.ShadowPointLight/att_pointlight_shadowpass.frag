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
    // depth = length(modelPos - lightPosition);

    float dx = dFdx(depth); // for biasing depth-per-pixel
    float dy = dFdy(depth); // for biasing depth-per-pixel

    // dot(x, x) = x*x
    float moment2 = dot(depth, depth) + 0.25 * (dot(dx, dx) + dot(dy, dy));

    outColor = vec4(depth, moment2, 0., 1.);
}