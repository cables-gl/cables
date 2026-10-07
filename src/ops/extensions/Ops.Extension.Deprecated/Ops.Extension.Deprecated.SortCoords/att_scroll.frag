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

// int xor(int x, int c)
// {
//     float y = 0.0;
//     float s = 1.0;
//     for (float i = 0.0; i < widthF; i++) {
//         y += float(int(s) * ((x / int(s)) % 2 ^ (c / int(s)) % 2));
//         s *= 2.0;
//     }
//     return int(y);
// }

int xor(int x, int c) {
    float y=0., s=1.;

    for (int i=0; i<20; i++)
       y += s* mod ( floor(float(x)/s)+floor(float(c)/s), 2. ), s*=2. ;

    return int(y);
}

int id(vec2 U)
{
    return int(U.x) + width * int(U.y);
}

vec2 idToUV(int id)
{
    int y = int((float(id) / widthF));
    int x = id - y * width;
    vec2 uv = vec2(float(x), float(y));
    return uv/texRes;
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
{
    texRes=vec2(widthF,heightF);
    width = int(widthF);
    height = int(heightF);

    vec2 U = floor(texCoord*texRes); // gl_FragCoord.xy;

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


    gl_FragColor = col;
}
