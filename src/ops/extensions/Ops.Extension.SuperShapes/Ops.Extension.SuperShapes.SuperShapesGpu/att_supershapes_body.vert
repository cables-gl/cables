



vec3 MOD_v1=FORMULA(attrIdx.x,attrIdx.y);
vec3 MOD_v2=FORMULA(attrIdx.x+1.0/MOD_res,attrIdx.y);
vec3 MOD_v3=FORMULA(attrIdx.x,attrIdx.y+1.0/MOD_res);

pos.xyz=MOD_v1;
norm.xyz=calcNormal(MOD_v1,MOD_v2,MOD_v3);

