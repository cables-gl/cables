export function getShadowPassVertexShader()
{
    return `
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
IN float attrVertIndex;
IN vec3 attrTangent;
IN vec3 attrBiTangent;

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;


OUT vec2 texCoord;
OUT vec3 norm;

{{MODULES_HEAD}}

${this.type === "point" ? "OUT vec3 modelPos;" : ""}
void main() {
    texCoord=attrTexCoord;
    texCoord.y = 1. - texCoord.y;
    norm=attrVertNormal;
    vec4 pos = vec4(vPosition, 1.0);
    mat4 mMatrix=modelMatrix;
    vec3 tangent = attrTangent;
    vec3 bitangent = attrBiTangent;

    {{MODULE_VERTEX_POSITION}}

    mat4 mvMatrix=viewMatrix * mMatrix;
    vec4 vPos = projMatrix * mvMatrix * pos;
    ${this.type === "point" ? "modelPos = (mMatrix * pos).xyz;" : ""}
    gl_Position = vPos;
}
`;
}

export function getShadowPassFragmentShader()
{
    /*
    // http://fabiensanglard.net/shadowmappingVSM/
    #define SQRT3 1.73205081
    #define SQRT3DIV2 0.86602540378
    #define SQRT12DIV9 -0.38490017946

    // FOR MOMENT SHADOW MAPPING
    const mat4 ENCODE_MATRIX = mat4(
    vec4(1.5, 0., SQRT3DIV2, 0.),
    vec4(0., 4., 0., 0.5),
    vec4(-2., 0., SQRT12DIV9, 0.),
    vec4(0., -4., 0., 0.5)
    );
    */
    /*
   dot(x, x) = x*x
   Finally, it is usually beneficial to clamp the partial derivative portion of M 2
   to avoid an excessively high variance if an occluder is almost parallel to the light direction.
   Hardware-generated partial derivatives become somewhat unstable in these cases
   and a correspondingly unstable variance can produce random, flashing pixels of light
   in regions that should be fully shadowed.
   https://developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-8-summed-area-variance-shadow-maps
   */
    return `
   {{MODULES_HEAD}}
   ${this.type === "point" ? "IN vec3 modelPos;" : ""}
   ${this.type === "point" ? "UNI vec3 inLightPosition;" : ""}
   ${this.type === "point" ? "UNI vec2 inNearFar;" : ""}

    IN vec2 texCoord;

    void main() {
        {{MODULE_BEGIN_FRAG}}
        vec4 col = vec4(1.);


        outColor = vec4(1.);

        {{MODULE_COLOR}}

        ${this.type === "point" ? "vec3 fromLightToFrag = (modelPos - inLightPosition);" : ""}


        ${this.type === "point" ? "float depth = (length(fromLightToFrag) - inNearFar.x) / (inNearFar.y - inNearFar.x);" : "float depth = gl_FragCoord.z;"}

        float dx = dFdx(depth); // for biasing depth-per-pixel
        float dy = dFdy(depth); // for biasing depth-per-pixel

        float clampedDerivative = clamp(dot(dx, dx) + dot(dy, dy), 0., 1.);
        float moment2 = dot(depth, depth) + 0.25 * clampedDerivative;

        outColor.x = depth;
        outColor.y = moment2;
        outColor.z = depth;
    }
`;
}

export function getBlurPassVertexShader()
{
    if (this.type === "point") return "";
    return `

IN vec3 vPosition;
IN vec2 attrTexCoord;

OUT vec2 texCoord;
OUT vec2 coord0;
OUT vec2 coord1;
OUT vec2 coord2;
OUT vec2 coord3;
OUT vec2 coord4;
OUT vec2 coord5;
OUT vec2 coord6;

UNI mat4 projMatrix;
UNI mat4 mvMatrix;
UNI mat4 modelMatrix;

UNI vec2 inXY;

void main() {
    texCoord=attrTexCoord;

    vec4 pos = vec4(vPosition,  1.0);

    {{MODULE_VERTEX_POSITION}}

    coord3 = attrTexCoord;


    coord0 = attrTexCoord + (-3.0368997744118595 * inXY);
    coord0 = clamp(coord0, 0., 1.);
    coord1 = attrTexCoord + (-2.089778445362373 * inXY);
    coord1 = clamp(coord1, 0., 1.);
    coord2 = attrTexCoord + (-1.2004366090034069 * inXY);
    coord2 = clamp(coord2, 0., 1.);
    coord4 = attrTexCoord + (1.2004366090034069 * inXY);
    coord4 = clamp(coord4, 0., 1.);
    coord5 = attrTexCoord + (2.089778445362373* inXY);
    coord5 = clamp(coord5, 0., 1.);
    coord6 = attrTexCoord + (3.0368997744118595 * inXY);
    coord6 = clamp(coord6, 0., 1.);

    gl_Position = projMatrix * mvMatrix * pos;
}
    `;
}

export function getBlurPassFragmentShader()
{
    if (this.type === "point") return "";

    return `
UNI sampler2D tex;

IN vec2 coord0;
IN vec2 coord1;
IN vec2 coord2;
IN vec2 coord3;
IN vec2 coord4;
IN vec2 coord5;
IN vec2 coord6;

void main() {

    vec4 color = vec4(0.0);


    color.xyz += texture(tex, coord0).xyz * 0.06927096443792478;  // 1/64
    color.xyz += texture(tex, coord1).xyz * 0.1383328848652136;   // 6/64
    color.xyz += texture(tex, coord2).xyz * 0.21920904690397863;  // 15/64
    color.xyz += texture(tex, coord3).xyz * 0.14637421;           // 20/64
    color.xyz += texture(tex, coord4).xyz * 0.21920904690397863;  // 15/64
    color.xyz += texture(tex, coord5).xyz * 0.1383328848652136;   // 6/64
    color.xyz += texture(tex, coord6).xyz * 0.06927096443795711;  // 1/64

    color.a = 1.;

    outColor = color;
}
    `;
}
