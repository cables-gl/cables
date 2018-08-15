var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

function doRender()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
}

// var srcFrag=''
//     // .endl()+'precision highp float;'
//     .endl()+'IN vec3 norm;'
//     .endl()+'IN mat4 normalMatrix;'
//     .endl()+''
//     .endl()+'void main()'
//     .endl()+'{'
    
//     .endl()+'   vec4 norm4=vec4(norm,1.0);'
//     .endl()+'   norm4*=normalMatrix;'
    
    
//     .endl()+'   vec4 col=vec4(norm4.x,norm4.y,norm4.z,1.0);'
//     .endl()+'   gl_FragColor = col;'
//     .endl()+'}';


var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

shader.setSource(attachments.normalsmaterial_vert,attachments.normalsmaterial_frag);

render.onTriggered=doRender;
doRender();