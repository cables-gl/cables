const
    render=op.inTrigger('render'),
    fragmentShader=op.inStringEditor("Fragment Code"),
    vertexShader=op.inStringEditor("Vertex Code"),
    asMaterial=op.inValueBool("Use As Material",true),
    trigger=op.outTrigger('trigger'),
    outShader=op.outObject("Shader");

const cgl=op.patch.cgl;
var uniformInputs=[];
var uniformTextures=[];

fragmentShader.setUiAttribs({editorSyntax:'glsl'});
vertexShader.setUiAttribs({editorSyntax:'glsl'});

var shader=new CGL.Shader(cgl,"shaderMaterial");
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

op.setPortGroup("Source Code",[fragmentShader,vertexShader]);
op.setPortGroup("Options",[asMaterial]);

fragmentShader.set(CGL.Shader.getDefaultFragmentShader());
vertexShader.set(CGL.Shader.getDefaultVertexShader());
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

fragmentShader.onChange=
    vertexShader.onChange=updateLater;

render.onTriggered=doRender;

var needsUpdate=true;
op.onLoadedValueSet=initDataOnLoad;

// op.addEventListener("onPortsChanged",function(){console.log("PORTS CHANGED");});

function initDataOnLoad(data)
{
    updateShader();

    // set uniform values AFTER shader has been compiled and uniforms are extracted and uniform ports are created.

    for(var i=0;i<uniformInputs.length;i++)
        for(var j=0;j<data.portsIn.length;j++)
            if(uniformInputs[i] && uniformInputs[i].name==data.portsIn[j].name)
                uniformInputs[i].set(data.portsIn[j].value);
}

function updateLater()
{
    needsUpdate=true;
}

op.init=function()
{
    updateShader();
};

function doRender()
{
    if(needsUpdate)updateShader();

    if(asMaterial.get()) cgl.setShader(shader);

    trigger.trigger();

    if(asMaterial.get()) cgl.setPreviousShader();

}

function bindTextures()
{
    for(var i=0;i<uniformTextures.length;i++)
    {
        if(uniformTextures[i] && uniformTextures[i].get() && uniformTextures[i].get().tex)
        {
            cgl.setTexture(0+i+3, uniformTextures[i].get().tex);
        }
    }
}

function hasUniformInput(name)
{
    var i=0;
    for(i=0;i<uniformInputs.length;i++) if(uniformInputs[i] && uniformInputs[i].name==name)return true;
    for(i=0;i<uniformTextures.length;i++) if(uniformTextures[i] && uniformTextures[i].name==name)return true;
    return false;
}

var tempMat4=mat4.create();
// var lastm4;
// const uniformNameBlacklist = [
//     'modelMatrix',
//     'viewMatrix',
//     'normalMatrix',
//     'mvMatrix',
//     'projMatrix',
//     'inverseViewMatrix',
//     'camPos'
// ];
var countTexture=0;
var foundNames=[];

function parseUniforms(src)
{
    const lblines=src.split("\n");

    for(var k=0;k<lblines.length;k++)
    {
        const lines=lblines[k].split(";");

        for(var i=0;i<lines.length;i++)
        {
            // console.log("---",lines[i]);
            var words=lines[i].split(" ");

            for(var j=0;j<words.length;j++) words[j]=(words[j]+'').trim();

            if(words[0]==="UNI" || words[0]==="uniform")
            {
                words = words.filter(function(el) { return el!=""; });

                const uniName=words[2];

                // console.log('found uniform',uniName);

                if(words[1]==="float")
                {
                    foundNames.push(uniName);
                    if(!hasUniformInput(uniName))
                    {
                        const newInput=op.inFloat(uniName,0);
                        newInput.uniform=new CGL.Uniform(shader,'f',uniName,newInput);
                        uniformInputs.push(newInput);
                    }
                }

                if(words[1]==="int")
                {
                    foundNames.push(uniName);
                    if(!hasUniformInput(uniName))
                    {
                        const newInput=op.inInt(uniName,0);
                        newInput.uniform=new CGL.Uniform(shader,'i',uniName,newInput);
                        uniformInputs.push(newInput);
                    }
                }

                if(words[1]==="vec3" || words[1]==="vec2" || words[1]==="vec4")
                {
                    var num=2;
                    if(words[1]==="vec4")num=4;
                    if(words[1]==="vec3")num=3;
                    foundNames.push(uniName+' X');
                    foundNames.push(uniName+' Y');
                    if(num>2)foundNames.push(uniName+' Z');
                    if(num>3)foundNames.push(uniName+' W');
                    if(!hasUniformInput(uniName+' X'))
                    {
                        var group=[];

                        const newInputX=op.inFloat(uniName+' X',0);
                        newInputX.uniform=new CGL.Uniform(shader,'f',uniName,newInputX);
                        uniformInputs.push(newInputX);
                        group.push(newInputX);

                        const newInputY=op.inFloat(uniName+' Y',0);
                        newInputY.uniform=new CGL.Uniform(shader,'f',uniName,newInputY);
                        uniformInputs.push(newInputY);
                        group.push(newInputY);

                        if(num>2)
                        {
                            const newInputZ=op.inFloat(uniName+' Z',0);
                            newInputZ.uniform=new CGL.Uniform(shader,'f',uniName,newInputZ);
                            uniformInputs.push(newInputZ);
                            group.push(newInputZ);
                        }
                        if(num>3)
                        {
                            const newInputW=op.inFloat(uniName+' W',0);
                            newInputW.uniform=new CGL.Uniform(shader,'f',uniName,newInputW);
                            uniformInputs.push(newInputW);
                            group.push(newInputW);
                        }

                        op.setPortGroup(uniName,group);
                    }
                }

                // if(words[1]==="bool")
                // {
                //     foundNames.push(uniName);
                //     if(!hasUniformInput(uniName))
                //     {
                //         const newInput=op.inBool(uniName,0);

                //         newInput.uniform=new CGL.Uniform(shader,'b',uniName,newInput);
                //         uniformInputs.push(newInput);
                //     }
                // }

                if(words[1]==="sampler2D")
                {
                    foundNames.push(uniName);
                    if(!hasUniformInput(uniName))
                    {
                        var newInputTex=op.inObject(uniName);
                        newInputTex.uniform=new CGL.Uniform(shader,'t',uniName,3+uniformTextures.length);
                        uniformTextures.push(newInputTex);
                        countTexture++;
                    }
                }
            }
        }
    }





}



function updateShader()
{
    if(!shader)return;

    shader.bindTextures=bindTextures.bind(this);
    shader.setSource(vertexShader.get(),fragmentShader.get());

    countTexture=0;
    foundNames.length=0;

    parseUniforms(vertexShader.get() );
    parseUniforms(fragmentShader.get() );

    for(var j=0;j<uniformTextures.length;j++)
        for(var i=0;i<foundNames.length;i++)
            if(uniformTextures[j] && foundNames.indexOf(uniformTextures[j].name)==-1)
            {
                uniformTextures[j].remove();
                uniformTextures[j]=null;
            }


    for(var j=0;j<uniformInputs.length;j++)
        for(var i=0;i<foundNames.length;i++)
            if(uniformInputs[j] && foundNames.indexOf(uniformInputs[j].name)==-1)
            {
                uniformInputs[j].remove();
                uniformInputs[j]=null;
            }


    shader.compile();


    for(i=0;i<uniformInputs.length;i++)
    {
        if(uniformInputs[i])uniformInputs[i].uniform.needsUpdate=true;
    }

    if(CABLES.UI) gui.patch().showOpParams(op);


    outShader.set(null);
    outShader.set(shader);
    needsUpdate=false;

}


updateShader();
