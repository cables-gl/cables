
vec3 coords = MOD_positionFromLight.xyz / MOD_positionFromLight.w;

float shadow=1.0;

if(coords.x>0.0 && coords.x<1.0 && coords.y>0.0 && coords.y<1.0)
{

    for(float x = 0.0; x < MOD_smpls; ++x)
    {
        vec3 shadowCoord=vec3(coords.xy+(poissonDisk[int(x)]/1000.0), (coords.z-MOD_bias)/MOD_positionFromLight.w);

        float shadowPixel=texture2D(MOD_shadowMap,shadowCoord);

        shadow-=((1.0/(MOD_smpls))*shadowPixel);
    }

    shadow=((shadow*(MOD_strength*MOD_amount)));
    shadow=1.0-shadow;

}

col.rgb*=shadow;

