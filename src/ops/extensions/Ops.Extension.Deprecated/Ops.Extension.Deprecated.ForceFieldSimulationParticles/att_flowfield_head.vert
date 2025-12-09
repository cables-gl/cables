#define NUM_FORCES 80

IN vec3 rndpos;
OUT vec3 col;

UNI vec3 MOD_emitterPos;

UNI float MOD_time;
UNI float MOD_sizeX;
UNI float MOD_sizeY;
UNI float MOD_sizeZ;
UNI float MOD_timeDiff;
UNI float MOD_lifeTime;
UNI float MOD_fadeinout;
UNI float MOD_spawnTo;
UNI float MOD_spawnFrom;


IN float timeOffset;

IN vec3 life;
OUT vec3 outLife;

IN vec3 inPos;
OUT vec3 outPos;

struct force
{
    vec3 pos;
    float attraction;
    float angle;
    float range;
    float time;
};


UNI force forces[NUM_FORCES];

UNI vec3 MOD_spawnPositions[32];
UNI float MOD_numSpawns;



float random(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
