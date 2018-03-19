{{MODULES_HEAD}}
IN vec3 vCoords;
IN vec3 v_normal;
IN vec3 v_eyeCoords;
IN vec3 v_pos;
UNI samplerCube skybox;
UNI mat4 modelMatrix;
UNI mat4 inverseViewMatrix;
UNI mat4 normalMatrix;
UNI float miplevel;

void main()
{
    {{MODULE_BEGIN_FRAG}}

    vec3 N = normalize( mat3(normalMatrix) * v_normal).xyz;
    
    vec4 col = vec4(1.0,1.0,1.0,1.0);
    
    #ifdef DO_REFLECTION
        vec3 V = -v_eyeCoords;
        vec3 R = -reflect(V,N);
        vec3 T = ( mat3( inverseViewMatrix ) * R ).xyz; // Transform by inverse of the view transform that was applied to the skybo

        if(miplevel>0.0)
            col = textureLod(skybox, T,miplevel*10.0);
        else 
            col = texture(skybox, T);
    #endif

    #ifndef DO_REFLECTION
        // vec3 V = -v_eyeCoords;
        // vec3 R = V*N;
        
        vec3 no = ( mat3( inverseViewMatrix ) * N ).xyz;
        
        if(miplevel>0.0)
            col = textureLod(skybox, normalize(no),miplevel*10.0);
        else 
            col = texture(skybox, normalize(no));
    #endif

    {{MODULE_COLOR}}

    outColor=col;

}
