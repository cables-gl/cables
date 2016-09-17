op.name="ToneMap";

var render=op.inFunction("Render");
var trigger=op.outFunction("Trigger");
var method=op.inValueSelect("Method",["Linear","Reinhard","Hejl Dawson","Uncharted"],"Linear");
var exposure=op.inValue("Exposure");
var cgl=op.patch.cgl;

var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

method.onChange=function()
{
        

    if(method.get()=="Hejl Dawson") shader.define('METHOD_HEJLDAWSON');
        else shader.removeDefine('METHOD_HEJLDAWSON');

    if(method.get()=="Uncharted") shader.define('METHOD_UNCHARTED');
        else shader.removeDefine('METHOD_UNCHARTED');

    if(method.get()=="Reinhard") shader.define('METHOD_REINHARD');
        else shader.removeDefine('METHOD_REINHARD');

    if(method.get()==="" || method.get()=="Linear" ) shader.define('METHOD_LINEAR');
        else shader.removeDefine('METHOD_LINEAR');
};


var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform sampler2D texture;'
    .endl()+'uniform float exposure;'

    .endl()+'#ifdef METHOD_LINEAR'
    .endl()+'   void main()'
    .endl()+'   {'
    .endl()+'      vec3 col = texture2D(texture, texCoord ).rgb*exposure;'
    .endl()+'     '
    .endl()+'     gl_FragColor = vec4( pow(col,vec3(1.0/2.2)) ,1.0);'
    .endl()+'   }'
    .endl()+'#endif'

    .endl()+'#ifdef METHOD_REINHARD'
    .endl()+'   void main()'
    .endl()+'   {'
    .endl()+'      vec3 col = texture2D(texture, texCoord ).rgb*exposure;'
    .endl()+'     '
    .endl()+'      col = col/(1.0+col);'

    .endl()+'     gl_FragColor = vec4( pow(col,vec3(1.0/2.2)) ,1.0);'
    .endl()+'   }'
    .endl()+'#endif'
    
    
    .endl()+'#ifdef METHOD_HEJLDAWSON'
    .endl()+'   void main()'
    .endl()+'   {'
    .endl()+'      vec3 col = texture2D(texture, texCoord ).rgb*exposure;'
    .endl()+'     '
    .endl()+'     vec3 x=max(vec3(0),col-0.004);'
    
    .endl()+'     gl_FragColor = vec4( (x*(6.2*x+.5))/(x*(6.2*x+1.7)+0.06) ,1.0);'
    .endl()+'   }'
    .endl()+'#endif'



    .endl()+'#ifdef METHOD_UNCHARTED'
    .endl()+'   float A = 0.15;'
    .endl()+'   float B = 0.50;'
    .endl()+'   float C = 0.10;'
    .endl()+'   float D = 0.20;'
    .endl()+'   float E = 0.02;'
    .endl()+'   float F = 0.30;'
    .endl()+'   float W = 11.2;'
    
    .endl()+'   vec3 uncharted2Tonemap(vec3 x)'
    .endl()+'   {'
    .endl()+'     return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;'
    .endl()+'   }'
    
    .endl()+'   void main()'
    .endl()+'   {'
    .endl()+'      vec3 col = texture2D(texture, texCoord ).rgb*exposure;'
    
    .endl()+'     float exposureBias = 2.0;'
    .endl()+'     vec3 curr = uncharted2Tonemap(exposureBias*col);'
    
    .endl()+'     vec3 whiteScale = 1.0/uncharted2Tonemap(vec3(W));'
    .endl()+'     vec3 color = curr*whiteScale;'
    
    .endl()+'     vec3 retColor = pow(color,vec3(1.0/2.2));'
    .endl()+'     '
    .endl()+'     gl_FragColor = vec4(retColor,1.0);'
    .endl()+'   }'
    .endl()+'#endif';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
shader.define('METHOD_LINEAR');
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniExposure=new CGL.Uniform(shader,'f','exposure',exposure);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);

    cgl.currentTextureEffect.bind();
    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();

    cgl.setPreviousShader();
    trigger.trigger();
};


