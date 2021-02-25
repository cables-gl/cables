
#ifdef INSTANCING

    // vec3 MOD_p=vec3(instMat[3][0],instMat[3][1],instMat[3][2]);
    vec3 MOD_p=vec3(mMatrix[3][0],mMatrix[3][1],mMatrix[3][2]);

    vec2 MOD_coord=MOD_p.xy*(1.0/MOD_scale)+MOD_offset-vec2(0.5,0.5);

    float MOD_dis=texture(MOD_texture,MOD_coord).r;

    #ifdef MOD_COLORIZE
        MOD_dispColor=vec3(MOD_dis);
    #endif

    #ifdef MOD_DEBUG
        MOD_dispColor.rg=mod(MOD_coord,1.0).rg;
    #endif


    #ifdef MOD_NORMALIZE
        MOD_dis=(MOD_dis-0.5)*2.0;
    #endif


    #ifdef MOD_CLAMP
    if(MOD_coord.x>1.0||MOD_coord.x<0.0|| MOD_coord.y>1.0 || MOD_coord.y<0.0)
    {
        MOD_dis=0.0;
        #ifdef MOD_COLORIZE
            MOD_dispColor=vec3(0.0);
        #endif
    }
    #endif

    MOD_dis*=MOD_strength;
    MOD_dis+=MOD_min;

    #ifdef MOD_MODE_TRANS
        #ifdef MOD_AXIS_X
            // pos.x+=MOD_dis;
mMatrix[3][0] += MOD_dis;
        #endif
        #ifdef MOD_AXIS_Y
            // pos.y+=MOD_dis;
mMatrix[3][1] += MOD_dis;
        #endif
        #ifdef MOD_AXIS_Z
            // pos.z+=MOD_dis;
mMatrix[3][2] += MOD_dis;
        #endif
    #endif

    #ifdef MOD_MODE_SCALE

        #ifdef MOD_AXIS_X
            pos.x*=MOD_dis;
        #endif
        #ifdef MOD_AXIS_Y
            pos.y*=MOD_dis;
        #endif
        #ifdef MOD_AXIS_Z
            pos.z*=MOD_dis;
        #endif
    #endif



#endif
