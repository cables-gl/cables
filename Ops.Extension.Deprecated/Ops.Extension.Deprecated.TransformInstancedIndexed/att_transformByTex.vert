
vec2 MOD_tc=vec2(0.0,0.0);
MOD_tc.x=mod(instanceIndex/MOD_TEX_WIDTH,1.0);
MOD_tc.y=floor(instanceIndex/MOD_TEX_WIDTH)/MOD_TEX_HEIGHT;

vec4 MOD_col=texture(MOD_tex,MOD_tc);

#ifdef MOD_COLORIZE
    MOD_color=MOD_col;
#endif

float MOD_v=0.;

#ifdef MOD_INPUT_R
    MOD_v=MOD_col.r;
#endif
#ifdef MOD_INPUT_G
    MOD_v=MOD_col.g;
#endif
#ifdef MOD_INPUT_B
    MOD_v=MOD_col.b;
#endif

#ifdef MOD_SMOOTHSTEP
    MOD_v=smoothstep(0.1,0.9,MOD_v);
#endif

#ifdef MOD_NORMALIZE
    MOD_v=(MOD_v-0.5)*2.0;
#endif

MOD_v*=MOD_strength;

float MOD_v2=0.0;
#ifdef MOD_AXIS_X
    MOD_v2=pos.x;
#endif
#ifdef MOD_AXIS_Y
    MOD_v2=pos.y;
#endif
#ifdef MOD_AXIS_Z
    MOD_v2=pos.z;
#endif


float MOD_result=0.0;
#ifdef MOD_MATH_ADD
    MOD_result=MOD_v2+MOD_v;
#endif
#ifdef MOD_MATH_SUB
    MOD_result=MOD_v2-MOD_v;
#endif
#ifdef MOD_MATH_MUL
    MOD_result=MOD_v2*MOD_v;
#endif
#ifdef MOD_MATH_DIV
    MOD_result=MOD_v2/MOD_v;
#endif


#ifdef MOD_AXIS_X
    pos.x=MOD_result;
#endif
#ifdef MOD_AXIS_Y
    pos.y=MOD_result;
#endif
#ifdef MOD_AXIS_Z
    pos.z=MOD_result;
#endif
