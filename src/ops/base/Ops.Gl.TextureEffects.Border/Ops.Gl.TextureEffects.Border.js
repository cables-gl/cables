op.name='border';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var smooth=op.inValueBool("Smooth",false);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform float width;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+'uniform float aspect;'
    .endl()+'uniform bool smooth;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    
    .endl()+'if(!smooth)'
    .endl()+'{'
    
    .endl()+'   if( texCoord.x>1.0-width/3.0 || texCoord.y>1.0-width/aspect/3.0 || texCoord.y<width/aspect/3.0 || texCoord.x<width/3.0 ) col = vec4(r,g,b, 1.0);'
    .endl()+'   gl_FragColor = col;'
    .endl()+'} else {'    
    .endl()+'   float f=smoothstep(0.0,width,texCoord.x)-smoothstep(1.0-width,1.0,texCoord.x);'
    .endl()+'   f*=smoothstep(0.0,width/aspect,texCoord.y);'
    .endl()+'   f*=smoothstep(1.0,1.0-width/aspect,texCoord.y);'

    .endl()+'   gl_FragColor = mix(col,vec4(r,g,b, 1.0),1.0-f);'
    .endl()+'}'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var aspectUniform=new CGL.Uniform(shader,'f','aspect',0);
var uniSmooth=new CGL.Uniform(shader,'b','smooth',smooth);

{
    var width=op.addInPort(new Port(op,"width",OP_PORT_TYPE_VALUE,{display:'range'}));
    width.set(0.1);

    var uniWidth=new CGL.Uniform(shader,'f','width',width.get());

    width.onValueChange(function()
    {
        uniWidth.setValue(width.get()/2 );
    });
}

{
    // diffuse color

    var r=op.addInPort(new Port(op,"diffuse r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    r.onValueChanged=function()
    {
        if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
            else r.uniform.setValue(r.get());
    };

    var g=op.addInPort(new Port(op,"diffuse g",OP_PORT_TYPE_VALUE,{ display:'range' }));
    g.onValueChanged=function()
    {
        if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
            else g.uniform.setValue(g.get());
    };

    var b=op.addInPort(new Port(op,"diffuse b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.onValueChanged=function()
    {
        if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
            else b.uniform.setValue(b.get());
    };


    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());

}



render.onTriggered=function()
{
    if(CGL.TextureEffect.checkOpInEffect(op)) return;

var texture=cgl.currentTextureEffect.getCurrentSourceTexture();
aspectUniform.set(texture.height/texture.width);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
