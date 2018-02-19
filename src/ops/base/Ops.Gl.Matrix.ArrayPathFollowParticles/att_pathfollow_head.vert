
UNI vec3 MOD_points[PATHFOLLOW_POINTS];
UNI bool MOD_randomSpeed;
UNI float MOD_maxIndex;
UNI float MOD_offset;
UNI float MOD_maxDistance;

IN vec3 rndPos;
IN float rndOffset;


float MOD_rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
