IN vec2 texCoord;
IN vec4 posi;

UNI sampler2D texOldPos;
UNI sampler2D texSpawnPos;
UNI sampler2D texTiming;
UNI sampler2D texFeedbackVel;
// UNI sampler2D texSpawnVel;

#ifdef HAS_TEX_SPAWNDIR
    UNI sampler2D texSpawnDir;
#endif
UNI sampler2D texVelocity;
UNI sampler2D texPassThrough1;
UNI sampler2D texPassThrough2;
UNI sampler2D texFeedbackMisc;

#ifdef HAS_TEX_LIFETIME
    UNI sampler2D texLifeTime;
#endif
#ifdef HAS_TEX_MASS
    UNI sampler2D texMass;
#endif

UNI vec3 position;
UNI vec2 mass;
UNI float reset;
UNI vec4 paramsTime;

UNI vec3 scale;
UNI vec3 gravity;
UNI vec2 lifeTime;
UNI vec4 velocity; // xyz: xyz  / w: inherit velocity


const vec3 outOfScreenPos=vec3(99999.0);

{{MODULES_HEAD}}
{{CGL.RANDOM_LOW}}

void main()
{
    vec4 oldPos=texture(texOldPos,texCoord);
    vec4 vtiming=texture(texTiming,texCoord);
    vec4 _velocityTex=texture(texVelocity,texCoord);
    vec4 oldVelocity=texture(texFeedbackVel,texCoord);
    vec4 miscParams=texture(texFeedbackMisc,texCoord);
    vec4 newPos=oldPos;

    float time=paramsTime.x;
    float timeDiff=paramsTime.y;
    float spawnRate=paramsTime.z;
    float spawnEnergy=paramsTime.w;

    vtiming.r-=timeDiff;


    vec4 velocityTex=_velocityTex;
    if(isnan(velocityTex.r))velocityTex=vec4(0.0);


    // respawn!!
    #ifdef STATICLIFE

        if(floor(miscParams.g)==0.0 || reset==1.0)
    #endif
    if(
            #ifdef RESPAWN
                vtiming.r<=0.0  ||
            #endif

            isnan(vtiming.r) ||
            isnan(vtiming.g) ||
            reset==1.0 )
    {
        #ifndef STATICLIFE
        if(cgl_random(texCoord*time) > spawnRate || reset==1.0 ) //
        {
            timeDiff=0.001;
            newPos.a=0.0;
        }
        else
        #endif
        {
            velocityTex.rgb=vec3(0.0);

            newPos.rgb=posi.rgb+position;


            vec3 rnd=cgl_random3(texCoord+gl_FragCoord.x/gl_FragCoord.y+time);
            #ifdef NORANDOMIZESPAWN
                rnd=texCoord.xyy;
            #endif

            vec4 posCol=texture(texSpawnPos,rnd.xy);

            if(
                posCol.a==0.0 ||
                (posCol.x==0.0 && posCol.y==0.0 && posCol.z==0.0)
                )newPos=vec4(99999.0);


            if(posCol.a<1.0)posCol.rgb=vec3(99999.0);

            // if(posCol.x==0.0 && posCol.y==0.0 && posCol.z==0.0) posCol.a=0.0;
            vtiming.ba=rnd.xy;// tex coords of particle

            // oldVelocity=texture(texSpawnVel,texCoord);

            rnd=posCol.rgb;
            newPos.rgb+=rnd;
            newPos.a=posCol.a;


            float lt=0.0;
            #ifdef HAS_TEX_LIFETIME
                lt=texture(texLifeTime,vtiming.ba).r;
            #endif
            #ifndef HAS_TEX_LIFETIME
                vec2 _lifeTime=lifeTime.xy;
                lt=(cgl_random(time*texCoord)*(_lifeTime.y-_lifeTime.x))+_lifeTime.x;
            #endif

            #ifdef STATICLIFE
                lt=0.0;
            #endif
            vtiming.g=
            vtiming.r=lt;



            miscParams.r=spawnEnergy; // spawn dir energy
            miscParams.g=floor(miscParams.g)+1.0;
            if(reset==1.0)miscParams.g=0.0;

            // if(reset==1.0)
            //     vtiming.g=
            //     vtiming.r=(cgl_random(time*texCoord)*(_lifeTime.y-_lifeTime.x))+_lifeTime.x;

        }
    }


    #ifdef HAS_TEX_SPAWNDIR
        vec4 spawnDir=texture(texSpawnDir,vtiming.ba);
    #endif



    float lifeProgress = vtiming.r / vtiming.g;
    #ifdef STATICLIFE
    lifeProgress=0.5;
    #endif
    if(lifeProgress>1.0)newPos.a=0.0;


    float m=0.0;
    #ifdef HAS_TEX_MASS
        m=texture(texMass,vtiming.ba).r;
    #endif
    #ifndef HAS_TEX_MASS
        m=mix(mass.x,mass.y,cgl_random(texCoord));
    #endif

    miscParams.r-=timeDiff*m;
    miscParams.r=max(0.0,miscParams.r);

    vec4 gravityVelocity=vec4(gravity*m*(vtiming.g-vtiming.r)*timeDiff,1.0); // gravity // (time-vtiming.r)??
    vec3 finalvelocity=gravityVelocity.xyz;

    finalvelocity+=(velocity.xyz+velocityTex.xyz)*timeDiff;

    #ifdef HAS_TEX_SPAWNDIR
        finalvelocity+=spawnDir.xyz*(1.0/m)*miscParams.r*timeDiff;
    #endif

    newPos.rgb+=finalvelocity.xyz*newPos.a;

    if(newPos.a<=0.001)
    {
        newPos=vec4(0.0);
        // newPos.rgb=outOfScreenPos;
        finalvelocity=vec3(0.0);
    }

    if(isnan(newPos.r))newPos.rgb=outOfScreenPos;

    #ifdef STATICLIFE
        lifeProgress=mod(lifeProgress,1.0);
    #endif



    // gl_Position
    // r:x
    // g:y
    // b:z
    outColor0=newPos;

    // timing internally
    // r: remaining time
    // g: length of life
    // ba: tex coords of particle
    outColor1=vtiming;

    // timing output - for user
    // rgb: life progress

    outColor2=vec4(vec3(lifeProgress),1.);

    // velocity
    outColor3=velocityTex+velocity;


    outColor4=texture(texPassThrough1,vtiming.ba);

    // absolute/ finalvelocity
    outColor5=vec4(normalize(finalvelocity),1.0);

    // misc params /
    // x: energy
    outColor6=miscParams;


    outColor7=texture(texPassThrough2,vtiming.ba);

}



