
UNI sampler2D tex;
UNI float amount;
UNI float pass;

IN vec2 texCoord;

UNI float dirX;
UNI float dirY;
UNI float width;
UNI float height;

IN vec2 coord0;
IN vec2 coord1;
IN vec2 coord2;
IN vec2 coord3;
IN vec2 coord4;
IN vec2 coord5;
IN vec2 coord6;

#ifdef HAS_MASK
    UNI sampler2D imageMask;
#endif


void main()
{

    vec4 color = vec4(0.0);


    // color += texture2D(tex, coord0) * 0.006206;
    // color += texture2D(tex, coord1) * 0.066575;
    // color += texture2D(tex, coord2) * 0.30233;
    // color += texture2D(tex, coord3) * 0.382928;
    // color += texture2D(tex, coord4) * 0.30233;
    // color += texture2D(tex, coord5) * 0.066575;
    // color += texture2D(tex, coord6) * 0.006206;

// +++++0.1383328848652136+0.06927096443792478


    color += texture2D(tex, coord0) * 0.06927096443792478;
    color += texture2D(tex, coord1) * 0.1383328848652136;
    color += texture2D(tex, coord2) * 0.21920904690397863;
    color += texture2D(tex, coord3) * 0.14637421;
    color += texture2D(tex, coord4) * 0.21920904690397863;
    color += texture2D(tex, coord5) * 0.1383328848652136;
    color += texture2D(tex, coord6) * 0.06927096443795711;

    // color += texture2D(tex, coord0) * 0.05; //0.095766;
    // color += texture2D(tex, coord1) * 0.1; //0.191243;
    // color += texture2D(tex, coord2) * 0.2; //0.303053;
    // color += texture2D(tex, coord3) * 0.3; //0.20236;
    // color += texture2D(tex, coord4) * 0.2; //0.303053;
    // color += texture2D(tex, coord5) * 0.1; //0.191243;
    // color += texture2D(tex, coord6) * 0.05; //0.095766;

    color.a=1.0;
    
    gl_FragColor = color;
}