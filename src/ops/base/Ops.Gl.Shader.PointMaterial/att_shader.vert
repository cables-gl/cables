{{MODULES_HEAD}}
IN vec3 vPosition;
IN vec2 attrTexCoord;

OUT vec3 norm;
#ifdef HAS_TEXTURES
    OUT vec2 texCoord;
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


float rand(float n){return fract(sin(n) * 43758.5453123);}

#define POINTMATERIAL

void main()
{
    float psMul=sqrt(canvasWidth/canvasHeight)*0.001+0.00000000001;
    float sizeMultiply=1.0;



    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
    #endif

    mat4 mMatrix=modelMatrix;

    vec4 pos = vec4( vPosition, 1. );

    {{MODULE_VERTEX_POSITION}}

    vec4 model=mMatrix * pos;

    psMul+=rand(attrVertIndex)*randomSize;

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
