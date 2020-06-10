{{MODULES_HEAD}}

IN vec3 vPosition;
IN float attrVertIndex;
IN float splineProgress;
IN vec3 spline,spline2,spline3;

OUT vec2 texCoord;
OUT vec3 norm;
UNI mat4 projMatrix;
UNI mat4 viewMatrix;
UNI mat4 modelMatrix;
UNI float width;
UNI float texOffset;
// UNI float sizeAtt;

#define PI 3.1415926538

vec2 rotate(vec2 v, float a)
{
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

float aspect=1.7777;

vec2 fix( vec4 i )
{
    vec2 res = i.xy / i.w;
    res.x *= aspect;
    return res;
}

void main()
{
    texCoord=vPosition.xy;
    texCoord.y=texCoord.y*0.5+0.5;

    #ifdef TEX_MAP_FULL
    texCoord.x=splineProgress;
    #endif

    vec4 pos=vec4(vPosition,  1.0);
    mat4 mMatrix=modelMatrix;

    vec4 finalPosition  = projMatrix * (viewMatrix*mMatrix) * (vec4(spline2,1.0));
    vec4 finalPosition2 = projMatrix * (viewMatrix*mMatrix) * (vec4(spline3,1.0));

    vec2 screenPos =fix(projMatrix * (viewMatrix*mMatrix) * vec4(spline,1.0));
    vec2 screenPos2=fix(projMatrix * (viewMatrix*mMatrix) * vec4(spline2,1.0));
    vec2 screenPos3=fix(projMatrix * (viewMatrix*mMatrix) * vec4(spline3,1.0));

    // float angle =atan(screenPos2.x-screenPos.x ,screenPos2.y-screenPos.y);
    // float angle2=atan(screenPos3.x-screenPos2.x,screenPos3.y-screenPos2.y);

    // vec2 pos2d;
    // pos2d.xy  = (1.0-pos.x)*rotate(vec2(0.0,pos.y),angle+PI/2.0);
    // pos2d.xy += (pos.x)*rotate(vec2(0.0,pos.y),angle2+PI/2.0);


    // finalPosition=mix(finalPosition,finalPosition2,pos.x);
    // finalPosition.xy+=pos2d.xy*width;

    // float wid=width*10.0;

    float wid=width*10.0;

    #ifdef PERSPWIDTH
        wid=width*finalPosition.w*0.5;
    #endif

    vec2 dir1 = normalize( screenPos2 - screenPos );
    vec2 dir2 = normalize( screenPos3 - screenPos2 );

	if( screenPos2 == screenPos ) dir1 = normalize( screenPos3 - screenPos2 );

    vec2 normal = vec2( -dir1.y, dir1.x ) * 0.5 * wid;
    vec2 normal2 = vec2( -dir2.y, dir2.x ) * 0.5 * wid;

    vec4 offset = vec4( mix(normal,normal2,pos.x) * pos.y, 0.0, 1.0 );

    finalPosition = mix(finalPosition,finalPosition2,pos.x);
	finalPosition.xy += offset.xy;

    gl_Position = finalPosition;
}







