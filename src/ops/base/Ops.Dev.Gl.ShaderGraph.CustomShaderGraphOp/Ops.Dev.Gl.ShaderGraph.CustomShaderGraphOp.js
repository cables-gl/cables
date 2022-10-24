const inCode = op.inStringEditor("Code", "float main(vec3 rgb)\n{\nreturn rgb*2.0;\n}", "glsl");

const sgOp = new CGL.ShaderGraphOp(this);

op.shaderSrc = inCode.get();
op.shaderFunc = "";

inCode.onChange = () =>
{
    const info = sgOp.parseCode(inCode.get());
    sgOp.updatePorts(info);
};
