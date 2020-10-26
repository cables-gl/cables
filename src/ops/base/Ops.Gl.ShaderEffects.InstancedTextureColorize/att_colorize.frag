



vec4 MOD_col=texture(MOD_texture,MOD_coord);

col.rgb+=MOD_col.rgb*MOD_strength;

#ifdef MOD_DEBUG
    col.rg=mod(MOD_coord,1.0).rg;
#endif
