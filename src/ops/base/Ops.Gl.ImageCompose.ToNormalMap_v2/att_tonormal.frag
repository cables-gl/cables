IN vec2 texCoord;
UNI sampler2D tex;
UNI vec2 size;
UNI float strength;
UNI float sizeMul;

void main()
{
    float tl = abs(texture(tex, texCoord + (size*sizeMul) * vec2(-1.0, -1.0)).x);   // top left
    float  l = abs(texture(tex, texCoord + (size*sizeMul) * vec2(-1.0,  0.0)).x);   // left
    float bl = abs(texture(tex, texCoord + (size*sizeMul) * vec2(-1.0,  1.0)).x);   // bottom left
    float  t = abs(texture(tex, texCoord + (size*sizeMul) * vec2( 0.0, -1.0)).x);   // top
    float  b = abs(texture(tex, texCoord + (size*sizeMul) * vec2( 0.0,  1.0)).x);   // bottom
    float tr = abs(texture(tex, texCoord + (size*sizeMul) * vec2( 1.0, -1.0)).x);   // top right
    float  r = abs(texture(tex, texCoord + (size*sizeMul) * vec2( 1.0,  0.0)).x);   // right
    float br = abs(texture(tex, texCoord + (size*sizeMul) * vec2( 1.0,  1.0)).x);   // bottom right

    // Compute dx using Sobel:
    //           -1 0 1
    //           -2 0 2
    //           -1 0 1
    float dX = tr + 2.0*r + br -tl - 2.0*l - bl;

    // Compute dy using Sobel:
    //           -1 -2 -1
    //            0  0  0
    //            1  2  1
    float dY = bl + 2.0*b + br -tl - 2.0*t - tr;

    // Build the normalized normal
    vec4 N = vec4(normalize(vec3(dX,dY, 1.0 / strength)), 1.0);
    N= N * 0.5 + 0.5;
    outColor= N;
}