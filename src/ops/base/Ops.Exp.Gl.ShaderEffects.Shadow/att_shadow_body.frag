
vec3 coords = MOD_positionFromLight.xyz / MOD_positionFromLight.w;

float shadow=1.0;





if(coords.x>0.0 && coords.x<1.0 && coords.y>0.0 && coords.y<1.0)
{

    for(float x = 0.0; x < SHADOW_NUM_SAMPLES; ++x)
    {
        vec3 shadowCoord=vec3(coords.xy+( samples[int(x)]/(MOD_mapsize*2.0) ), (coords.z-MOD_bias)/MOD_positionFromLight.w);

        float shadowPixel=texture(MOD_shadowMap,shadowCoord);

        shadow-=((1.0/(SHADOW_NUM_SAMPLES))*shadowPixel);
    }

    shadow=((shadow*(MOD_strength*MOD_amount)));
    shadow=1.0-shadow;

    
    col.bg-=MOD_showMapArea;
    col.r+=MOD_showMapArea;
}



col.rgb*=shadow;



