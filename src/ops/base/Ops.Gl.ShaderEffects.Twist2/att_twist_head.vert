

UNI float MOD_amount;
UNI float MOD_height;

vec4 MOD_twist(vec4 pos, float t)
{
	float st = sin(t);
	float ct = cos(t);
	vec4 new_pos;
	
	new_pos.x = pos.x*ct - pos.z*st;
	new_pos.z = pos.x*st + pos.z*ct;
	
	new_pos.y = pos.y;
	new_pos.w = pos.w;

	return( new_pos );
}

