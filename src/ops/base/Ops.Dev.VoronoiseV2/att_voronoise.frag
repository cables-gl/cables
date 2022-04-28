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
UNI float aspect;

{{CGL.BLENDMODES3}}
{{CGL.RANDOM_OLD}}

float rand(float n){return fract(sin(n) * 43.5453123);}
vec2 random2( vec2 p )
{
    return vec2(rand(p.x),rand(p.x+p.y));
}

void main() {

    vec3 color = vec3(.0);
    float m_dist = 1.;  // minimun distance
    vec2 m_point;        // minimum position
    float indexColor=0.0;

    vec2 coord=texCoord;

    coord.y/=aspect;

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

        float dist = distance(coord, pos);
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

    vec4 base=texture(tex,coord);

    outColor= cgl_blendPixel(base,vec4(color,1.0),amount);
}