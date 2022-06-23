UNI vec3 MOD_pathPoints[PATHFOLLOW_POINTS];

IN vec3 rndPos;
IN float rndOffset;


float MOD_rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
