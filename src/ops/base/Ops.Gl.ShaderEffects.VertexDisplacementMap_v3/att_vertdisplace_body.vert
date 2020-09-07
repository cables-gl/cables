
vec2 MOD_tc=texCoord;

#ifdef MOD_FLIPY
    MOD_tc.y=1.0-MOD_tc.y;
#endif


float MOD_texVal=texture2D( MOD_texture, vec2(MOD_tc.x+MOD_offsetX,MOD_tc.y+MOD_offsetY) ).b;
// float MOD_texVal=texture2D( MOD_texture, vec2(pos.xy)/4.0 ).b;

#ifdef MOD_HEIGHTMAP_INVERT
   MOD_texVal=1.0-MOD_texVal;
#endif

#ifdef MOD_NORMALIZE
   MOD_texVal=(MOD_texVal-0.5)*2.0;
#endif

#ifdef MOD_DISPLACE_METH_MULXYZ
   MOD_texVal+=1.0;
   pos.xyz *= MOD_texVal * MOD_extrude;
    // .endl()+'   norm=normalize(norm+normalize(pos.xyz+vec3(MOD_texVal)* MOD_extrude));'
#endif

#ifdef MOD_DISPLACE_METH_MULXY
   MOD_texVal+=1.0;
   pos.xy *= MOD_texVal * MOD_extrude;
    // .endl()+'   norm=normalize(norm+normalize(pos.xyz+vec3(MOD_texVal)* MOD_extrude));'
#endif

#ifdef MOD_DISPLACE_METH_ADDZ
   pos.z+=(MOD_texVal * MOD_extrude);
#endif

#ifdef MOD_DISPLACE_METH_ADDY
   pos.y+=(MOD_texVal * MOD_extrude);
#endif


#ifdef MOD_DISPLACE_METH_ADDXY
   pos.xy+=(MOD_texVal * MOD_extrude);
#endif


#ifdef MOD_DISPLACE_METH_ADDX
   pos.x+=(MOD_texVal * MOD_extrude);
#endif

#ifdef MOD_DISPLACE_METH_SUBX
   pos.x-=(MOD_texVal * MOD_extrude);
#endif


#ifdef MOD_DISPLACE_METH_MULY
   pos.y+=((MOD_texVal-0.5) * MOD_extrude);
#endif

#ifdef MOD_DISPLACE_METH_MULZ
   pos.z+=((MOD_texVal-0.5) * MOD_extrude);
#endif

#ifdef MOD_DISPLACE_METH_NORMAL
   pos.xyz+=norm*MOD_texVal*MOD_extrude;
#endif

#ifdef MOD_DISPLACE_METH_NORMAL_XY
   pos.xy+=(pos.xy*MOD_texVal*MOD_extrude).xy;
    // .endl()+'   pos.x+=(norm*MOD_texVal*MOD_extrude).x;'
#endif

#ifdef MOD_DISPLACE_METH_NORMAL_RGB

    vec3 MOD_texValRGB=texture2D( MOD_texture, vec2(MOD_tc.x+MOD_offsetX,MOD_tc.y+MOD_offsetY) ).rgb;
    // pos.xyz+=((MOD_texValRGB-0.5)*2.0);//*pos.xyz*0.2;//vec2(MOD_texVal*MOD_extrude)*normalize(pos.xy);

    // MOD_texValRGB.x-=0.5*MOD_texValRGB.y;
    // MOD_texValRGB.y-=0.5*MOD_texValRGB.x;
    // MOD_texValRGB.z=0.0;

    // okish
    // MOD_texValRGB.x-=0.177;
    // MOD_texValRGB.y-=0.17;
    // pos.xyz+=((MOD_texValRGB));

    // MOD_texValRGB.r=1.0-MOD_texValRGB.r;
    // MOD_texValRGB.g=1.0-MOD_texValRGB.g;


    MOD_texValRGB=((MOD_texValRGB-0.5)*2.0);
    MOD_texValRGB.b=0.0;

    // pos.xyz+=MOD_texValRGB;

    // pos.xy+=(normalize(pos.xyz).xy*MOD_texValRGB.rg*MOD_extrude).xy;
    pos.xyz+=(normalize(pos.xyz).xyz*MOD_texValRGB.grb*MOD_extrude).xyz;


#endif

#ifdef MOD_DISPLACE_METH_14

    vec3 MOD_texValRGB=texture2D( MOD_texture, vec2(MOD_tc.x+MOD_offsetX,MOD_tc.y+MOD_offsetY) ).rgb;


    // MOD_texValRGB=1.0-MOD_texValRGB;
    // pos.xyz+=vec2(MOD_texValRGB*MOD_extrude)*normalize(pos.xy);

    // pos.xyz+=vec2(MOD_texValRGB*MOD_extrude)*normalize(pos.xy);

    MOD_texValRGB=(MOD_texValRGB-0.5)*2.0;

    // MOD_texValRGB-=1.0;


    // MOD_texValRGB.x*=0.8;
    // MOD_texValRGB.y*=0.8;
    // MOD_texValRGB=normalize(MOD_texValRGB);

// pos.xy+=vec2(MOD_texVal*MOD_extrude)*normalize(pos.xy);

    vec3 npos=vec3(0.0,0.0,0.0);

    // npos.xyz=attrTangent;
    // npos.xyz=(attrTangent.xyz*(MOD_texValRGB.x));
    // npos.xyz+=(attrBiTangent*(MOD_texValRGB.x));





    npos=(attrVertNormal*(MOD_texValRGB.r));

    npos*=MOD_extrude;

    pos.xyz=(npos);

    pos.y+=1.0;







    // MOD_texValRGB

    // pos*=rotationZ( 3.14 );



    // MOD_texValRGB.x*=0.2;
    // MOD_texValRGB.y*=0.2;
    // MOD_texValRGB.z*=0.3;

    // MOD_texValRGB*=0.3;




    // pos.xyz+=pos.xyz*MOD_texValRGB;

    // pos.xyz+=MOD_extrude*vec3(
    //     rot(pos.xyz,MOD_texValRGB.x*3.0).x,
    //     rot(pos.xyz,MOD_texValRGB.y*3.0).y,
    //     rot(pos.xyz,MOD_texValRGB.z*3.0).z);


    // pos.xyz+=MOD_extrude*vec3(
        // rot(pos.xyz,MOD_texValRGB.x*3.0));



#endif

#ifdef MOD_DISPLACE_METH_NORMAL2
    // meth 12

    pos.xy+=vec2(MOD_texVal*MOD_extrude)*normalize(pos.xy);

#endif


MOD_displHeightMapColor=MOD_texVal;

#ifdef CALC_NORMALS
    norm+=MOD_calcNormal(MOD_texture,MOD_tc);
#endif