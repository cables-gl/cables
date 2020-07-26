vec4 MOD_color;

#ifdef MOD_MAP_TRIPLANAR
    vec4 xaxis = texture( MOD_tex, MOD_tc);
    vec4 yaxis = texture( MOD_tex, MOD_tc1);
    vec4 zaxis = texture( MOD_tex, MOD_tc2);
    MOD_color = xaxis *MOD_blendingTri.x + yaxis *MOD_blendingTri.y + zaxis *MOD_blendingTri.z;
    MOD_color.a=1.0;
#endif



#ifdef MOD_DISCARD
if(MOD_tc.x>0.0 && MOD_tc.x<1.0 && MOD_tc.y>0.0 && MOD_tc.y<1.0)
{
#endif

    #ifndef MOD_MAP_TRIPLANAR
        MOD_color=texture(MOD_tex,MOD_tc);
    #endif

    #ifdef MOD_BLEND_NORMAL
        col.rgb=mix(col.rgb,MOD_color.rgb,MOD_amount);
    #endif
    #ifdef MOD_BLEND_ADD
        col.rgb+=MOD_color.rgb*MOD_amount;
    #endif
    #ifdef MOD_BLEND_MUL
        col.rgb*=MOD_color.rgb*MOD_amount;
    #endif

#ifdef MOD_DISCARD
}
#endif
