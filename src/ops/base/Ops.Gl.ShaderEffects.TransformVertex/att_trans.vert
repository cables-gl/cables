


pos.xyz*=vec3(MOD_scale);
pos.xyz+=vec3(MOD_translate);

mat4 rmat=
        MOD_rotationX(MOD_rot.x*0.0174533)*
        MOD_rotationY(MOD_rot.y*0.0174533)*
        MOD_rotationZ(MOD_rot.z*0.0174533);

pos*=rmat;