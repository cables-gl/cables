{{MODULES_HEAD}}
IN vec3 vPosition;
IN vec2 attrTexCoord;

OUT vec3 norm;
#ifdef HAS_TEXTURES
    OUT vec2 texCoord;
#endif

uniform mat4 projMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

void main()
{
    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
   #endif
   
   mat4 mMatrix=modelMatrix;

   vec4 pos = vec4( vPosition, 1. );

   {{MODULE_VERTEX_POSITION}}

    #ifdef BILLBOARD
       vec3 position=vPosition;
       mat4 mvMatrix=viewMatrix*mMatrix;

       gl_Position = projMatrix * mvMatrix * vec4((
           position.x * vec3(
               mvMatrix[0][0],
               mvMatrix[1][0],
               mvMatrix[2][0] ) +
           position.y * vec3(
               mvMatrix[0][1],
               mvMatrix[1][1],
               mvMatrix[2][1]) ), 1.0);
    #endif

    #ifndef BILLBOARD
        gl_Position = projMatrix * viewMatrix * mMatrix * pos;
    #endif
}
