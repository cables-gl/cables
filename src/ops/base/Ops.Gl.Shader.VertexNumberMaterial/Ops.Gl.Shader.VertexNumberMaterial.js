const cgl=op.patch.cgl;

const render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION) );
const trigger=op.outTrigger("trigger")

const srcVert=''
    .endl()+'IN float attrVertIndex;'
    .endl()+'UNI mat4 projMatrix;'
    .endl()+'UNI mat4 mvMatrix;'
    .endl()+'IN vec3 vPosition;'
    .endl()+'OUT float num;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   num=attrVertIndex;'
    .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
    .endl()+'}';

const srcFrag=''
    // .endl()+'precision highp float;'
    .endl()+'IN float num;'
    .endl()+'UNI float numVertices;'
    
    .endl()+'void main()'
    .endl()+'{'

    // .endl()+'float c=mod(num,3.0)/3.0;'
    // .endl()+'c = round(mod(num/3.0,3.0)/3.0);'

    .endl()+'float c = num/numVertices/3.0;'
    .endl()+'c = mod(c,0.1)*10.0;'
    

    .endl()+'   outColor= vec4(c,c,c,1.0);'
    
    .endl()+'}';
    
var doRender=function()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

const shader=new CGL.Shader(cgl,'vertexnumber material');
shader.setSource(srcVert,srcFrag);

render.onTriggered=doRender;

doRender();