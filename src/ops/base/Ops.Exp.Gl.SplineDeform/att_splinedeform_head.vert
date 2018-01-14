
UNI vec3 MOD_points[SPLINE_POINTS];
UNI float MOD_offset;
UNI float MOD_size;

vec3 ip(float v)
{
    int index0=int(abs(mod(v,max(0.0,float(SPLINE_POINTS)))));
    int index1=int(abs(mod(v+1.0,max(0.0,float(SPLINE_POINTS)))));
    float fr=fract(abs(mod(v,max(0.0,float(SPLINE_POINTS)))));
    return mix( MOD_points[index0] ,MOD_points[index1] ,fr);
}

vec3 MOD_splineDeform(vec4 pos, int isNormal)
{
    float off=MOD_offset+( (pos.x)*MOD_size);

    vec3 bezierPointPrevious=ip(off-1.0);
    vec3 bezierPoint=ip(off);
    vec3 bezierPointNext=ip(off+1.0);

    vec3 _Up=vec3(0.0,1.0,0.0);
    vec3 _Forward=vec3(1.0,0.0,0.0);
    vec3 _Right=vec3(0.0,0.0,1.0);

	float vertexForward = pos.x * _Forward.x + pos.y * _Forward.y + pos.z * _Forward.z;
	float vertexRight = pos.x * _Right.x + pos.y * _Right.y + pos.z * _Right.z;
	float vertexUp = pos.x * _Up.x + pos.y * _Up.y + pos.z * _Up.z;

	float angle = atan(vertexUp,vertexRight);
	float radius = length(vec2(vertexRight, vertexUp));

	vec3 forward = normalize(bezierPointNext - bezierPoint);
	vec3 backward = normalize(bezierPointPrevious - bezierPoint);
	vec3 up = normalize(cross(forward, backward));
	vec3 right = normalize(cross(forward, up));

    if(isNormal==0)
    {
        pos.xyz = bezierPoint + right * cos(angle) * radius + up * sin(angle) * radius;
    }
    else 
    {
        pos.xyz = pos.xyz-( (bezierPoint) + right * cos(angle) * radius + up * sin(angle) * radius);
    }

    return pos.xyz;
}