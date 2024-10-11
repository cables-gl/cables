OUT vec3 MOD_displHeightMapColor;

#ifdef MOD_MODE_VERTCOL
#ifndef VERTEX_COLORS
IN vec4 attrVertColor;
#endif
#endif

// mat4 rotationX( in float angle ) {
// 	return mat4(	1.0,		0,			0,			0,
// 			 		0, 	cos(angle),	-sin(angle),		0,
// 					0, 	sin(angle),	 cos(angle),		0,
// 					0, 			0,			  0, 		1);
// }

// mat4 rotationY( in float angle ) {
// 	return mat4(	cos(angle),		0,		sin(angle),	0,
// 			 				0,		1.0,			 0,	0,
// 					-sin(angle),	0,		cos(angle),	0,
// 							0, 		0,				0,	1);
// }

// mat4 rotationZ( in float angle ) {
// 	return mat4(	cos(angle),		-sin(angle),	0,	0,
// 			 		sin(angle),		cos(angle),		0,	0,
// 							0,				0,		1,	0,
// 							0,				0,		0,	1);
// }


vec3 MOD_calcNormal(sampler2D tex,vec2 uv)
{
    // float texelSize=1.0/float(textureSize(tex,0).x); // not on linux intel?!
    float texelSize=1.0/512.0;

    float tl = abs(texture(tex, uv + texelSize * vec2(-1.0, -1.0)).x);   // top left
    float  l = abs(texture(tex, uv + texelSize * vec2(-1.0,  0.0)).x);   // left
    float bl = abs(texture(tex, uv + texelSize * vec2(-1.0,  1.0)).x);   // bottom left
    float  t = abs(texture(tex, uv + texelSize * vec2( 0.0, -1.0)).x);   // top
    float  b = abs(texture(tex, uv + texelSize * vec2( 0.0,  1.0)).x);   // bottom
    float tr = abs(texture(tex, uv + texelSize * vec2( 1.0, -1.0)).x);   // top right
    float  r = abs(texture(tex, uv + texelSize * vec2( 1.0,  0.0)).x);   // right
    float br = abs(texture(tex, uv + texelSize * vec2( 1.0,  1.0)).x);   // bottom right

    //     // Compute dx using Sobel:
    //     //           -1 0 1
    //     //           -2 0 2
    //     //           -1 0 1
    float dX = tr + 2.0 * r + br - tl - 2.0 * l - bl;
    //     // Compute dy using Sobel:
    //     //           -1 -2 -1
    //     //            0  0  0
    //     //            1  2  1
    float dY = bl + 2.0*b + br -tl - 2.0*t - tr;
    //  // Build the normalized normal

vec3 N;

#ifdef MOD_NORMALS_Z
    N = (vec3(dX,dY, 1.0 / 8.0));
#endif

#ifdef MOD_NORMALS_Y
    N = (vec3(dX,1.0/8.0,dY));
#endif
#ifdef MOD_NORMALS_X
    N = (vec3(1.0/8.0,dX,dY));
#endif
//N*=-1.0;
// N= N * 0.5 + 0.5;


   return N;
}
