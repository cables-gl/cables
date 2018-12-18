// adapted from https://thebookofshaders.com/12/

IN vec2 texCoord;

UNI bool drawIsoLines;
UNI bool drawDistance;
UNI int fill;
UNI float seed;

UNI float time;
UNI float movement;
UNI float amount;
UNI float centerSize;
UNI sampler2D tex;

{{BLENDCODE}}
{{LIB_RANDOM_OLD}}

float rand(float n){return fract(sin(n) * 43758.5453123);}
vec2 random2( vec2 p )
{
    return vec2(rand(p.x),rand(p.x+p.y));
}

void main() {

    vec3 color = vec3(.0);

    // Cell positions
    // vec2 point[5];
    // point[0] = vec2(0.83,0.75);
    // point[1] = vec2(0.60,0.07);
    // point[2] = vec2(0.28,0.64);
    // point[3] = vec2(0.31,0.26);
    // point[4] = vec2(mouseX,mouseY);

    float m_dist = 1.;  // minimun distance
    vec2 m_point;        // minimum position
    float indexColor=0.0;

    // const float NUM=21.0;

    // Iterate through the points positions
    for (float i = 0.0; i < NUM; i++)
    {
        vec2 pos= random2(vec2(i+seed,i+seed));

        pos.x+=sin(time+i)*movement;
        pos.y+=cos(time+i)*movement;

        if(i==0.0)
        {
            // pos=vec2(mouseX,mouseY);
        }

        float dist = distance(texCoord, pos);
        if( dist < m_dist )
        {
            // Keep the closer distance
            m_dist = dist;

            // Kepp the position of the closer point
            m_point = pos;
            indexColor=(i)/NUM;
        }
    }

    // tint acording the closest point position
    if(fill==1) color.rgb = vec3( indexColor );
    if(fill==2) color.rgb = vec3( m_point.x );
    if(fill==3) color.rgb = vec3( 0.5 );

    // Add distance field to closest point center
    if(drawDistance) color += m_dist*2.;

    // Show isolines
    if(drawIsoLines) color -= abs(sin(120.0*m_dist))*0.07;

    // Draw point center
    if(centerSize>0.0)
    color += 1.-step(centerSize/30.0, m_dist);


    vec4 base=texture(tex,texCoord);
    vec4 finalColor = vec4(color,1.0);
    finalColor = vec4( _blend( base.rgb, finalColor.rgb ) ,1.0);
    finalColor = vec4( mix( finalColor.rgb, base.rgb ,1.0-base.a*amount),1.0);


    outColor= finalColor;
}