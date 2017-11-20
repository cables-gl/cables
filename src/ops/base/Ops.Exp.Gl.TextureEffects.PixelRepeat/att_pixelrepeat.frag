IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D mask;


void main()
{
    vec4 col=vec4(0.0,0.0,0.0,1.0);
    
    col=texture2D(tex, texCoord);
    float m=texture2D(mask, texCoord).r;
    
    if(m>0.0)col=texture2D(tex, vec2(texCoord.x+m*0.1,texCoord.y) );
    
    
    outColor=col;
    
}

// .endl()+'precision highp float;'
// .endl()+'  IN vec2 texCoord;'
// .endl()+'  uniform sampler2D tex;'
// .endl()+'  uniform float dirX;'
// .endl()+'  uniform float dirY;'
// .endl()+'  uniform float amount;'

// .endl()+'  #ifdef HAS_MASK'
// .endl()+'    uniform sampler2D imageMask;'
// .endl()+'  #endif'


// .endl()+''
// .endl()+'float random(vec3 scale, float seed)'
// .endl()+'{'
// .endl()+'    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);'
// .endl()+'}'
// .endl()+''
// .endl()+'void main()'
// .endl()+'{'
// .endl()+'    vec4 color = vec4(0.0);'
// .endl()+'    float total = 0.0;'

// .endl()+'   float am=amount;'
// .endl()+'   #ifdef HAS_MASK'
// .endl()+'       am=amount*texture2D(imageMask,texCoord).r;'
// .endl()+'       if(am<=0.02)'
// .endl()+'       {'
// .endl()+'           gl_FragColor=texture2D(tex, texCoord);'
// // .endl()+'           gl_FragColor.r=1.0;'

// .endl()+'           return;'
// .endl()+'       }'
// .endl()+'   #endif'

// .endl()+'   vec2 delta=vec2(dirX*am*0.01,dirY*am*0.01);'


// .endl()+'    '
// // .endl()+'    /* randomize the lookup values to hide the fixed number of samples */'
// .endl()+'    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);'


// .endl()+'    #ifndef FASTBLUR'
// .endl()+'    const float range=20.0;'
// .endl()+'    #endif'
// .endl()+'    #ifdef FASTBLUR'
// .endl()+'    const float range=5.0;'
// .endl()+'    #endif'

// .endl()+'    for (float t = -range; t <= range; t++) {'
// .endl()+'        float percent = (t + offset - 0.5) / range;'
// .endl()+'        float weight = 1.0 - abs(percent);'
// .endl()+'        vec4 smpl = texture2D(tex, texCoord + delta * percent);'
// .endl()+'        '
// // .endl()+'        /* switch to pre-multiplied alpha to correctly blur transparent images */'
// .endl()+'        smpl.rgb *= smpl.a;'

// .endl()+'        color += smpl * weight;'
// .endl()+'        total += weight;'
// .endl()+'    }'

// .endl()+'    gl_FragColor = color / total;'

// // .endl()+'    /* switch back from pre-multiplied alpha */'
// .endl()+'    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;'
// .endl()+'}';