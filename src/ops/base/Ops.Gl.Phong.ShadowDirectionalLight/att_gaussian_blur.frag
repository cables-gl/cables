UNI sampler2D shadowMap;
IN vec2 texCoord;
IN vec3 norm;

IN vec2 coord0;
IN vec2 coord1;
IN vec2 coord2;
IN vec2 coord3;
IN vec2 coord4;
IN vec2 coord5;
IN vec2 coord6;

void main() {

        vec4 color = vec4(0.0);

// color += texture(tex, texCoord+1.0/1024.0*0.5);

    color += texture(shadowMap, coord0) * 0.06927096443792478;  // 1/64
    color += texture(shadowMap, coord1) * 0.1383328848652136;   // 6/64
    color += texture(shadowMap, coord2) * 0.21920904690397863;  // 15/64
    color += texture(shadowMap, coord3) * 0.14637421;           // 20/64
    color += texture(shadowMap, coord4) * 0.21920904690397863;  // 15/64
    color += texture(shadowMap, coord5) * 0.1383328848652136;   // 6/64
    color += texture(shadowMap, coord6) * 0.06927096443795711;  // 1/64

    color.a = 1.0;
    outColor= color;

//    outColor= vec4(0., 0., 1., 1.);
}