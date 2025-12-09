

float MOD_fade=0.0;

if(attrVertIndex > MOD_vert_start )
{
    MOD_fade=1.0;
    if(attrVertIndex < MOD_vert_end)
    {
        MOD_fade=(attrVertIndex-MOD_vert_start) / (MOD_vert_end-MOD_vert_start);
        MOD_fade=smoothstep(0.0,1.0,MOD_fade);
    }
}


pos = vec4(
        pos.xyz * MOD_fade +
        MOD_morphTarget * ( 1.0 - MOD_fade ),
        1.0 );
