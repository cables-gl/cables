
#ifdef MOD_FLIPX
    texCoord.x=1.0-texCoord.x;
#endif
#ifdef MOD_FLIPY
    texCoord.y=1.0-texCoord.y;
#endif

texCoord-=0.5;
float MOD_a=MOD_rot * (2.0*3.14159265);
texCoord = (cos(MOD_a)*texCoord + sin(MOD_a)*vec2(texCoord.y, -texCoord.x));
texCoord+=0.5;

texCoord*=MOD_scale;
texCoord+=MOD_trans;
