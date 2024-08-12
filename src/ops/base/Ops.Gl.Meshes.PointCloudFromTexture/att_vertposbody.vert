
// float tx=mod(attrVertIndex,(MOD_texSize))/(MOD_texSize);
// float ty=float(int((attrVertIndex/(MOD_texSize))))/(MOD_texSize);

vec4 col=texture(MOD_tex,texCoord);//vec2(tx,ty));




// vec4 col=texture(MOD_tex,texCoord);

#ifdef POINTMATERIAL
    #ifdef MOD_HAS_PS_TEX
        psMul*=abs(texture(MOD_texPointSize,texCoord).r);
        // psMul*=attrVertIndex/21000.0;
    #endif
    #ifdef PIXELSIZE
        if(col.a==0.0)psMul=0.0;
    #endif

#endif

vec3 MOD_pos=col.xyz+pos.xyz;

#ifdef MOD_NORMALIZE
    MOD_pos=(MOD_pos.xyz-0.5)*2.0;
#endif

#ifdef MOD_AXIS_XYZ
    pos.xyz=MOD_pos.xyz+pos.xyz;
#endif

#ifdef MOD_AXIS_XY
    pos.xy=MOD_pos.xy+pos.xy;
    pos.z=0.0+pos.z;
    pos.w=1.0;
#endif

#ifdef POINTMATERIAL
    #ifdef MOD_REMOVEZERO
        if(MOD_pos.x==0.0 && MOD_pos.y==0.0 && MOD_pos.z==0.0) psMul=0.0;
    #endif
#endif

#ifdef MOD_IGNOREALPHA0
    if(col.a==0.0)
    {
        #ifdef POINTMATERIAL
            psMul=0.0;
        #endif
        pos.x=pos.y=pos.z=-9999999999.0;
    }
#endif


// #ifdef MOD_SIZEMULALPHA
//     psMul*=col.a;
// #endif
