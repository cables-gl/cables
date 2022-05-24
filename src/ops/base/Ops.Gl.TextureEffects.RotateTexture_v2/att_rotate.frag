IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D multiplierTex;
UNI float amount;
UNI float resX;
UNI float resY;
UNI float rotate;

{{CGL.BLENDMODES3}}

#define PI 3.14159265
#define TAU (2.0*PI)

void pR(inout vec2 p, float a)
{
	p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

void main()
{
    float multiplier = 0.0;

    #ifdef ROTATE_TEXTURE
        multiplier = dot(vec3(0.2126,0.7152,0.0722), texture(multiplierTex,texCoord).rgb);
    #endif

    vec2 uv = texCoord;
    vec2 res = vec2(resX,resY);
    uv -= 0.5;
    pR(uv.xy,(rotate + multiplier) * (TAU)  );
    uv += 0.5;



    vec4 col=texture(tex,uv);
    vec4 base=texture(tex,texCoord);

    #ifdef CLEAR
        base.a=0.0;
    #endif


    #ifdef CROP_IMAGE
    if(uv.x>1.0 ||uv.x<0.0  || uv.y>1.0 ||uv.y<0.0 )
    {
        base.a=0.0;
        col.a=0.0;
        // discard;
        // return;
    }
    #endif

    outColor=cgl_blendPixel(base,col,amount);
}