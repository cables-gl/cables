

UNI float MOD_amount;
UNI float MOD_height;
UNI float MOD_offset;

vec4 MOD_twist(vec4 pos, float t)
{
	float st = sin(t);
	float ct = cos(t);
	vec4 new_pos;

	new_pos.x = pos.x;
	new_pos.y = pos.y;
	new_pos.z = pos.z;
	new_pos.w = pos.w;

    #ifdef MOD_AXIS_Z
    	new_pos.x = pos.y*ct - pos.x*st;
    	new_pos.y = pos.y*st + pos.x*ct;
    #endif

    #ifdef MOD_AXIS_Y
    	new_pos.x = pos.x*ct - pos.z*st;
    	new_pos.z = pos.x*st + pos.z*ct;
    #endif

    #ifdef MOD_AXIS_X
    	new_pos.y = pos.y*ct - pos.z*st;
    	new_pos.z = pos.y*st + pos.z*ct;
    #endif


	return( new_pos );
}

