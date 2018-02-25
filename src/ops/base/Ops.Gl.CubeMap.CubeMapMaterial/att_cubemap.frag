{{MODULES_HEAD}}
IN vec3 vCoords;
IN vec3 v_normal;
IN vec3 v_eyeCoords;
IN vec3 v_pos;
UNI samplerCube skybox;
UNI mat4 modelMatrix;
UNI mat4 inverseViewMatrix;
UNI mat4 normalMatrix;

void main() {
    {{MODULE_BEGIN_FRAG}}
        
    vec3 N = normalize( mat3(normalMatrix) * v_normal).xyz;
    vec3 V = -v_eyeCoords;
    vec3 R = -reflect(V,N);
    vec3 T = ( mat3( inverseViewMatrix ) * R ).xyz; // Transform by inverse of the view transform that was applied to the skybo
    
    vec4 col = vec4(1.0,1.0,1.0,1.0);
    
    #ifdef DO_REFLECTION
        col = texture(skybox, T);
    #endif
    #ifndef DO_REFLECTION
        
        vec4 modelPos=vec4(normalize( normalize(v_pos)+v_normal.xyz),1.0)*modelMatrix;
        vec4 nn=vec4(v_normal,1.0);
        
        col = texture(skybox, normalize(modelPos.xyz));
    #endif

    {{MODULE_COLOR}}

    outColor=col;

}
