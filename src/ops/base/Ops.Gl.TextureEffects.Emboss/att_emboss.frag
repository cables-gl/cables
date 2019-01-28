#ifdef HAS_TEXTURES
  IN vec2 texCoord;
  UNI sampler2D tex;
  UNI float texSizeX;
  UNI float texSizeY;
#endif

UNI float strength;

void main()
{
    vec4 orig=texture(tex, texCoord);
    vec2 texelSize=vec2(texSizeX,texSizeY);

    float tl = abs(texture(tex, texCoord + texelSize * vec2(-1.0, -1.0)).x); // top left
    float  l = abs(texture(tex, texCoord + texelSize * vec2(-1.0,  0.0)).x); // left
    float bl = abs(texture(tex, texCoord + texelSize * vec2(-1.0,  1.0)).x); // bottom left
    float  t = abs(texture(tex, texCoord + texelSize * vec2( 0.0, -1.0)).x); // top
    float  b = abs(texture(tex, texCoord + texelSize * vec2( 0.0,  1.0)).x); // bottom
    float tr = abs(texture(tex, texCoord + texelSize * vec2( 1.0, -1.0)).x); // top right
    float  r = abs(texture(tex, texCoord + texelSize * vec2( 1.0,  0.0)).x); // right
    float br = abs(texture(tex, texCoord + texelSize * vec2( 1.0,  1.0)).x); // bottom right

    float dX = tr + 2.0*r + br -tl - 2.0*l - bl;
    float dY = bl + 2.0*b + br -tl - 2.0*t - tr;

    vec4 N=vec4(1.0);

    N.rgb=orig.rgb;

    #ifdef CLEAR
        N.rgb=vec3(0.5,0.5,0.5);
    #endif

    N.rgb-=vec3(dY)*strength;
    N.rgb+=vec3(dX)*strength;

   outColor= N;
}