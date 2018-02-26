{{MODULES_HEAD}}
IN vec3 vCoords;
IN vec3 v_normal;
IN vec3 v_eyeCoords;
IN vec3 v_pos;
UNI samplerCube skybox;
UNI mat4 modelMatrix;
UNI mat4 inverseViewMatrix;
UNI mat4 normalMatrix;

void main()
{
    {{MODULE_BEGIN_FRAG}}

    vec3 N = normalize( mat3(normalMatrix) * v_normal).xyz;
    
    vec4 col = vec4(1.0,1.0,1.0,1.0);
    
    #ifdef DO_REFLECTION
        vec3 V = -v_eyeCoords;
        vec3 R = -reflect(V,N);
        vec3 T = ( mat3( inverseViewMatrix ) * R ).xyz; // Transform by inverse of the view transform that was applied to the skybo
        col = texture(skybox, T);
    #endif

    #ifndef DO_REFLECTION
        // vec3 V = -v_eyeCoords;
        // vec3 R = V*N;
        
        vec3 no = ( mat3( inverseViewMatrix ) * -N ).xyz;
        col = texture(skybox, normalize(no));
        // col = textureLod(skybox, normalize(no),10.0);
    #endif

    {{MODULE_COLOR}}

    outColor=col;

}
