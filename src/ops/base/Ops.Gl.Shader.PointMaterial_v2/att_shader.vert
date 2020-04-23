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
#ifdef HAS_TEXTURES
    OUT vec2 texCoord;
#endif
#ifdef HAS_TEXTURE_COLORIZE
   UNI sampler2D texColorize;
   out vec4 colorize;
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
    float psMul=sqrt(canvasWidth/canvasHeight)+0.00000000001;
    float sizeMultiply=1.0;

    vec3 tangent=attrTangent;
    vec3 bitangent=attrBiTangent;


    #ifdef VERTEX_COLORS
        vertexColor=attrVertColor;
    #endif

    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
    #endif

    #ifdef HAS_TEXTURE_COLORIZE
        #ifdef RANDOM_COLORIZE
            colorize=texture(texColorize,vec2(rand(texCoord.x*texCoord.y),rand(texCoord.y+texCoord.x)));
        #endif
        #ifndef RANDOM_COLORIZE
            colorize=texture(texColorize,texCoord);
        #endif
    #endif

    mat4 mMatrix=modelMatrix;
    vec4 pos = vec4( vPosition, 1. );

    {{MODULE_VERTEX_POSITION}}

    vec4 model=mMatrix * pos;

    psMul+=rand(texCoord.x*texCoord.y)*randomSize;
    psMul*=sizeMultiply;

    #ifndef SCALE_BY_DISTANCE
        gl_PointSize = pointSize * psMul;
    #endif
    #ifdef SCALE_BY_DISTANCE
        float cameraDist = distance(model.xyz, camPos);
        gl_PointSize = (pointSize / cameraDist) * psMul;
    #endif

    gl_Position = projMatrix * viewMatrix * model;
}
