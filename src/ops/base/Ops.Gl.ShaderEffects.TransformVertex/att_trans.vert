


pos.xyz*=vec3(MOD_scale);
pos.xyz+=vec3(MOD_translate);

mat4 rmat=
        MOD_rotationX(MOD_rot.x*0.0174533)*
        MOD_rotationY(MOD_rot.y*0.0174533)*
        MOD_rotationZ(MOD_rot.z*0.0174533);

pos*=rmat;

#ifdef MOD_TRANS_NORMS
    norm=(vec4(norm,1.0)*rmat).xyz;
    bitangent=(vec4(bitangent,1.0)*rmat).xyz;
    tangent=(vec4(tangent,1.0)*rmat).xyz;
#endif