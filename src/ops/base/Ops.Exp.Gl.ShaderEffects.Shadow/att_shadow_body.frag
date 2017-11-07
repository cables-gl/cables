//http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-16-shadow-mapping/


// vec3 shadowCoord = (MOD_positionFromLight.xyz/MOD_positionFromLight.w)/2.0 + 0.5;
// vec4 texDepth = texture2D(MOD_shadowMap, shadowCoord.xy);
// float depth = unpackDepth(texDepth);
// float visibility = (shadowCoord.z > depth + 0.0015) ? 0.3 : 1.0;
// // col = vec4(vec3(1.0, 0.0, 0.0) * visibility, 1.0);
// col *= visibility;


// vec2 coord=MOD_positionFromLight.xy/140.0-vec2(0.5,0.5);

vec3 coords = MOD_positionFromLight.xyz / MOD_positionFromLight.w;
// coords.x = (0.5 * coords.x) + 0.5;
// coords.y = (0.5 * coords.y) + 0.5;

// vec4 texDepth = texture2D(MOD_shadowMap, coords.xy);

// col.r=MOD_positionFromLight.x;

// col.b=1.0;
// col.rgb=coords;

float shadow=1.0;
float bias = 0.001;

// if(coords.x>0.0 && coords.x<1.0 && coords.y>0.0 && coords.y<1.0)
// {
//     if( texDepth.r < (MOD_positionFromLight.z+bias) ) shadow=0.5;
//         else shadow=1.0;
// }

if(coords.x>0.0 && coords.x<1.0 && coords.y>0.0 && coords.y<1.0)
{

    vec2 texelSize = vec2(1.0) / 1024.0;
    // float smpmax=MOD_smpls/4.0;
    // float count=0.0;
    // float x=1.0;
    // float y=1.0;

    // for(float x = -smpmax; x <= smpmax; ++x)
    // {
    //     for(float y = -smpmax; y <= smpmax; ++y)
    //     {
    //         float pcfDepth = texture2D(MOD_shadowMap, coords.xy + vec2(x, y) * texelSize).r; 

    //         shadow += MOD_positionFromLight.z + MOD_bias > pcfDepth ? 1.0 : 0.0;


    //         shadow/=1.0;
            
    //         count+=1.0;
    //     }
    // }
    // shadow /= count;
    // shadow-=0.3;
    // shadow=1.0-(shadow*MOD_strength*MOD_amount);
    
    
    
    shadow=0.0;
    for(float x = 0.0; x < 8.0; ++x)
    {

        int index = int(abs(16.0*
            MOD_random(
                floor(MOD_positionFromLight.xyz*510.0),
                int(x))))%16;

        float pcfDepth = texture2D(
            MOD_shadowMap, 
            coords.xy + (poissonDisk[index]/400.0)
            ).r; 
            
        float shadowPixel = MOD_positionFromLight.z + MOD_bias > pcfDepth ? 1.0 : 0.0;

        // float intensity = (1.0-
        //     texture2D( 
        //         MOD_shadowMap, 
        //         vec2(
        //             coords.xy + poissonDisk[index]/120.0
        //              )).r);
        
        shadow+=( (1.0/8.0)*shadowPixel);
    }
    
    shadow=1.0-(shadow*MOD_strength*MOD_amount);


    // float shadowPixel=texture2D(MOD_shadowMap,MOD_positionFromLight.xyz);

    // shadow=shadowPixel;//(1.0-(shadow*MOD_strength*MOD_amount));
    
    
    
    
    
    
}







col.rgb*=shadow;


// if( texDepth.x <0.0) col.rgb*=0.2;
//     else col.rgb*=1.0;


// col.rgb=texDepth.rgb/100.0;//vec3(texDepth,texDepth,texDepth);



// float f=50.0;
// float n=0.1;
// float z=texDepth.r;
// float c=(2.0*n)/(f+n-z*(f-n));
// col=vec4(c,c,c,1.0);


// from lightpos
// col.xyz=vec3(MOD_positionFromLight.z/50.0);


