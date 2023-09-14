{{MODULES_HEAD}}

IN vec3 vPosition;
IN float attrVertIndex;
IN float splineProgress;
IN vec3 spline,spline2,spline3;
IN float splineDoDraw;

OUT float splineDoDrawFrag;
OUT vec2 texCoord;
OUT vec3 norm;
UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;

UNI float width;
UNI float texOffset;
UNI float aspect;

#define PI 3.1415926538

vec2 rotate(vec2 v, float a)
{
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

vec2 fix( vec4 i )
{
    vec2 res = i.xy / i.w;
    return res;
}

void main()
{
    texCoord=vPosition.xy;
    texCoord.y=texCoord.y*0.5+0.5;
    #ifdef TEX_MAP_FULL
        texCoord.x=splineProgress;
    #endif
    texCoord.x+=texOffset;

    mat4 mMatrix=modelMatrix;
    mat4 mvMatrix=viewMatrix * mMatrix;

    splineDoDrawFrag=splineDoDraw;

    // vec4 pos=vec4((spline2+spline3+spline)/3.0*vPosition,1.0);
    vec4 pos=vec4(spline2,1.0);

    {{MODULE_VERTEX_POSITION}}

    vec4 finalPosition  = projMatrix * mvMatrix * (vec4(spline2,1.0));
    vec4 finalPosition2 = projMatrix * mvMatrix * (vec4(spline3,1.0));

    vec2 screenPos =fix(projMatrix * mvMatrix * vec4(spline,1.0));
    vec2 screenPos2=fix(projMatrix * mvMatrix * vec4(spline2,1.0));
    vec2 screenPos3=fix(projMatrix * mvMatrix * vec4(spline3,1.0));

    float wid=width/10.0;

    #ifndef PERSPWIDTH
        wid=width*finalPosition.w*0.0025;
    #endif

    vec2 dir1 = normalize( screenPos2 - screenPos );
    vec2 dir2 = normalize( screenPos3 - screenPos2 );

	if( screenPos2 == screenPos ) dir1 = normalize( screenPos3 - screenPos2 );

    vec2 normal = vec2( -dir1.y/aspect, dir1.x ) * 0.5 * wid;
    vec2 normal2 = vec2( -dir2.y/aspect, dir2.x ) * 0.5 * wid;

    vec4 offset = vec4( mix(normal,normal2,vPosition.x) * vPosition.y, 0.0, 1.0 );

    finalPosition = mix(finalPosition,finalPosition2,vPosition.x);
	finalPosition.xy += offset.xy;

    gl_Position = finalPosition;
}
