UNI sampler2D tex;
UNI float anim;

UNI float scale;
UNI float repeat;

UNI float scrollX;
UNI float scrollY;

UNI float amount;

UNI bool layer1;
UNI bool layer2;
UNI bool layer3;
UNI bool layer4;

UNI float aspect;

IN vec2 texCoord;


{{BLENDCODE}}

// adapted from warp shader by inigo quilez/iq
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// See here for a tutorial on how to make this: http://www.iquilezles.org/www/articles/warp/warp.htm

const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

float noise( in vec2 x )
{
	return sin(1.5*x.x)*sin(1.5*x.y);
}

float fbm4( vec2 p )
{
    float f = 0.0;
    f += 0.5000*noise( p ); p = m*p*2.02;
    f += 0.2500*noise( p ); p = m*p*2.03;
    f += 0.1250*noise( p ); p = m*p*2.01;
    f += 0.0625*noise( p );
    return f/0.9375;
}

float fbm6( vec2 p )
{
    float f = 0.0;
    f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;
    f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;
    f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;
    f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;
    f += 0.031250*(0.5+0.5*noise( p )); p = m*p*2.01;
    f += 0.015625*(0.5+0.5*noise( p ));
    return f/0.96875;
}

void main()
{
    // vec4 col=texture2D(tex,texCoord+2.0*fbm4(texCoord+2.0*fbm6(texCoord+anim)));

    vec2 p=(texCoord-0.5)*scale;
    p.y/=aspect;
    vec2 q = vec2( fbm4( p + vec2(0.3+scrollX,0.20+scrollY) ),
                   fbm4( p + vec2(3.1+scrollX,1.3+scrollY) ) );

    vec2 q2 = vec2( fbm4( p + vec2(2.0+scrollX,1.0+scrollY) ),
                   fbm4( p + vec2(3.1+scrollX,1.3+scrollY) ) );

    vec2 q3 = vec2( fbm4( p + vec2(9.0+scrollX,4.0+scrollY) ),
                   fbm4( p + vec2(3.1+scrollX,4.3+scrollY) ) );



    float v= fbm4( ( p + 4.0*q +anim*0.1)*repeat);
    float v2= fbm4( (p + 4.0*q2 +anim*0.1)*repeat );
    
    float v3= fbm6( (p + 4.0*q3 +anim*0.1)*repeat );
    float v4= fbm6( (p + 4.0*q2 +anim*0.1)*repeat );


    // vec4 col=vec4( vec3( fbm4(( texCoord + fbm6(texCoord*anim) ) )) ,1.0 );
    // outColor = vec4(vec3(fbm6(texCoord)),1.0);
    
    
    vec4 base=texture2D(tex,texCoord);

    vec4 finalColor;
    float colVal=0.0;
    float numLayers=0.0;
    
    if(layer1)
    {
        colVal+=v;
        numLayers++;
    }
    
    if(layer2)
    {
        colVal+=v2;
        numLayers++;
    }
    
    if(layer3)
    {
        colVal+=v3;
        numLayers++;
    }

    if(layer4)
    {
        colVal+=v4;
        numLayers++;
    }
    

    // finalColor=vec4( vec3(v3)*1.0,1.0);
    // finalColor=vec4( vec3(v3+v2)/2.0,1.0);
    // finalColor=vec4( vec3(v+v2+v4+v3)/4.0,1.0);
    
    finalColor=vec4( vec3(colVal/numLayers),1.0);
    

    finalColor = vec4( _blend( base.rgb, finalColor.rgb ) ,1.0);
    finalColor = vec4( mix( finalColor.rgb, base.rgb ,1.0-base.a*amount),1.0);


    outColor = finalColor;


    // outColor=vec4( v2,v,v4,1.0);
    // outColor=vec4( vec3(q.x+q.y),1.0);
    
    // outColor=texture2D(tex,vec2(v,v2));
}
