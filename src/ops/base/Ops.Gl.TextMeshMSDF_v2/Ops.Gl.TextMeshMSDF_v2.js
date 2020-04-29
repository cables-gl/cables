// https://soimy.github.io/msdf-bmfont-xml/

// antialiasing:
// https://github.com/Chlumsky/msdfgen/issues/22

const
    render=op.inTrigger("Render"),
    str=op.inString("Text","cables"),
    inFont=op.inDropDown("Font",[],"",true),
    scale=op.inFloat("Scale",0.25),

    letterSpace=op.inFloat("Letter Spacing",0),
    lineHeight=op.inFloat("Line Height",1),

    align=op.inSwitch("Align",['Left','Center','Right'],'Center'),
    valign=op.inSwitch("Vertical Align",['Top','Middle','Bottom'],'Middle'),

    r = op.inValueSlider("r", 1),
    g = op.inValueSlider("g", 1),
    b = op.inValueSlider("b", 1),
    a = op.inValueSlider("a", 1),
    doSDF=op.inBool("SDF",true),

    inBorder = op.inBool("Border", false),
    inBorderWidth=op.inFloatSlider("Border Width",0.5),
    inBorderSmooth=op.inFloatSlider("Smoothness",0.25),
    br = op.inValueSlider("Border r", 1),
    bg = op.inValueSlider("Border g", 1),
    bb = op.inValueSlider("Border b", 1),

    inShadow = op.inBool("Shadow", false),

    inTexColor=op.inTexture("Texture Color"),
    inTexMask=op.inTexture("Texture Mask"),

    inPosArr=op.inArray("Positions"),
    inScaleArr=op.inArray("Scalings"),
    inRotArr=op.inArray("Rotations"),

    next=op.outTrigger("Next"),
    outArr=op.outArray("Positions Original"),
    outLines=op.outNumber("Num Lines"),

    outWidth=op.outNumber("Width"),
    outHeight=op.outNumber("Height"),
    outStartY=op.outNumber("Start Y"),
    outNumChars=op.outNumber("Num Chars");


op.setPortGroup('Size',[letterSpace,lineHeight,scale]);
op.setPortGroup("Character Transformations",[inScaleArr,inRotArr,inPosArr]);

op.setPortGroup('Alignment',[align,valign]);
op.setPortGroup('Color',[r,g,b,a,doSDF]);
op.setPortGroup('Border',[br,bg,bb,inBorderSmooth,inBorderWidth,inBorder]);
r.setUiAttribs({ colorPick: true });
br.setUiAttribs({ colorPick: true });

const cgl=op.patch.cgl;
const fontDataVarPrefix="font_data_";
const substrLength=fontDataVarPrefix.length;
const alignVec=vec3.create();
const vScale=vec3.create();
const shader=new CGL.Shader(cgl,'TextMeshSDF');

var fontTexs=null;
var fontData=null;
var fontChars=null;
var needUpdate=true;
var geom=null;
var mesh=null;
var disabled=false;
var valignMode=1;
var heightAll=0,widthAll=0;

var offY=0;
var minY,maxY,minX,maxX;
var needsUpdateTransmats=true;
var transMats=null;


if (cgl.glVersion == 1)
{
    cgl.gl.getExtension("OES_standard_derivatives");
    shader.enableExtension("GL_OES_standard_derivatives");
}

shader.setSource(attachments.textmeshsdf_vert,attachments.textmeshsdf_frag);

const
    uniTex=new CGL.Uniform(shader,'t','tex0',0),
    uniTex1=new CGL.Uniform(shader,'t','tex1',1),
    uniTex2=new CGL.Uniform(shader,'t','tex2',2),
    uniTex3=new CGL.Uniform(shader,'t','tex3',3),
    uniTexMul=new CGL.Uniform(shader,'t','texMulColor',4),
    uniTexMulMask=new CGL.Uniform(shader,'t','texMulMask',5),
    uniColor=new CGL.Uniform(shader,'4f','color',r,g,b,a),
    uniColorBorder=new CGL.Uniform(shader,'3f','colorBorder',br,bg,bb),

    uniTexSize=new CGL.Uniform(shader,'2f','texSize',0,0),
    uniborderSmooth=new CGL.Uniform(shader,'f','borderSmooth',inBorderSmooth),
    uniborderWidth=new CGL.Uniform(shader,'f','borderWidth',inBorderWidth);



scale.onChange=updateScale;

inRotArr.onChange=
    inPosArr.onChange=
    inScaleArr.onChange=function(){ needsUpdateTransmats=true;};


inTexColor.onChange=
inTexMask.onChange=
inShadow.onChange=
inBorder.onChange=
doSDF.onChange=
    updateDefines;

updateDefines();
updateScale();


align.onChange=
    str.onChange=
    letterSpace.onChange=
    lineHeight.onChange=
    function()
    {
        needUpdate=true;
    };

valign.onChange=updateAlign;

op.patch.addEventListener("variablesChanged",updateFontList);
op.patch.addEventListener("FontLoadedMSDF",updateFontList);

inFont.onChange=updateFontData;

updateFontList();

function updateDefines()
{
    shader.toggleDefine("SDF",doSDF.get());
    shader.toggleDefine("SHADOW",inShadow.get());
    shader.toggleDefine("BORDER",inBorder.get());
    shader.toggleDefine("TEXTURE_COLOR",inTexColor.isLinked());
    shader.toggleDefine("TEXTURE_MASK",inTexMask.isLinked());

    br.setUiAttribs({ greyout: !inBorder.get() });
    bg.setUiAttribs({ greyout: !inBorder.get() });
    bb.setUiAttribs({ greyout: !inBorder.get() });
    inBorderSmooth.setUiAttribs({ greyout: !inBorder.get() });
    inBorderWidth.setUiAttribs({ greyout: !inBorder.get() });
}

function updateFontData()
{
    updateFontList();
    const varname=fontDataVarPrefix+inFont.get();

    fontData=null;
    fontTexs=null;
    fontChars={};

    const dataVar=op.patch.getVar(varname);

    if(!dataVar) return;

    fontData=dataVar.getValue().data;

    if(!fontData) return;

    const basename=dataVar.getValue().basename;

    var textVar=op.patch.getVar("font_tex_"+basename);
    if(!textVar)
    {
        fontTexs=null;
        fontData=null;
        return;
    }

    fontTexs=textVar.getValue();

    for(var i=0;i<fontData.chars.length;i++) fontChars[fontData.chars[i].char] = fontData.chars[i];
    needUpdate=true;
}

function updateFontList()
{
    var vars=op.patch.getVars();
    var names=[];

    for(var i in vars)
        if(vars[i].type=="fontData")
            names.push(i.substr(substrLength));

    inFont.uiAttribs.values=names;
}

function updateScale()
{
    var s=scale.get();
    vec3.set(vScale, s,s,s);
}

function updateAlign()
{
    if(minX==undefined)return;
    if(valign.get()=='Top')valignMode=0;
    else if(valign.get()=='Middle')valignMode=1;
    else if(valign.get()=='Bottom')valignMode=2;

    var offY=0;


    widthAll=(Math.abs(minX-maxX));
    heightAll=(Math.abs(minY-maxY));

    if(valignMode===1) offY=heightAll/2;
    else if(valignMode===2) offY=heightAll;

    vec3.set(alignVec,0,offY,0);

    outWidth.set(widthAll);
    outHeight.set(heightAll);
    outStartY.set(maxY+offY);
}


function buildTransMats()
{
    needsUpdateTransmats=false;

    // if(!( inPosArr.get() || inScaleArr.get() || inRotArr.get()))
    // {
    //     transMats=null;
    //     return;
    // }

    var transformations=[];
    const translates=inPosArr.get()||outArr.get();
    const scales=inScaleArr.get();
    const rots=inRotArr.get();

    for(var i=0;i<mesh.numInstances;i++)
    {
        const m=mat4.create();
        mat4.translate(m,m,[translates[i*3+0],translates[i*3+1],translates[i*3+2]]);

        if(scales) mat4.scale(m,m,[scales[i*3+0],scales[i*3+1],scales[i*3+2]]);

        if(rots)
        {
            mat4.rotateX(m,m,rots[i*3+0]*CGL.DEG2RAD);
            mat4.rotateY(m,m,rots[i*3+1]*CGL.DEG2RAD);
            mat4.rotateZ(m,m,rots[i*3+2]*CGL.DEG2RAD);
        }

        transformations.push(Array.prototype.slice.call(m));
    }

    transMats = [].concat.apply([], transformations);
}

render.onTriggered=function()
{

    if(!fontData)
    {
        op.setUiError("nodata","No font data!!!!!!");
        updateFontData();
        next.trigger();
        return;
    }
    if(!fontTexs)
    {

        op.setUiError("nodata","No font texture");
        updateFontData();
        next.trigger();
        return;
    }

    op.setUiError("nodata",null);

    if(needUpdate)
    {
        generateMesh();
        needUpdate=false;
    }

    if(mesh && mesh.numInstances>0)
    {
        cgl.pushBlendMode(CGL.BLEND_NORMAL,true);
        cgl.pushShader(shader);

        if(fontTexs[0] )uniTexSize.setValue([fontTexs[0].width,fontTexs[0].height]);

        if(fontTexs[0] )cgl.setTexture(0,fontTexs[0].tex);
        else cgl.setTexture(0,CGL.Texture.getEmptyTexture(cgl).tex);
        if(fontTexs[1])cgl.setTexture(1,fontTexs[1].tex);
        else cgl.setTexture(1,CGL.Texture.getEmptyTexture(cgl).tex);
        if(fontTexs[2])cgl.setTexture(2,fontTexs[2].tex);
        else cgl.setTexture(2,CGL.Texture.getEmptyTexture(cgl).tex);
        if(fontTexs[3])cgl.setTexture(3,fontTexs[3].tex);
        else cgl.setTexture(3,CGL.Texture.getEmptyTexture(cgl).tex);

        if(inTexColor.get()) cgl.setTexture(4,inTexColor.get().tex);
        if(inTexMask.get()) cgl.setTexture(5,inTexMask.get().tex);

        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix,cgl.mMatrix, alignVec);

        if(needsUpdateTransmats) buildTransMats();
        if(transMats) mesh.setAttribute('instMat',new Float32Array(transMats),16,{"instanced":true});
        if(cgl.getShader())cgl.getShader().define('INSTANCING');

        if(!disabled)
        {
            mat4.scale(cgl.mMatrix,cgl.mMatrix, vScale);
            mesh.render(cgl.getShader());
        }

        cgl.popModelMatrix();

        cgl.setTexture(0,null);
        cgl.popShader();
        cgl.popBlendMode();
    }

    next.trigger();
};

function getChar(chStr)
{
    return fontChars[String(chStr)]||fontChars['?']||fontChars['_']||fontChars['X'];

}


function generateMesh()
{
    outArr.set(null);

    if(!fontData || !fontChars)
    {
        outNumChars.set(0);
        console.log("aborting, no font data...");
        return;
    }

    const theString=String(str.get()+'');

    if(!geom)
    {
        geom=new CGL.Geometry("textmesh");

        geom.vertices = [
             0.5,  0.5, 0.0,
            -0.5,  0.5, 0.0,
             0.5, -0.5, 0.0,
            -0.5, -0.5, 0.0
        ];

        geom.normals = [
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.0
        ];

        geom.texCoords = new Float32Array([
            1.0, 0.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ]);

        geom.verticesIndices = [
            0, 1, 2,
            3, 1, 2
        ];
    }

    if(mesh)mesh.dispose();
    mesh=new CGL.Mesh(cgl,geom);

    var strings=(theString).split('\n');
    var transformations=[];
    var tcOffsets=[];
    var sizes=[];
    var texPos=[];
    var tcSizes=[];
    var pages=[];
    var charCounter=0;
    var arrPositions=[];

    const mulSize=0.01;


    outLines.set(strings.length);
    minY= 99999;
    maxY=-99999;
    minX= 99999;
    maxX=-99999;

    var avgHeight=0;

    for(var i=0;i<fontData.chars.length;i++)
    {
        if(fontData.chars[i].height) avgHeight+=fontData.chars[i].height;
    }
    avgHeight/=fontData.chars.length;
    avgHeight*=mulSize;

    for(var s=0;s<strings.length;s++)
    {
        var txt=strings[s];
        var numChars=txt.length;
        var lineWidth=0;

        for(var i=0;i<numChars;i++)
        {
            const chStr=txt.substring(i,i+1);
            const char=getChar(chStr);
            if(char) lineWidth+=char.xadvance*mulSize+letterSpace.get();

        }

        var pos=0;
        if(align.get()=='Right') pos-=lineWidth;
        else if(align.get()=='Center') pos-=lineWidth/2;

        for(var i=0;i<numChars;i++)
        {
            var m=mat4.create();

            const chStr=txt.substring(i,i+1);
            const char=getChar(chStr);

            if(!char) continue;

            pages.push(char.page||0);
            sizes.push(char.width,char.height);

            tcOffsets.push(char.x/fontData.common.scaleW,(char.y/fontData.common.scaleH));

            const charWidth=char.width/fontData.common.scaleW;
            const charHeight=char.height/fontData.common.scaleH;
            const charOffsetY=(char.yoffset/fontData.common.scaleH);
            const charOffsetX=char.xoffset/fontData.common.scaleW;

            if(chStr==" ") tcSizes.push(0,0);
            else tcSizes.push(charWidth,charHeight);

            mat4.identity(m);

            var adv=(char.xadvance/2)*mulSize;
            pos+=adv;

            const x=pos+(char.xoffset/2)*mulSize;
            const y=(s*-lineHeight.get())+(avgHeight)-(mulSize*(char.yoffset+char.height/2));

            minX=Math.min(x-charWidth,minX);
            maxX=Math.max(x+charWidth,maxX);
            minY=Math.min(y-charHeight-avgHeight/2,minY);
            maxY=Math.max(y+charHeight+avgHeight/2,maxY);

            mat4.translate(m,m,[x,y ,0]);
            arrPositions.push(x,y,0);

            adv=(char.xadvance/2)*mulSize+letterSpace.get();

            pos+=adv;

            minX=Math.min(pos-charWidth,minX);
            maxX=Math.max(pos+charWidth,maxX);

            transformations.push(Array.prototype.slice.call(m));

            charCounter++;
        }
    }

    var transMats = [].concat.apply([], transformations);

    disabled=false;
    if(transMats.length==0) disabled=true;

    mesh.numInstances=transMats.length/16;
    outNumChars.set(mesh.numInstances);

    if(mesh.numInstances==0)
    {
        console.log("no instances");
        disabled=true;
        return;
    }

    mesh.setAttribute('instMat',new Float32Array(transMats),16,{"instanced":true});
    mesh.setAttribute('attrTexOffsets',new Float32Array(tcOffsets),2,{"instanced":true});
    mesh.setAttribute('attrTcSize',new Float32Array(tcSizes),2,{"instanced":true});
    mesh.setAttribute('attrSize',new Float32Array(sizes),2,{"instanced":true});
    mesh.setAttribute('attrPage',new Float32Array(pages),1,{"instanced":true});

    // updateAlign();
    updateAlign();
    needsUpdateTransmats=true;
    outArr.set(arrPositions);
}
