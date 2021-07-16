// UNI float time;

UNI sampler2D tex;
UNI sampler2D texSpawnCoords;
UNI sampler2D texLifetimes;

IN vec2 texCoord;

void main()
{
    vec4 col=texture(tex,texCoord);

    float lifeTime=texture(texLifetimes,texCoord).r;


    // do respawn!
    if(lifeTime>0.9)
    {
        col=texture(texSpawnCoords,texCoord);
    }

    col.a=1.0;

    outColor= col;

}