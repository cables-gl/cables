const
    invec=op.inObject("input",null,"sg_float"),
    outvec=op.outObject("result",null,"sg_float");

new CGL.ShaderGraphOp(this);
op.shaderFunc="sin";

invec.onLinkChanged=()=>
{
    CGL.ShaderGraphOp.getMaxGenTypeFromPorts([invec],[invec,outvec]);

};
