precision highp float;
precision highp int;

IN vec2 texCoord;
UNI sampler2D tex;
UNI float widthF;
UNI float heightF;
UNI float frame;

int width;
int height;
vec2 texRes;

int xor(int x, int c)
{
    int y = 0, s = 1;
    for (int i = 0; i < 8; i++) {
        y += s * ((x / s) % 2 ^ (c / s) % 2);
        s *= 2;
    }
    return y;
}

int id(vec2 U)
{
    return int(U.x) + width * int(U.y);
}

vec2 idToUV(int id)
{
    int y = id / width;
    int x = id - y * width;
    vec2 uv = vec2(float(x), float(y));
    return uv/texRes;
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
{
    texRes=vec2(widthF,widthF);
    width = int(widthF);
    height = int(heightF);

    vec2 U = floor(texCoord*texRes)+(0.5); // gl_FragCoord.xy;

    vec4 col = texture2D(tex, U / texRes.xy);

    int idA = id(U);

    int cX = int(mod(frame * rand(vec2(frame*13.2,frame/2.0)*widthF), widthF));
    int cY = int(mod(frame * rand(vec2(frame/3.0,frame*3.2)*heightF), heightF));

    int c = cX + (width * cY);
    int idB = xor(idA, c);

    int maxID = (width * height) - 1;
    if (idB <= maxID)
    {
        vec4 col2 = texture2D(tex, idToUV(idB));

        if ((col2.b > col.b && idB > idA) || (col2.b < col.b && idB < idA)) col = col2;
    }



    // col.rg=U.xy;
    // col=vec4(1.0);

    gl_FragColor = col;
}
