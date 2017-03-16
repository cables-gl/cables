// adapted from https://thebookofshaders.com/12/

varying vec2 texCoord;
// uniform vec2 u_resolution;
// uniform float mouseX;
// uniform float mouseY;
// uniform float u_time;

uniform bool drawIsoLines;
uniform bool drawDistance;
uniform int fill;
uniform float seed;

uniform float time;
uniform float movement;
uniform float amount;
uniform float centerSize;
uniform sampler2D tex;

{{BLENDCODE}}

vec2 random2( vec2 p )
{
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
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
        if ( dist < m_dist )
        {
            // Keep the closer distance
            m_dist = dist;

            // Kepp the position of the closer point
            m_point = pos;
            indexColor=float(i)/NUM;
        }
    }

    // tint acording the closest point position
    if(fill==1) color.rgb = vec3( indexColor );
    if(fill==2) color.rgb = vec3( m_point.x );

    // Add distance field to closest point center 
    if(drawDistance) color += m_dist*2.;

    // Show isolines
    if(drawIsoLines) color -= abs(sin(120.0*m_dist))*0.07;

    // Draw point center
    if(centerSize>0.0)
    color += 1.-step(centerSize/30.0, m_dist);


    vec4 base=texture2D(tex,texCoord);
    vec4 finalColor = vec4(color,1.0);
    finalColor = vec4( _blend( base.rgb, finalColor.rgb ) ,1.0);
    finalColor = vec4( mix( finalColor.rgb, base.rgb ,1.0-base.a*amount),1.0);


    gl_FragColor = finalColor;
}