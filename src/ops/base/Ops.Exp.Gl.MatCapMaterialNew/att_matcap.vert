{{MODULES_HEAD}}

precision highp float;
attribute vec3 vPosition;
attribute vec2 attrTexCoord;
attribute vec3 attrVertNormal;

#ifdef HAS_NORMAL_TEXTURE
   attribute vec3 attrTangent;
   attribute vec3 attrBiTangent;

   varying vec3 vBiTangent;
   varying vec3 vTangent;
#endif

varying vec2 texCoord;
varying vec3 norm;
uniform mat4 projMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 normalMatrix;
varying vec2 vNorm;

varying vec3 e;

void main()
{
    texCoord=attrTexCoord;
    norm=attrVertNormal;

    #ifdef HAS_NORMAL_TEXTURE
        vTangent=attrTangent;
        vBiTangent=attrBiTangent;
    #endif

    vec4 pos = vec4( vPosition, 1. );

    mat4 mvMatrix= viewMatrix * modelMatrix;
    {{MODULE_VERTEX_POSITION}}
    e = normalize( vec3( mvMatrix * pos ) );
    vec3 n = normalize( mat3(normalMatrix) * norm );

    vec3 r = reflect( e, n );
    float m = 2. * sqrt( 
        pow(r.x, 2.0)+
        pow(r.y, 2.0)+
        pow(r.z + 1.0, 2.0)
    );
    vNorm = r.xy / m + 0.5;

   #ifdef DO_PROJECT_COORDS_XY
       texCoord=(projMatrix * mvMatrix*pos).xy*0.1;
   #endif

   #ifdef DO_PROJECT_COORDS_YZ
       texCoord=(projMatrix * mvMatrix*pos).yz*0.1;
   #endif

   #ifdef DO_PROJECT_COORDS_XZ
       texCoord=(projMatrix * mvMatrix*pos).xz*0.1;
   #endif

   gl_Position = projMatrix * mvMatrix * pos;

}