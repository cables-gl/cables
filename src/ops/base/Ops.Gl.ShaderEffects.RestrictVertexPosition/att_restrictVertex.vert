

#ifndef RESTRICT_UPDATENORMALS

    #ifdef RESTRICT_AXIS_X
        pos.x=min(MOD_max,pos.x);
        pos.x=max(MOD_min,pos.x);
    #endif
    #ifdef RESTRICT_AXIS_Y
        pos.y=min(MOD_max,pos.y);
        pos.y=max(MOD_min,pos.y);
    #endif
    #ifdef RESTRICT_AXIS_Z
        pos.z=min(MOD_max,pos.z);
        pos.z=max(MOD_min,pos.z);
    #endif


#endif

#ifdef RESTRICT_UPDATENORMALS
    #ifdef RESTRICT_AXIS_X
        if(pos.x>MOD_max)
        {
            pos.x=MOD_max;
            pos.y=0.0;
            pos.z=0.0;
            norm=vec3(0.0,1.0,0.0);
        }
        if(pos.x<MOD_min)
        {
            pos.x=MOD_min;
            pos.y=0.0;
            pos.z=0.0;
            norm=vec3(0.0,-1.0,0.0);
        }
    #endif
    
    #ifdef RESTRICT_AXIS_Y
        if(pos.y>MOD_max)
        {
            pos.y=MOD_max;
            pos.x=0.0;
            pos.z=0.0;
            norm=vec3(0.0,0.0,1.0);
        }
        if(pos.y<MOD_min)
        {
            pos.y=MOD_min;
            pos.x=0.0;
            pos.z=0.0;
            norm=vec3(0.0,0.0,-1.0);
        }
    #endif
    
    #ifdef RESTRICT_AXIS_Z
        if(pos.z>MOD_max)
        {
            pos.z=MOD_max;
            pos.y=0.0;
            pos.x=0.0;
            norm=vec3(1.0,0.0,0.0);
        }
        if(pos.z<MOD_min)
        {
            pos.z=MOD_min;
            pos.y=0.0;
            pos.x=0.0;
            norm=vec3(-1.0,0.0,0.0);
        }
        
    #endif
#endif