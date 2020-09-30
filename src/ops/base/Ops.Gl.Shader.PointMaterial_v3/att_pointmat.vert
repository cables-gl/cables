{{MODULES_HEAD}}
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
IN vec3 attrTangent;
IN vec3 attrBiTangent;

#ifdef VERTEX_COLORS
    IN vec3 attrVertColor;
    OUT vec3 vertexColor;
#endif

OUT vec3 norm;
OUT float ps;
#ifdef HAS_TEXTURES
    OUT vec2 texCoord;
#endif

#ifdef HAS_TEXTURE_COLORIZE
   UNI sampler2D texColorize;
   OUT vec4 colorize;
#endif
#ifdef HAS_TEXTURE_OPACITY
    UNI sampler2D texOpacity;
    OUT float opacity;
#endif

#ifdef HAS_TEXTURE_POINTSIZE
   UNI sampler2D texPointSize;
   UNI float texPointSizeMul;
#endif

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

UNI float pointSize;
UNI vec3 camPos;

UNI float canvasWidth;
UNI float canvasHeight;
UNI float camDistMul;
UNI float randomSize;

IN float attrVertIndex;



float rand(float n){return fract(sin(n) * 5711.5711123);}

#define POINTMATERIAL

void main()
{
    norm=attrVertNormal;
    #ifdef PIXELSIZE
        float psMul=1.0;
    #endif

    #ifndef PIXELSIZE
        float psMul=sqrt(canvasWidth/canvasHeight)+0.00000000001;
    #endif

    // float sizeMultiply=1.0;

    vec3 tangent=attrTangent;
    vec3 bitangent=attrBiTangent;


    #ifdef VERTEX_COLORS
        vertexColor=attrVertColor;
    #endif

    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
    #endif

    #ifdef HAS_TEXTURE_OPACITY
        // opacity=texture(texOpacity,vec2(rand(attrVertIndex+texCoord.x*texCoord.y+texCoord.y+texCoord.x),rand(texCoord.y*texCoord.x-texCoord.x-texCoord.y-attrVertIndex))).r;
        opacity=texture(texOpacity,texCoord).r;
    #endif


    #ifdef HAS_TEXTURE_COLORIZE
        #ifdef RANDOM_COLORIZE
            colorize=texture(texColorize,vec2(rand(attrVertIndex+texCoord.x*texCoord.y+texCoord.y+texCoord.x),rand(texCoord.y*texCoord.x-texCoord.x-texCoord.y-attrVertIndex)));
        #endif
        #ifndef RANDOM_COLORIZE
            colorize=texture(texColorize,texCoord);
        #endif
    #endif

    mat4 mMatrix=modelMatrix;
    vec4 pos = vec4( vPosition, 1. );

    {{MODULE_VERTEX_POSITION}}

    vec4 model=mMatrix * pos;

    psMul+=rand(texCoord.x*texCoord.y+texCoord.y*3.0+texCoord.x*2.0+attrVertIndex)*randomSize;
    // psMul*=sizeMultiply;

    float addPointSize=0.0;
    #ifdef HAS_TEXTURE_POINTSIZE

        #ifdef POINTSIZE_CHAN_R
            addPointSize=texture(texPointSize,texCoord).r;
        #endif
        #ifdef POINTSIZE_CHAN_G
            addPointSize=texture(texPointSize,texCoord).g;
        #endif
        #ifdef POINTSIZE_CHAN_B
            addPointSize=texture(texPointSize,texCoord).b;
        #endif


        #ifdef DOTSIZEREMAPABS
            // addPointSize=(( (texture(texPointSize,texCoord).r) * texPointSizeMul)-0.5)*2.0;

            addPointSize=1.0-(distance(addPointSize,0.5)*2.0);
            // addPointSize=abs(1.0-(distance(addPointSize,0.5)*2.0));
addPointSize=addPointSize*addPointSize*addPointSize*2.0;

            // addPointSize=(( (texture(texPointSize,texCoord).r) * texPointSizeMul)-0.5)*2.0;
        #endif

addPointSize*=texPointSizeMul;


    #endif


    ps=0.0;
    #ifndef SCALE_BY_DISTANCE
        ps = (pointSize+addPointSize) * psMul;
    #endif
    #ifdef SCALE_BY_DISTANCE
        float cameraDist = distance(model.xyz, camPos);
        ps = ( (pointSize+addPointSize) / cameraDist) * psMul;
    #endif

    gl_PointSize = ps;

    gl_Position = projMatrix * viewMatrix * model;
}
