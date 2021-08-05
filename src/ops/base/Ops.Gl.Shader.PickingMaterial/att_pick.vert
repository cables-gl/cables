IN vec3 vPosition;
UNI mat4 projMatrix;
UNI mat4 mvMatrix;

void main()
{
   #ifdef BILLBOARD
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

   #ifndef BILLBOARD
       gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);
   #endif
}