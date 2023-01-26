vec3 MOD_pos;

#ifndef MOD_WORLDSPACE
   MOD_pos=(vec4(vPosition,1.0)*1.0/MOD_scale).xyz;
#endif
#ifdef MOD_WORLDSPACE
   MOD_pos=(mMatrix*pos).xyz*1.0/MOD_scale;
#endif

MOD_pos=(vec4(MOD_pos,1.0)*MOD_rotationX(MOD_rotX*MOD_DEG2RAD)).xyz;
MOD_pos=(vec4(MOD_pos,1.0)*MOD_rotationY(MOD_rotY*MOD_DEG2RAD)).xyz;
MOD_pos=(vec4(MOD_pos,1.0)*MOD_rotationZ(MOD_rotZ*MOD_DEG2RAD)).xyz;

#ifdef MOD_MAP_XY
    MOD_tc=MOD_pos.xy;
#endif
#ifdef MOD_MAP_XZ
    MOD_tc=MOD_pos.xz;
#endif
#ifdef MOD_MAP_YZ
    MOD_tc=MOD_pos.yz;
#endif

MOD_tc.xy+=vec2(0.5,0.5);
MOD_tc.xy+=MOD_offset;


#ifdef MOD_TARGET_POINTSIZE

    gl_PointSize+=(texture(MOD_tex,MOD_tc).x*MOD_amount);

#endif


#ifdef MOD_MAP_TRIPLANAR
    mapTriplanar((mMatrix*vec4(attrVertNormal,1.0)).xyz,MOD_pos);
#endif

