
const exe=op.inFunction("Trigger");
const inTex=op.inTexture("Texture");

var outTexData=op.outTexture("Histogram Data");
var outTex=op.outTexture("Histogram Texture");

var cgl=op.patch.cgl;
var meshPoints=null;

var fb=new CGL.Framebuffer2(cgl,256,8,{isFloatingPointTexture:true});
fb.setFilter(CGL.Texture.FILTER_NEAREST);
var effect=null;

function initEffect()
{
    if(effect)effect.delete();
    // if(tex)tex.delete();

    effect=new CGL.TextureEffect(cgl,{"isFloatingPointTexture":false});

    var tex=new CGL.Texture(cgl,
        {
            "isFloatingPointTexture":false,
            "filter":CGL.Texture.FILTER_NEAREST,
            "wrap":CGL.Texture.WRAP_CLAMP_TO_EDGE,
            "width": 256,
            "height": 256,
        });


    effect.setSourceTexture(tex);
    outTex.set(null);
}


function setUpPointVerts()
{
    const geom=new CGL.Geometry();
    var res=256;
    var verts=[];
    var texCoords=[];
    verts.length=res*res*3;
    texCoords.length=res*res*2;
    for(var x=0;x<res;x++)
    {
        for(var y=0;y<res;y++)
        {
            i++;
            verts[i*3+2]=verts[i*3+1]=verts[i*3+0]=0;
            texCoords[i*2]=x/res;
            texCoords[i*2+1]=y/res;
        }
    }
    geom.setPointVertices(verts);
    geom.texCoords=texCoords;

    meshPoints=new CGL.Mesh(cgl,geom,cgl.gl.POINTS);
    meshPoints.setGeom(geom);
}

var shaderWave=new CGL.Shader(cgl,'imgcompose bg');
shaderWave.setSource(shaderWave.getDefaultVertexShader(),attachments.histogram_wave_frag);
shaderWave.textureUniform=new CGL.Uniform(shaderWave,'t','tex',2);

var shaderPointsR=new CGL.Shader(cgl,'histogram');
shaderPointsR.setSource(attachments.histogram_vert,attachments.histogram_frag);
shaderPointsR.textureUniform=new CGL.Uniform(shaderPointsR,'t','tex',0);
shaderPointsR.define("HISTOGRAM_R");

var shaderPointsG=new CGL.Shader(cgl,'histogram');
shaderPointsG.setSource(attachments.histogram_vert,attachments.histogram_frag);
shaderPointsG.textureUniform=new CGL.Uniform(shaderPointsG,'t','tex',0);
shaderPointsG.define("HISTOGRAM_G");

var shaderPointsB=new CGL.Shader(cgl,'histogram');
shaderPointsB.setSource(attachments.histogram_vert,attachments.histogram_frag);
shaderPointsB.textureUniform=new CGL.Uniform(shaderPointsB,'t','tex',0);
shaderPointsB.define("HISTOGRAM_B");

var shaderPointsLumi=new CGL.Shader(cgl,'histogram');
shaderPointsLumi.setSource(attachments.histogram_vert,attachments.histogram_frag);
shaderPointsLumi.textureUniform=new CGL.Uniform(shaderPointsLumi,'t','tex',0);
shaderPointsLumi.define("HISTOGRAM_LUMI");



setUpPointVerts();
initEffect();
var prevViewPort=[0,0,0,0];

exe.onTriggered=function()
{
    if(meshPoints && inTex.get())
    {
        var vp=cgl.getViewPort();
        prevViewPort[0]=vp[0];
        prevViewPort[1]=vp[1];
        prevViewPort[2]=vp[2];
        prevViewPort[3]=vp[3];

        // setup data
        fb.renderStart(cgl);



        /* --- */cgl.setTexture(0, inTex.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inTex.get().tex);

        meshPoints.render(shaderPointsR);
        meshPoints.render(shaderPointsG);
        meshPoints.render(shaderPointsB);
        meshPoints.render(shaderPointsLumi);
        
        fb.renderEnd(cgl);
        outTexData.set( fb.getTextureColor() );




        // render wave


    
        cgl.gl.blendFunc(cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA);
        cgl.currentTextureEffect=effect;
    
        effect.startEffect();

        cgl.setShader(shaderWave);
        cgl.currentTextureEffect.bind();
        /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
        
        /* --- */cgl.setTexture(2, fb.getTextureColor().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, fb.getTextureColor().tex);
    
    
        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    
        // texOut.set(effect.getCurrentSourceTexture());
        // texOut.set(effect.getCurrentTargetTexture());
        outTex.set(effect.getCurrentSourceTexture());
    
        effect.endEffect();
    
        cgl.setViewPort(prevViewPort[0],prevViewPort[1],prevViewPort[2],prevViewPort[3]);
    
    
        cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);
    
        cgl.currentTextureEffect=null;
        // cgl.popDepthTest();

    }


};
