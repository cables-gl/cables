const inColor = op.inDropDown("Color", ["Red", "Green", "Blue", "Cyan", "Pink", "Yellow", "White", "Black"], "Red");
const outvec = op.outObject("result", null, "sg_vec4");

const sg=new CGL.ShaderGraphOp(this);
inColor.onChange=update;
update();

function update()
{
    if(inColor.get()=="Red") op.shaderVar="vec4(1.0,0.0,0.0,1.0)";
    if(inColor.get()=="Green") op.shaderVar="vec4(0.0,1.0,0.0,1.0)";
    if(inColor.get()=="Blue") op.shaderVar="vec4(0.0,0.0,1.0,1.0)";
    if(inColor.get()=="Cyan") op.shaderVar="vec4(0.0,1.0,1.0,1.0)";
    if(inColor.get()=="Pink") op.shaderVar="vec4(1.0,0.0,1.0,1.0)";
    if(inColor.get()=="Yellow") op.shaderVar="vec4(1.0,1.0,0.0,1.0)";

    sg.sendOutPing();
}

