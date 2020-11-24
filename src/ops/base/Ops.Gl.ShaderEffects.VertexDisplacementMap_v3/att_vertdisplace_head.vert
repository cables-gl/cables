OUT float MOD_displHeightMapColor;

// mat4 MOD_rotationX( in float angle ) {
// 	return mat4(	1.0,		0,			0,			0,
// 			 		0, 	cos(angle),	-sin(angle),		0,
// 					0, 	sin(angle),	 cos(angle),		0,
// 					0, 			0,			  0, 		1);
// }

// mat4 MOD_rotationY( in float angle ) {
// 	return mat4(	cos(angle),		0,		sin(angle),	0,
// 			 				0,		1.0,			 0,	0,
// 					-sin(angle),	0,		cos(angle),	0,
// 							0, 		0,				0,	1);
// }

// mat4 MOD_rotationZ( in float angle ) {
// 	return mat4(	cos(angle),		-sin(angle),	0,	0,
// 			 		sin(angle),		cos(angle),		0,	0,
// 							0,				0,		1,	0,
// 							0,				0,		0,	1);
// }

vec3 MOD_calcNormal(sampler2D tex,vec2 uv)
{
    float strength=13.0;
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
    float dX = tr + 2.0*r + br -tl - 2.0*l - bl;

    //     // Compute dy using Sobel:
    //     //           -1 -2 -1
    //     //            0  0  0
    //     //            1  2  1
    float dY = bl + 2.0*b + br -tl - 2.0*t - tr;

    //     // Build the normalized normal

    vec3 N = normalize(vec3(dX,dY, 1.0 / strength));

    //     //convert (-1.0 , 1.0) to (0.0 , 1.0), if needed
    N= N * 0.5 + 0.5;

   return N;
}
