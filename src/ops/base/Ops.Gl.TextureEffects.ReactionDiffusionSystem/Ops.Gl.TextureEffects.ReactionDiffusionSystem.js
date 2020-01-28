// Author: action
// based on Reaction-Diffusion by Karl Sims

const render = op.inTrigger("render");
const reset = op.inTriggerButton("reset");
const trigger = op.outTrigger('trigger');
const draw = op.outTrigger('draw');
const outTex = op.outTexture("Texture");


// Texture
const inVPSize = op.inValueBool("Use Viewport Size", true);
const inWidth = op.inValueInt("Width", 512);
const inHeight = op.inValueInt("Height", 512);


inVPSize.onChange = updateSizePorts;
inWidth.onChange = inHeight.onChange = initFbLater;
updateSizePorts();


op.setPortGroup("Texture Size",[inVPSize, inWidth, inHeight]);


// op.toWorkPortsNeedToBeLinked(outTex);

// Speed
const rdsSpeeed = op.inValueSlider("speed", 4);

// Pressets
const rdyMode = op.inValueSelect("RD Mode",['Default', 'Mitosis', 'Coral', 'Worms', 'Custom'], 'Default');

op.setPortGroup("Reaction Diffusion",[rdsSpeeed, rdyMode]);

// RDY presets.
const rdyPresets = {
    'Default' : {
        feed: 0.055,
        kill: 0.062,
        delta: 1,
        ratioA: 1,
        ratioB: 0.5
    },
    'Mitosis': {
        feed: 0.0367,
        kill: 0.0649,
        delta: 1,
        ratioA: 1,
        ratioB: 0.43
    },
    'Coral': {
        feed: 0.07,
        kill: 0.062,
        delta: 1,
        ratioA: 1,
        ratioB: 0.475
    },
    'Worms': {
        feed: 0.042,
        kill: 0.062,
        delta: 1,
        ratioA: 1,
        // ratioB: 0.608
        ratioB: 0.560
    }
};

// Values
const rdsFeed = op.inValueSlider("feed");
const rdyKill = op.inValueSlider("kill");
const rdyDelta = op.inValueSlider("delta");
const rdydA = op.inValueSlider("Ratio A");
const rdydB = op.inValueSlider("Ratio B");

rdyMode.onChange = setRDYPressetValues;


op.setPortGroup("Custom values",[rdsFeed, rdyKill, rdyDelta, rdydA, rdydB]);

// -- interface


const cgl = op.patch.cgl;

var prevViewPort=[0,0,0,0];

// FBO
var fb = null;
var needInit = true;
var lastTex = null;

var mesh = CGL.MESHES.getSimpleRect(cgl, "shader2texture rect");


// Create RD shader
const shader = new CGL.Shader(cgl,"reactiondiffusion");
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.setSource(attachments.rds_vert,attachments.rds_frag);

// Set uniforms
const rdsFeedUni = new CGL.Uniform(shader,'f','f',rdsFeed);
const rdyKillUni = new CGL.Uniform(shader,'f','k',rdyKill);
const rdyDeltaUni = new CGL.Uniform(shader,'f','dt',rdyDelta);
const rdydAUni = new CGL.Uniform(shader,'f','dA',rdydA);
const rdydBUni = new CGL.Uniform(shader,'f','dB',rdydB);

const flipTextureUni = new CGL.Uniform(shader,'i','flipTexture', 0);

const screenW = new CGL.Uniform(shader,'f','screenWidth', inWidth);
const screenH = new CGL.Uniform(shader,'f','screenHeight', inHeight);


setRDYPressetValues();


render.onTriggered = doRender;
reset.onTriggered = initFbLater;

function setRDYPressetValues() {
    var presset = rdyPresets[rdyMode.get()];

    if (presset === undefined) {
        rdsFeed.setUiAttribs({greyout:false});
        rdyKill.setUiAttribs({greyout:false});
        rdyDelta.setUiAttribs({greyout:false});
        rdydA.setUiAttribs({greyout:false});
        rdydB.setUiAttribs({greyout:false});
    }
    else {
        rdsFeed.setUiAttribs({greyout:true});
        rdyKill.setUiAttribs({greyout:true});
        rdyDelta.setUiAttribs({greyout:true});
        rdydA.setUiAttribs({greyout:true});
        rdydB.setUiAttribs({greyout:true});

        rdsFeed.set(presset.feed);
        rdyKill.set(presset.kill);
        rdyDelta.set(presset.delta);
        rdydA.set(presset.ratioA);
        rdydB.set(presset.ratioB);
    }
}

function updateSizePorts() {
    if(inVPSize.get()) {
        inWidth.setUiAttribs({greyout:true});
        inHeight.setUiAttribs({greyout:true});
    } else {
        inWidth.setUiAttribs({greyout:false});
        inHeight.setUiAttribs({greyout:false});
    }

    initFbLater();
}

function initFbLater()
{
    needInit = true;
}

function initFb() {
    needInit = false;
    if(fb)fb.delete();
    fb = null;

    var w = inWidth.get();
    var h = inHeight.get();

    // var filter = CGL.Texture.FILTER_NEAREST;
    var filter = CGL.Texture.FILTER_LINEAR;
    // var filter = CGL.Texture.FILTER_MIPMAP;
    // if(tfilter.get()=='linear') filter=CGL.Texture.FILTER_LINEAR;
    //     else if(tfilter.get()=='mipmap') filter=CGL.Texture.FILTER_MIPMAP;

    var selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    // if(twrap.get()=='repeat') selectedWrap=CGL.Texture.WRAP_REPEAT;
    // if(twrap.get()=='mirrored repeat') selectedWrap=CGL.Texture.WRAP_MIRRORED_REPEAT;

    if(inVPSize.get())
    {
        // inWidth.setUiAttribs({hidePort:true, greyout:true});
        // inHeight.setUiAttribs({hidePort:true, greyout:true});

        w = cgl.getViewPort()[2];
        h = cgl.getViewPort()[3];
        inWidth.set(w);
        inHeight.set(h);
    }

    // update UNI
    screenW.set(w);
    screenH.set(h);

    if(cgl.glVersion>=2)
    {
        fb = new CGL.Framebuffer2(cgl,w,h,
        {
            isFloatingPointTexture: true, // important
            multisampling: false,
            wrap: selectedWrap,
            filter: filter,
            depth: false,
            multisamplingSamples:0,
            clear: true
        });
    }
    else
    {
        fb = new CGL.Framebuffer(cgl,inWidth.get(),inHeight.get(),
        {
            isFloatingPointTexture: true,
            filter: filter,
            wrap: selectedWrap
        });
    }
}

function doRenderStep(intexture, i) {
    fb.renderStart(cgl);


    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);
    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);
    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    cgl.setTexture(0, intexture);

    mesh.render(shader);

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();


    // if (i === rdsSpeeed.get()-1)
    if (i === 0)
        draw.trigger();

    fb.renderEnd(cgl);

    return fb.getTextureColor();

}

function doRender() {
    if(!shader)return;

    var vp = cgl.getViewPort();
    if(!fb || needInit ) initFb();
    if(inVPSize.get() && fb && ( vp[2]!=fb.getTextureColor().width || vp[3]!=fb.getTextureColor().height ) ) {
        initFb();
    }

    prevViewPort[0]=vp[0];
    prevViewPort[1]=vp[1];
    prevViewPort[2]=vp[2];
    prevViewPort[3]=vp[3];

    cgl.setShader(shader);

    var swapTexture, sourceTexture = fb.getTextureColor();
    for (var i = 0; i < rdsSpeeed.get(); i++) {
        swapTexture = doRenderStep(sourceTexture.tex, i)
        sourceTexture = swapTexture;
    }


    cgl.setPreviousShader();

    cgl.gl.viewport(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

    outTex.set(swapTexture);

    trigger.trigger();
}

