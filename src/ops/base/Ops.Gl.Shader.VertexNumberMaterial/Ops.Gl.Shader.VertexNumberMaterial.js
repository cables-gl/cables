const cgl = op.patch.cgl;

const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");

const srcVert = ""
    .endl() + "IN float attrVertIndex;"
    .endl() + "UNI mat4 projMatrix;"
    .endl() + "UNI mat4 mvMatrix;"
    .endl() + "IN vec3 vPosition;"
    .endl() + "OUT float num;"

    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   num=attrVertIndex;"
    .endl() + "   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);"
    .endl() + "}";

const srcFrag = ""
    .endl() + "IN float num;"
    .endl() + "UNI float numVertices;"

    .endl() + "void main()"
    .endl() + "{"

    .endl() + "float c = num/numVertices/3.0;"
    .endl() + "c = mod(c,0.1)*10.0;"

    .endl() + "   outColor= vec4(c,c,c,1.0);"

    .endl() + "}";

function doRender()
{
    cgl.pushShader(shader);
    trigger.trigger();
    cgl.popShader();
}

const shader = new CGL.Shader(cgl, "vertexnumber material");
shader.setSource(srcVert, srcFrag);

render.onTriggered = doRender;

doRender();
