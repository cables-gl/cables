op.name="ShaderToyAPI";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );
var shaderId=op.addInPort(new Port(op,"ShaderToy ID",OP_PORT_TYPE_VALUE,{type:"string"}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var result=op.addOutPort(new Port(op,"Result",OP_PORT_TYPE_OBJECT));
var shaderOut=op.addOutPort(new Port(op,"shader",OP_PORT_TYPE_OBJECT));

var cgl=op.patch.cgl;
var appKey="Nt8KwM";
shaderId.set('ldtGDr');
shaderOut.ignoreValueSerialize=true;
shaderId.onValueChanged=setId;
setId();

render.onTriggered=function()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

var shader=null;

var vertCode=''
.endl()+'precision highp float;'
.endl()+'attribute vec3 vPosition;'
.endl()+'attribute vec2 attrTexCoord;'
.endl()+'varying vec2 texCoord;'
.endl()+'uniform mat4 projMatrix;'
.endl()+'uniform mat4 mvMatrix;'
.endl()+''
.endl()+'void main()'
.endl()+'{'
.endl()+'   texCoord=attrTexCoord;'
.endl()+'   vec4 pos=vec4(vPosition,  1.0);'
.endl()+'   gl_Position = projMatrix * mvMatrix * pos;'
.endl()+'}';



function setId()
{
    CABLES.ajax(
        'https://www.shadertoy.com/api/v1/shaders/'+shaderId.get()+'?key='+appKey,
        function(err,_data,xhr)
        {
            var data=JSON.parse(_data);
            console.log(data);
            
            if(data.Shader && data.Shader.renderpass)
            {
                var code=''
                .endl()+'precision highp float;'
                .endl()+'varying vec2 texCoord;'
                
                .endl()+'float iGlobalTime=1.0;'
                .endl()+'vec2 iResolution=vec2(111.0,111.0);'
                .endl();
                code+=data.Shader.renderpass[0].code;
                code.endl();
                code+='void main()'
                .endl()+'{'
                .endl()+'   vec4 col=vec4(0.0,0.0,1.0,1.0);'
                .endl()+'   mainImage(col, texCoord*111.0);'
                .endl()+'   gl_FragColor=col;'
                .endl()+'}'
                .endl();

                shader=new CGL.Shader(cgl,'ShaderToyMaterial');

                shader.setSource(vertCode,code);
                shader.compile();
                shaderOut.set(shader);
            }

            result.set(data);
        });

}




