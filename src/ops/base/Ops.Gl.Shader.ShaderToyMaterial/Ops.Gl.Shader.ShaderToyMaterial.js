op.name="ShaderToyAPI";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );
var shaderId=op.addInPort(new Port(op,"ShaderToy ID",OP_PORT_TYPE_VALUE,{type:"string"}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var result=op.addOutPort(new Port(op,"Result",OP_PORT_TYPE_OBJECT));
var shaderOut=op.addOutPort(new Port(op,"shader",OP_PORT_TYPE_OBJECT));

var cgl=op.patch.cgl;
var appKey="Nt8KwM";
shaderId.set('lsGSDG');
// ldtGDr
shaderOut.ignoreValueSerialize=true;
shaderId.onValueChanged=setId;
var uniTime=null;
var startTime=Date.now();
setId();

render.onTriggered=function()
{
    if(shader && uniTime)
    {
        uniTime.setValue( (Date.now()-startTime)/1000);
        cgl.setShader(shader);
        trigger.trigger();
        cgl.setPreviousShader();

    }
};

var shader=null;


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
                
                .endl()+'uniform float iGlobalTime;'
                .endl()+'vec2 iResolution=vec2(1.0,1.0);'
                .endl();
                code+=data.Shader.renderpass[0].code;
                code.endl();
                code+='void main()'
                .endl()+'{'
                .endl()+'   vec4 col=vec4(0.0,0.0,1.0,1.0);'
                .endl()+'   mainImage(col, texCoord*1.0);'
                .endl()+'   gl_FragColor=col;'
                .endl()+'}'
                .endl();

                shader=new CGL.Shader(cgl,'ShaderToyMaterial');
                uniTime=new CGL.Uniform(shader,'f','iGlobalTime',0);
                shader.setSource(shader.getDefaultVertexShader(),code);
                shader.compile();
                shaderOut.set(shader);
            }

            result.set(data);
        });

}




