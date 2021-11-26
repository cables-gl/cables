
#ifdef INSTANCING

    vec3 MOD_p=vec3(mMatrix[3][0],mMatrix[3][1],mMatrix[3][2]);
    MOD_coord=MOD_p.xy*(1.0/MOD_scale)+MOD_offset-vec2(0.5,0.5);

#endif

