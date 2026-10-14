{{MODULES_HEAD}}

UNI sampler2D tex;
UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
UNI float scale;
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN mat4 instMat;
IN vec2 attrTexOffsets;
IN vec2 attrTexSize;
IN vec2 attrTexPos;
IN float attrVertIndex;
IN float instanceIndex;
flat OUT float frag_instIndex;

OUT vec2 texPos;

OUT vec2 texCoord;
OUT vec4 modelPos;

void main()
{

    texCoord=(attrTexCoord*(attrTexSize)) + attrTexOffsets;
    mat4 instMVMat=instMat;
    instMVMat[3][0]*=scale;

    texPos=attrTexPos;

    vec4 pos=vec4( vPosition.x*(attrTexSize.x/attrTexSize.y)*scale,vPosition.y*scale,vPosition.z*scale, 1. );

    mat4 mvMatrix=viewMatrix * modelMatrix * instMVMat;
    frag_instIndex=instanceIndex;

    {{MODULE_VERTEX_POSITION}}

    gl_Position = projMatrix * mvMatrix * pos;
}

