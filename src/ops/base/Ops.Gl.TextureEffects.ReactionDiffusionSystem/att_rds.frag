IN vec2 texCoord;

UNI float screenWidth;
UNI float screenHeight;

UNI sampler2D verttexture;

UNI float f;
UNI float k;
UNI float dt;
UNI float dA;
UNI float dB;
UNI float factor;

vec2 laplace(sampler2D texSource, vec2 texOffset) {
    vec2 tc0 = texCoord + vec2(-texOffset.s, -texOffset.t);
    vec2 tc1 = texCoord + vec2(         0.0, -texOffset.t);
    vec2 tc2 = texCoord + vec2(+texOffset.s, -texOffset.t);
    vec2 tc3 = texCoord + vec2(-texOffset.s,          0.0);
    vec2 tc4 = texCoord + vec2(         0.0,          0.0);
    vec2 tc5 = texCoord + vec2(+texOffset.s,          0.0);
    vec2 tc6 = texCoord + vec2(-texOffset.s, +texOffset.t);
    vec2 tc7 = texCoord + vec2(         0.0, +texOffset.t);
    vec2 tc8 = texCoord + vec2(+texOffset.s, +texOffset.t);

    vec4 col0 = texture2D(texSource, tc0);
    vec4 col1 = texture2D(texSource, tc1);
    vec4 col2 = texture2D(texSource, tc2);
    vec4 col3 = texture2D(texSource, tc3);
    vec4 col4 = texture2D(texSource, tc4);
    vec4 col5 = texture2D(texSource, tc5);
    vec4 col6 = texture2D(texSource, tc6);
    vec4 col7 = texture2D(texSource, tc7);
    vec4 col8 = texture2D(texSource, tc8);

    vec4 lapl = ( .05 * col0 + .2 * col1 + .05 * col2 +
        .2 * col3  - 1.0 * col4 + .2 * col5 +
        .05 * col6 + .2 * col7 + .05 * col8);

    return lapl.rg;
}

void main() {
    vec2 texOff = vec2(1.0/screenWidth, 1.0/screenHeight);


    vec2 uv = texture2D(verttexture, texCoord).rg;


    vec2 lapl = laplace(verttexture, texOff.st);

    float du = dA*lapl.r - uv.r*uv.g*uv.g + f*(1.0 - uv.r);
    float dv = dB*lapl.g + uv.r*uv.g*uv.g - (f+k)*uv.g;

    vec2 dst = uv + dt*vec2(du, dv);


    outColor = vec4(dst.r, dst.g, 0.0, 1.0);
}


