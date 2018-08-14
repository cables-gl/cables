
IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
IN float attrVertIndex;

#ifdef HAS_NORMAL_TEXTURE
   IN vec3 attrTangent;
   IN vec3 attrBiTangent;

   OUT vec3 vBiTangent;
   OUT vec3 vTangent;
#endif

OUT vec2 texCoord;
OUT vec3 norm;
UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

#ifndef INSTANCING
    UNI mat4 normalMatrix;
#endif
OUT vec2 vNorm;

OUT vec3 e;


{{MODULES_HEAD}}

#ifdef CALC_SSNORMALS
    // from https://www.enkisoftware.com/devlogpost-20150131-1-Normal_generation_in_the_pixel_shader
    OUT vec3 eye_relative_pos;
    UNI vec3 camPos;
#endif



void main()
{
    texCoord=attrTexCoord;
    norm=attrVertNormal;
    mat4 mMatrix=modelMatrix;
    mat4 mvMatrix;
    
    #ifdef HAS_NORMAL_TEXTURE
        vTangent=attrTangent;
        vBiTangent=attrBiTangent;
    #endif

    vec4 pos = vec4( vPosition, 1. );

    {{MODULE_VERTEX_POSITION}}


    mvMatrix= viewMatrix * mMatrix;

    #ifdef INSTANCING
        mat4 normalMatrix=inverse(transpose(mvMatrix));
    #endif
    
    e = normalize( vec3( mvMatrix * pos ) );
    vec3 n = normalize( mat3(normalMatrix) * norm );
    

    // mat3 nMatrix = transpose(inverse(mat3(mMatrix)));
    // vec3 n = normalize( mat3(nMatrix) * norm );
    // norm=n;

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

    #ifdef CALC_SSNORMALS
        eye_relative_pos = (mvMatrix * pos ).xyz - camPos;
    #endif



   gl_Position = projMatrix * mvMatrix * pos;

}