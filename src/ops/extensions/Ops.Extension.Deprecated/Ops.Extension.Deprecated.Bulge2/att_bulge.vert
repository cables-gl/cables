

float MOD_idx=(MOD_height*0.5 + pos.y)/MOD_height;

float MOD_numPoints=float(NUM_BULGE_POINTS);
float MOD_splineValue=MOD_points[ int(MOD_idx * MOD_numPoints) ].x;


pos.xz*=MOD_splineValue*MOD_amount;
norm*=MOD_splineValue*MOD_amount;