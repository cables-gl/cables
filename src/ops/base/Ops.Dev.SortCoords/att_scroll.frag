precision highp float;
precision highp int;

UNI sampler2D tex;
vec2 texRes=vec2(10.0);
UNI float frame;
int width;
int height;

int xor(int x, int c, int bits) {
    int y = 0, s = 1;
    for (int i = 0; i < bits; i++) {
        y += s * ((x / s) % 2 ^ (c / s) % 2);
        s *= 2;
    }
    return y;
}

int id(vec2 U) {
    return int(U.x) + width * int(U.y);
}

vec2 idToUV(int id) {
    int y = id / width;
    int x = id - y * width;
    highp vec2 uv = vec2(float(x), float(y));
    return uv/texRes.xy;
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
{
    width = int(texRes.x);
    height = int(texRes.y);



    vec2 U = gl_FragCoord.xy;
    int bits = int(ceil(log2(float(width * height)))); // Correct bits calculation

    vec4 col = texture2D(tex, U / texRes.xy);

    int idA = id(U);

    int cX = int(mod(frame * rand(vec2(frame*132.2,frame)*texRes.x), texRes.x));
    int cY = int(mod(frame * rand(vec2(frame,frame*3.2)*texRes.y), texRes.y));

    int c = cX + (width * cY);
    int idB = xor(idA, c, bits);

    int maxID = (width * height) - 1;
    if (idB <= maxID)
    {
        vec4 col2 = texture2D(tex, idToUV(idB));

        if ((col2.b > col.b && idB > idA) || (col2.b < col.b && idB < idA)) col = col2;
    }

    gl_FragColor = col;
}
