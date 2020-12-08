UNI sampler2D tex;
UNI vec2 inXY;

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

    outColor = vec4(1., 0., 0.,  1.);
    /*
    */

    color.a = 1.;
    // color = vec4(1.);
    outColor = color;
}
