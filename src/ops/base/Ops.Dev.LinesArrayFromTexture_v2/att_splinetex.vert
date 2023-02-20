
vec4 col=texture(MOD_tex,texCoord);

vec3 MOD_pos=col.xyz;

pos.xyz=MOD_pos.xyz;


mulAlpha=1.0;
if(col.a!=1.0)
    mulAlpha=0.0;

