
IN vec2 texCoord;
UNI sampler2D depthTex;
UNI sampler2D image;

UNI float r;
UNI float g;
UNI float b;
UNI float a;
UNI float start;
UNI float density;

const float LOG2 = 1.442695;

void main()
{
   vec4 col=vec4(0.0,0.0,0.0,1.0);
   vec4 colImg=texture2D(image,texCoord);

    col=texture2D(depthTex,texCoord);

    float z=1.0-col.r;

    z=smoothstep(start,1.0,z);

    float fogFactor = a*exp2( -density * 
        density *
        z *
        z *
        LOG2);

    #ifdef FOG_IGNORE_INFINITY
        if(z==0.0)
        {
            col=colImg;
        }
        else
    #endif
    {
        col=mix(colImg,vec4(r,g,b,1.0),fogFactor);
    }

   outColor= col;
}