gl_PointSize=1.0;

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

MOD_pos*=MOD_mul; // color for the pixel

highp float ty = floor(attrVertIndex/(MOD_texSize));
highp float tx = attrVertIndex-(ty*MOD_texSize)+1.0;

// MOD_pos.x=tx;
// MOD_pos.y=ty;
// MOD_pos.z=attrVertIndex;

pos=vec4(tx,ty+1.0,0.0,1.0); // pixel position
