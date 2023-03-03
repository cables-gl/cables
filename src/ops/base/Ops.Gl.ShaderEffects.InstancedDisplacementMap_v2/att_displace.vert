
#ifdef INSTANCING

    #ifdef MOD_SRC_INSTMAT
        vec3 MOD_p=vec3(instMat[3][0],instMat[3][1],instMat[3][2]);
    #endif

    #ifdef MOD_SRC_MMAT
        vec3 MOD_p=vec3(mMatrix[3][0],mMatrix[3][1],mMatrix[3][2]);
    #endif
    // vec3 MOD_p=(mMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;//vec3(mMatrix[3][0],mMatrix[3][1],mMatrix[3][2]);

    vec2 MOD_coord=MOD_p.xy*(1.0/MOD_scale)+MOD_offset-vec2(0.5,0.5);

    // vec3 MOD_dis

    #ifdef MOD_CHAN_R
        vec3 MOD_dis=vec3( texture(MOD_texture,mod(MOD_coord,1.0)).r );
    #endif
    #ifdef MOD_CHAN_G
        vec3 MOD_dis=vec3( texture(MOD_texture,mod(MOD_coord,1.0)).g );
    #endif
    #ifdef MOD_CHAN_B
        vec3 MOD_dis=vec3( texture(MOD_texture,mod(MOD_coord,1.0)).b );
    #endif

    #ifdef MOD_CHAN_RGB
        vec3 MOD_dis=vec3( texture(MOD_texture,mod(MOD_coord,1.0)).rgb );
    #endif

    #ifdef MOD_COLORIZE
        MOD_dispColor=MOD_dis;
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
        MOD_dis=vec3(0.0);
        #ifdef MOD_COLORIZE
            MOD_dispColor=vec3(0.0);
        #endif
    }
    #endif


    #ifdef MOD_MODE_TRANS
        MOD_dis*=MOD_strength;
        MOD_dis+=MOD_min;

        #ifdef MOD_AXIS_X
            // pos.x+=MOD_dis;
            mMatrix[3][0] += MOD_dis.x;
        #endif
        #ifdef MOD_AXIS_Y
            // pos.y+=MOD_dis;
            mMatrix[3][1] += MOD_dis.y;
        #endif
        #ifdef MOD_AXIS_Z
            // pos.z+=MOD_dis;
            mMatrix[3][2] += MOD_dis.z;
        #endif
    #endif

    #ifdef MOD_MODE_SCALE
        MOD_dis*=MOD_strength;
        MOD_dis+=MOD_min;

        #ifdef MOD_ABS
            MOD_dis=abs(MOD_dis);
        #endif

        #ifdef MOD_AXIS_X
            pos.x*=MOD_dis.x;
        #endif
        #ifdef MOD_AXIS_Y
            pos.y*=MOD_dis.y;
        #endif
        #ifdef MOD_AXIS_Z
            pos.z*=MOD_dis.z;
        #endif
    #endif

    #ifdef MOD_MODE_ROT
        #define MOD_PI 3.14159265358
        MOD_dis*=MOD_strength;
        MOD_dis+=MOD_min;

        #ifdef MOD_AXIS_X
            pos*=MOD_rot(vec3(1.0,0.0,0.0), MOD_dis.x*3.14);
            norm=((vec4(norm,0.0)*MOD_rot(vec3(1.0,0.0,0.0), MOD_dis.x*MOD_PI)).xyz);
        #endif
        #ifdef MOD_AXIS_Y
            pos*=MOD_rot(vec3(0.0,1.0,0.0), MOD_dis.y*MOD_PI);
            norm=((vec4(norm,0.0)*MOD_rot(vec3(0.0,1.0,0.0), MOD_dis.y*MOD_PI)).xyz);
        #endif
        #ifdef MOD_AXIS_Z
            pos*=MOD_rot(vec3(0.0,0.0,1.0), MOD_dis.z*MOD_PI);
            norm=((vec4(norm,0.0)*MOD_rot(vec3(0.0,0.0,1.0), MOD_dis.z*MOD_PI)).xyz);
        #endif

        norm=normalize(norm);
    #endif

#endif
