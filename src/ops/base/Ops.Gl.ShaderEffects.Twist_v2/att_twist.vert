
float MOD_angle_rad = MOD_amount * 3.14159 / 180.0;

float MOD_axis=pos.y;

#ifdef MOD_AXIS_Z
    MOD_axis=pos.z;
#endif

#ifdef MOD_AXIS_X
    MOD_axis=pos.x;
#endif

float MOD_ang = (MOD_height*0.5 + MOD_axis)/MOD_height * MOD_angle_rad;

pos = MOD_twist(pos, MOD_ang);


norm = normalize(MOD_twist( vec4(norm, 1.0), MOD_ang ).xyz);
