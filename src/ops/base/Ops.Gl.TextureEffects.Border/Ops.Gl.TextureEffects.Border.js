op.name='border';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

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
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    .endl()+'   if( texCoord.x>1.0-width || texCoord.y>1.0-width || texCoord.y<width || texCoord.x<width ) col = vec4(r,g,b, 1.0);'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

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
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
