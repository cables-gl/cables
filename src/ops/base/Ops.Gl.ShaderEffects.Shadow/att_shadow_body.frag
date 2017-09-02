
// vec3 shadowCoord = (MOD_positionFromLight.xyz/MOD_positionFromLight.w)/2.0 + 0.5;
// vec4 rgbaDepth = texture2D(MOD_shadowMap, shadowCoord.xy);
// float depth = unpackDepth(rgbaDepth);
// float visibility = (shadowCoord.z > depth + 0.0015) ? 0.3 : 1.0;
// // col = vec4(vec3(1.0, 0.0, 0.0) * visibility, 1.0);
// col *= visibility;


vec2 coord=MOD_positionFromLight.xy/512.0;
vec4 rgbaDepth = texture2D(MOD_shadowMap, coord);



// col.r=MOD_positionFromLight.x;

// col.b=1.0;
// col.rg=coord;

float bias = 0.1005;
// if( rgbaDepth.z < MOD_positionFromLight.z/256.0+bias) col.rgb*=0.5;
//     else col.rgb*=1.0;

// if( rgbaDepth.z ==0.0) col.rgb*=0.5;
//     else col.rgb*=1.0;


// col.rgb=rgbaDepth.rgb/100.0;//vec3(rgbaDepth,rgbaDepth,rgbaDepth);



float f=100.0;
float n=0.1;
float z=rgbaDepth.r;
// float z=MOD_positionFromLight.z;
float c=(2.0*n)/(f+n-z*(f-n));

// // c=MOD_positionFromLight.z/100.0;
col=vec4(c,c,c,1.0);



// // col.xyz=vec3(rgbaDepth.z);