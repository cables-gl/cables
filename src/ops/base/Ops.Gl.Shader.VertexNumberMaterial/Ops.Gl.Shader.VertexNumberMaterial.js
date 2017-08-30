op.name="vertexnumber material";
var cgl=op.patch.cgl;

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var srcVert=''
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

var srcFrag=''
    // .endl()+'precision highp float;'
    .endl()+'IN float num;'
    .endl()+'UNI float numVertices;'
    
    .endl()+'void main()'
    .endl()+'{'

    // .endl()+'float c=mod(num,3.0)/3.0;'
    // .endl()+'c = round(mod(num/3.0,3.0)/3.0);'

    .endl()+'float c = num/numVertices/3.0;'
    .endl()+'c = mod(c,0.1)*10.0;'
    

    .endl()+'   gl_FragColor = vec4(c,c,c,1.0);'
    
    .endl()+'}';
    
var doRender=function()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

var shader=new CGL.Shader(cgl,'vertexnumber material');
shader.setSource(srcVert,srcFrag);
op.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();