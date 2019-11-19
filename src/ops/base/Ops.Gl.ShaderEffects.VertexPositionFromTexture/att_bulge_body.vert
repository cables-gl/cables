vec4 col=texture(MOD_tex,texCoord);



vec3 MOD_pos=col.xyz;

// #ifdef SET_X
//     pos.x=MOD_pos.x;
// #endif
// #ifdef SET_Y
//     pos.y=MOD_pos.y;
// #endif
// #ifdef SET_Z
//     pos.z=MOD_pos.z;
// #endif
// psMul = col.a*=0.1;




pos.xyz=MOD_pos.xyz;
// mMatrix[3].xyz+=MOD_pos.xyz;
