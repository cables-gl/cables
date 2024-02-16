



#ifdef MOD_ATTRIB_POS
    MOD_pos=pos.xyz;
#endif
#ifdef MOD_ATTRIB_NORMAL
    MOD_pos=norm.xyz;
#endif
#ifdef MOD_ATTRIB_TC
    MOD_pos=vec3(attrTexCoord,1.0);
#endif
#ifdef MOD_ATTRIB_TEXTURECOLOR
    MOD_pos=texture(MOD_texColor,attrTexCoord).rgb;
#endif
#ifdef MOD_ATTRIB_VERTCOLS
    MOD_pos=attrVertColor.rgb;
#endif

MOD_pos*=MOD_mul;

float tx = mod(attrVertIndex,MOD_texSize)+(1.0/MOD_texSize);
float ty = ((attrVertIndex)/MOD_texSize);

gl_PointSize=1.0;

pos=vec4(tx,ty,1.0,1.0);
