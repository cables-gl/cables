



vec4 MOD_col=texture(MOD_texture,MOD_coord);

#ifdef METH_ADD
col.rgb+=MOD_col.rgb*MOD_strength;
#endif
#ifdef METH_MUL
col.rgb*=MOD_col.rgb*MOD_strength;
#endif

#ifdef MOD_DEBUG
    col.rg=mod(MOD_coord,1.0).rg;
#endif
