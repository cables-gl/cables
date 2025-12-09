IN vec3 vPosition;
UNI mat4 projMatrix;
// UNI mat4 mvMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
{{MODULES_HEAD}}

void main()
{
    vec4 pos = vec4( vPosition, 1. );
    mat4 mMatrix=modelMatrix;

    #ifdef BILLBOARD
       mat4 mvMatrix=viewMatrix*mMatrix;

        vec3 position=vPosition;
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


    {{MODULE_VERTEX_POSITION}}


   #ifndef BILLBOARD

       mat4 mvMatrix=viewMatrix*mMatrix;
       gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);
   #endif
}