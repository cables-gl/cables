vec3 MOD_pos=texture(MOD_tex,texCoord).xyz;

// #ifdef SET_X
//     pos.x=MOD_pos.x;
// #endif
// #ifdef SET_Y
//     pos.y=MOD_pos.y;
// #endif
// #ifdef SET_Z
//     pos.z=MOD_pos.z;
// #endif

pos.xyz=MOD_pos.xyz;