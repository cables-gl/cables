
float MOD_angle_rad = MOD_amount * 3.14159 / 180.0;
float MOD_ang = (MOD_height*0.5 + pos.y)/MOD_height * MOD_angle_rad;

pos = MOD_twist(pos, MOD_ang);

norm = normalize(MOD_twist( vec4(norm, 1.0), MOD_ang ).xyz);
