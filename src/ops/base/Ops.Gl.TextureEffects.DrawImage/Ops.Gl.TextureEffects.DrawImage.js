op.name='DrawImage';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var amount=op.addInPort(new Port(op,"amount",OP_PORT_TYPE_VALUE,{ display:'range' }));

var image=op.addInPort(new Port(op,"image",OP_PORT_TYPE_TEXTURE,{preview:true }));
var blendMode=CGL.TextureEffect.AddBlendSelect(op,"blendMode");

var imageAlpha=op.addInPort(new Port(op,"imageAlpha",OP_PORT_TYPE_TEXTURE,{preview:true }));
var alphaSrc=op.inValueSelect("alphaSrc",['alpha channel','luminance']);
var removeAlphaSrc=op.addInPort(new Port(op,"removeAlphaSrc",OP_PORT_TYPE_VALUE,{ display:'bool' }));

var invAlphaChannel=op.addInPort(new Port(op,"invert alpha channel",OP_PORT_TYPE_VALUE,{ display:'bool' }));


var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

blendMode.set('normal');
var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'drawimage');

amount.set(1.0);

var srcVert=''
    .endl()+'IN vec3 vPosition;'
    .endl()+'IN vec2 attrTexCoord;'
    .endl()+'IN vec3 attrVertNormal;'
    .endl()+'OUT vec2 texCoord;'
    .endl()+'OUT vec3 norm;'
    .endl()+'UNI mat4 projMatrix;'
    .endl()+'UNI mat4 mvMatrix;'

    .endl()+'UNI float posX;'
    .endl()+'UNI float posY;'
    .endl()+'UNI float scale;'
    .endl()+'UNI float rotate;'

    .endl()+'OUT mat3 transform;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   texCoord=attrTexCoord;'
    .endl()+'   norm=attrVertNormal;'

    .endl()+'   #ifdef TEX_TRANSFORM'
    .endl()+'     vec3 coordinates=vec3(attrTexCoord.x, attrTexCoord.y,1.0);'
    .endl()+'     float angle = radians( rotate );'
    .endl()+'     vec2 scale= vec2(scale,scale);'
    .endl()+'     vec2 translate= vec2(posX,posY);'

    .endl()+'     transform = mat3(   scale.x * cos( angle ), scale.x * sin( angle ), 0.0,'
    .endl()+'                           - scale.y * sin( angle ), scale.y * cos( angle ), 0.0,'
    .endl()+'                          - 0.5 * scale.x * cos( angle ) + 0.5 * scale.y * sin( angle ) - 0.5 * translate.x*2.0 + 0.5,  - 0.5 * scale.x * sin( angle ) - 0.5 * scale.y * cos( angle ) - 0.5 * translate.y*2.0 + 0.5, 1.0);'

    .endl()+'   #endif'

    .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
    .endl()+'}';



var srcFrag=''
    // .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  UNI sampler2D tex;'
    .endl()+'  UNI sampler2D image;'
    .endl()+'#endif'

    .endl()+'IN mat3 transform;'
    .endl()+'UNI float rotate;'
    +CGL.TextureEffect.getBlendCode()

    .endl()+'#ifdef HAS_TEXTUREALPHA'
    .endl()+'   UNI sampler2D imageAlpha;'
    .endl()+'#endif'

    .endl()+'UNI float amount;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 blendRGBA=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       vec2 tc=texCoord;'

    .endl()+'       #ifdef TEX_FLIP_X'
    .endl()+'           tc.x=1.0-tc.x;'
    .endl()+'       #endif'
    .endl()+'       #ifdef TEX_FLIP_Y'
    .endl()+'           tc.y=1.0-tc.y;'
    .endl()+'       #endif'

    .endl()+'       #ifdef TEX_TRANSFORM'
    .endl()+'           vec3 coordinates=vec3(tc.x, tc.y,1.0);'
    .endl()+'           tc=(transform * coordinates ).xy;'
    .endl()+'       #endif'

    .endl()+'       blendRGBA=texture2D(image,tc);'

    .endl()+'       vec3 blend=blendRGBA.rgb;'
    .endl()+'       vec4 baseRGBA=texture2D(tex,texCoord);'
    .endl()+'       vec3 base=baseRGBA.rgb;'

    .endl()+'       vec3 colNew=_blend(base,blend);'

    .endl()+'       #ifdef REMOVE_ALPHA_SRC'
    .endl()+'           blendRGBA.a=1.0;'
    .endl()+'       #endif'

    .endl()+'       #ifdef HAS_TEXTUREALPHA'
    .endl()+'           vec4 colImgAlpha=texture2D(imageAlpha,texCoord);'
    .endl()+'           float colImgAlphaAlpha=colImgAlpha.a;'

    .endl()+'           #ifdef ALPHA_FROM_LUMINANCE'
    .endl()+'               vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), colImgAlpha.rgb ));'
    .endl()+'               colImgAlphaAlpha=(gray.r+gray.g+gray.b)/3.0;'
    .endl()+'           #endif'

    .endl()+'           blendRGBA.a=colImgAlphaAlpha*blendRGBA.a;'
    .endl()+'       #endif'


    .endl()+'   #endif'

    .endl()+'   blendRGBA.rgb=mix( colNew, base ,1.0-blendRGBA.a*amount);'
    .endl()+'   blendRGBA.a=1.0;'


    .endl()+'   gl_FragColor = blendRGBA;'
    .endl()+'}';

shader.setSource(srcVert,srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','image',1);
var textureAlpha=new CGL.Uniform(shader,'t','imageAlpha',2);

invAlphaChannel.onValueChanged=function()
{
    if(invAlphaChannel.get()) shader.define('INVERT_ALPHA');
        else shader.removeDefine('INVERT_ALPHA');
};

removeAlphaSrc.onValueChanged=function()
{
    if(removeAlphaSrc.get()) shader.define('REMOVE_ALPHA_SRC');
        else shader.removeDefine('REMOVE_ALPHA_SRC');
};
removeAlphaSrc.set(true);

alphaSrc.onValueChanged=function()
{
    if(alphaSrc.get()=='luminance') shader.define('ALPHA_FROM_LUMINANCE');
        else shader.removeDefine('ALPHA_FROM_LUMINANCE');
};

alphaSrc.set("alpha channel");


{
    //
    // texture flip
    //
    var flipX=op.addInPort(new Port(op,"flip x",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    var flipY=op.addInPort(new Port(op,"flip y",OP_PORT_TYPE_VALUE,{ display:'bool' }));

    flipX.onValueChanged=function()
    {
        if(flipX.get()) shader.define('TEX_FLIP_X');
            else shader.removeDefine('TEX_FLIP_X');
    };

    flipY.onValueChanged=function()
    {
        if(flipY.get()) shader.define('TEX_FLIP_Y');
            else shader.removeDefine('TEX_FLIP_Y');
    };
}

{
    //
    // texture transform
    //
    var scale=op.addInPort(new Port(op,"scale",OP_PORT_TYPE_VALUE,{ display:'range' }));
    var posX=op.addInPort(new Port(op,"pos x",OP_PORT_TYPE_VALUE, {}));
    var posY=op.addInPort(new Port(op,"pos y",OP_PORT_TYPE_VALUE, {}));
    var rotate=op.addInPort(new Port(op,"rotate",OP_PORT_TYPE_VALUE, {}));

    scale.set(1.0);

    var uniScale=new CGL.Uniform(shader,'f','scale',scale.get());
    var uniPosX=new CGL.Uniform(shader,'f','posX',posX.get());
    var uniPosY=new CGL.Uniform(shader,'f','posY',posY.get());
    var uniRotate=new CGL.Uniform(shader,'f','rotate',rotate.get());

    function updateTransform()
    {
        if(scale.get()!=1.0 || posX.get()!=0.0 || posY.get()!=0.0 || rotate.get()!=0.0 )
        {
            if(!shader.hasDefine('TEX_TRANSFORM')) shader.define('TEX_TRANSFORM');
            uniScale.setValue( parseFloat(scale.get()) );
            uniPosX.setValue( posX.get() );
            uniPosY.setValue( posY.get() );
            uniRotate.setValue( rotate.get() );
        }
        else
        {
            // shader.removeDefine('TEX_TRANSFORM');
        }
    }

    scale.onChange=updateTransform;
    posX.onChange=updateTransform;
    posY.onChange=updateTransform;
    rotate.onChange=updateTransform;
}

blendMode.onValueChanged=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};


var amountUniform=new CGL.Uniform(shader,'f','amount',amount);


imageAlpha.onValueChanged=function()
{
    if(imageAlpha.get() && imageAlpha.get().tex) shader.define('HAS_TEXTUREALPHA');
        else shader.removeDefine('HAS_TEXTUREALPHA');
};



function doRender()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    if(image.get() && image.get().tex && amount.get()>0.0)
    {
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        if(image.get() && image.get().tex) cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );
            else cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);

        cgl.gl.activeTexture(cgl.gl.TEXTURE2);
        if(imageAlpha.get() && imageAlpha.get().tex) cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, imageAlpha.get().tex );
            else cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
}

render.onTriggered=doRender;
