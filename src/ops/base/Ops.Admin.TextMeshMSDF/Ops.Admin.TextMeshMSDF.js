// https://soimy.github.io/msdf-bmfont-xml/

const
    render=op.inTrigger("Render"),
    str=op.inString("Text","cables"),
    inTex=op.inTexture("Texture"),
    inFontData=op.inObject("Font Data"),
    letterSpace=op.inFloat("Letter Spacing",0),
    lineHeight=op.inFloat("Line Height",1),
    doSDF=op.inBool("SDF",true),
    align=op.inSwitch("Align",['Left','Center','Right'],'Center'),
    valign=op.inSwitch("Vertical Align",['Top','Middle','Bottom'],'Middle'),

    r = op.inValueSlider("r", 1),
    g = op.inValueSlider("g", 1),
    b = op.inValueSlider("b", 1),
    a = op.inValueSlider("a", 1),

    inShadow = op.inBool("Shadow", false),
    inPosArr=op.inArray("Positions"),
    inScaleArr=op.inArray("Scalings"),
    next=op.outTrigger("Next"),
    outArr=op.outArray("Positions Original"),
    outLines=op.outNumber("Num Lines"),

    outWidth=op.outNumber("Width"),
    outHeight=op.outNumber("Height"),
    outStartY=op.outNumber("Start Y"),
    outNumChars=op.outNumber("Num Chars");

inFontData.ignoreValueSerialize=true;


op.setPortGroup('Font',[inTex,inFontData]);
op.setPortGroup('Alignment',[align,valign]);
op.setPortGroup('Color',[r,g,b,a]);
r.setUiAttribs({ colorPick: true });

const cgl=op.patch.cgl;
var font={};
var needUpdate=true;
var geom=null;
var mesh=null;
var disabled=false;
var valignMode=1;
const alignVec=vec3.create();
var heightAll=0,widthAll=0;
var strings=[];
var offY=0;
var minY,maxY,minX,maxX;


const shader=new CGL.Shader(cgl,'TextMeshSDF');

if (cgl.glVersion == 1)
{
    cgl.gl.getExtension("OES_standard_derivatives");
    shader.enableExtension("GL_OES_standard_derivatives");
}

shader.setSource(attachments.textmeshsdf_vert,attachments.textmeshsdf_frag);

const
    uniTex=new CGL.Uniform(shader,'t','tex',0),
    uniTexMul=new CGL.Uniform(shader,'t','texMul',1),
    uniTexMulMask=new CGL.Uniform(shader,'t','texMulMask',2),
    uniColor=new CGL.Uniform(shader,'4f','color',r,g,b,a),
    uniTexSize=new CGL.Uniform(shader,'2f','texSize',0,0);

inShadow.onChange=
doSDF.onChange=updateDefines;
updateDefines();

align.onChange=
    str.onChange=
    inFontData.onChange=
    letterSpace.onChange=
    lineHeight.onChange=
    function()
    {
        needUpdate=true;
    };


valign.onChange=updateAlign;

function updateDefines()
{
    shader.toggleDefine("SDF",doSDF.get());
    shader.toggleDefine("SHADOW",inShadow.get());
}


inFontData.onChange=function()
{
    var data=inFontData.get();

    if(!data)
    {
        op.setUiError("datawrong","No font data!");
        return;
    }
    if(!data.chars)
    {
        op.setUiError("datawrong","Invalid font data!");
        return;
    }

    if(data && data.chars)
    {
        font=data;
        font.characters={};

        for(var i=0;i<data.chars.length;i++) font.characters[data.chars[i].char]=data.chars[i];

        op.setUiError("datawrong",null);
    }

    needUpdate=true;
};


function updateAlign()
{
    if(minX==undefined)return;
    if(valign.get()=='Top')valignMode=0;
    else if(valign.get()=='Middle')valignMode=1;
    else if(valign.get()=='Bottom')valignMode=2;

    var offY=0;

    if(valignMode===1) offY=heightAll/2;
    else if(valignMode===2) offY=heightAll;

    vec3.set(alignVec, 0,offY,0);

    console.log({minX,maxX,minY,maxY});

    widthAll=(Math.abs(minX-maxX));
    heightAll=(Math.abs(minY-maxY));

    outWidth.set(widthAll);
    outHeight.set(heightAll);
    outStartY.set(maxY+offY);
}


render.onTriggered=function()
{
    if(!inTex.get() || !inFontData.get())
    {
        op.setUiError("nodata","No font data or texture");
    }
    else
    {
        op.setUiError("nodata",null);
    }

    if(needUpdate)
    {
        generateMesh();
        needUpdate=false;
    }

    if(mesh && mesh.numInstances>0)
    {
        cgl.pushBlendMode(CGL.BLEND_NORMAL,true);
        cgl.pushShader(shader);

        if(inTex.get())
        {
            cgl.setTexture(0,inTex.get().tex);
            // console.log([inTex.get().width,inTex.get().height]);
            uniTexSize.setValue([inTex.get().width,inTex.get().height]);
        }

        // var mulTex=inMulTex.get();
        // if(mulTex)cgl.setTexture(1,mulTex.tex);
        // var mulTexMask=inMulTexMask.get();        // if(mulTexMask)cgl.setTexture(2,mulTexMask.tex);
        // heightAll=(strings.length-1)*( lineHeight.get());
        // outHeight.set(heightAll);








        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix,cgl.mMatrix, alignVec);

        if(inPosArr.get())
        {
            var arr=inPosArr.get();
            var transformations=[];

            var scales=inScaleArr.get();

            for(var i=0;i<mesh.numInstances;i++)
            {
                const m=mat4.create();
                mat4.translate(m,m,[arr[i*3+0],arr[i*3+1],arr[i*3+2]]);

                if(scales)
                {
                    mat4.scale(m,m,[scales[i*3+0],scales[i*3+1],scales[i*3+2]]);
                }

                transformations.push(Array.prototype.slice.call(m));
            }

            var transMats = [].concat.apply([], transformations);
            mesh.setAttribute('instMat',new Float32Array(transMats),16,{"instanced":true});
        }

        if(cgl.getShader())cgl.getShader().define('INSTANCING');

        if(!disabled) mesh.render(cgl.getShader());

        cgl.popModelMatrix();

        cgl.setTexture(0,null);
        cgl.popShader();
        cgl.popBlendMode();
    }

    next.trigger();
};

function generateMesh()
{
    outArr.set(null);

    if(!font || !font.characters)
    {
        outNumChars.set(0);
        return;
    }
    var theString=String(str.get()+'');

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

    strings=(theString).split('\n');
    outLines.set(strings.length);

    var transformations=[];
    var tcOffsets=[];//new Float32Array(str.get().length*2);
    var sizes=[];//new Float32Array(str.get().length*2);
    var texPos=[];
    var tcSizes=[];
    var charCounter=0;

    const mulSize=0.01;

    var arrPositions=[];

    minY= 99999;
    maxY=-99999;
    minX= 99999;
    maxX=-99999;

    var avgHeight=0;

    for(var i=0;i<font.chars.length;i++)
    {
        if(font.chars[i].height) avgHeight+=font.chars[i].height;
    }
    avgHeight/=font.chars.length;
    avgHeight*=mulSize;

    console.log({avgHeight,font});

    for(var s=0;s<strings.length;s++)
    {
        var txt=strings[s];
        var numChars=txt.length;
        var lineWidth=0;

        for(var i=0;i<numChars;i++)
        {
            const chStr=txt.substring(i,i+1);
            const char=font.characters[String(chStr)];
            if(char) lineWidth+=char.xadvance*mulSize+letterSpace.get();
        }

        var pos=0;
        if(align.get()=='Right') pos-=lineWidth;
        else if(align.get()=='Center') pos-=lineWidth/2;

        for(var i=0;i<numChars;i++)
        {
            var m=mat4.create();

            const chStr=txt.substring(i,i+1);
            const char=font.characters[String(chStr)];

            if(!char)continue;

            sizes.push(char.width,char.height);

            tcOffsets.push(char.x/font.common.scaleW,(char.y/font.common.scaleH));

            const charWidth=char.width/font.common.scaleW;
            const charHeight=char.height/font.common.scaleH;
            const charOffsetY=char.yoffset/font.common.scaleH;
            const charOffsetX=char.xoffset/font.common.scaleH;

            tcSizes.push(charWidth,charHeight);

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



            // widthMax=Math.max(pos,widthMax);

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
        disabled=true;
        return;
    }

    mesh.setAttribute('instMat',new Float32Array(transMats),16,{"instanced":true});
    mesh.setAttribute('attrTexOffsets',new Float32Array(tcOffsets),2,{"instanced":true});
    mesh.setAttribute('attrTcSize',new Float32Array(tcSizes),2,{"instanced":true});
    mesh.setAttribute('attrSize',new Float32Array(sizes),2,{"instanced":true});


    updateAlign();
    updateAlign();

    outArr.set(arrPositions);
}
