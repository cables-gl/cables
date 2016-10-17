precision highp float;

varying vec2 texCoord;
uniform float amount;
uniform float pos;

uniform vec3 colA;
uniform vec3 colB;
uniform vec3 colC;
uniform sampler2D tex;

{{BLENDCODE}}

void main()
{
    vec4 base=texture2D(tex,texCoord);
    vec4 col;

    float ax=texCoord.x;

    #ifdef GRAD_Y
        ax=texCoord.y;
    #endif
    #ifdef GRAD_XY
        ax=(texCoord.x+texCoord.y)/2.0;
    #endif
    #ifdef GRAD_RADIAL
        ax=distance(texCoord,vec2(0.5,0.5))*2.0;
    #endif

    #ifndef GRAD_SMOOTHSTEP
        if(ax<=pos) col = vec4(mix(colA, colB, ax*1.0/pos),1.0);
            else col = vec4(mix(colB, colC, min(1.0,(ax-pos)*1.0/(1.0-pos))),1.0);
    #endif

    #ifdef GRAD_SMOOTHSTEP
        if(ax<=pos) col = vec4(mix(colA, colB, smoothstep(0.0,1.0,ax*1.0/pos)),1.0);
            else col = vec4(mix(colB, colC, smoothstep(0.0,1.0,min(1.0,(ax-pos)*1.0/(1.0-pos)))),1.0);
        // ax=smoothstep(0.0,1.0,ax);
    #endif





   col=vec4( _blend(base.rgb,col.rgb) ,1.0);
   col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);

   gl_FragColor=col;

}
