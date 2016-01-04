CABLES.Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='Plotter';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.v=this.addInPort(new Port(this,"value"));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.render.onTriggered=function()
{
    cgl.getShader().bind();
    cgl.gl.enableVertexAttribArray(cgl.getShader().getAttrVertexPos());
    cgl.gl.vertexAttribPointer(cgl.getShader().getAttrVertexPos(),self.buffer.itemSize, cgl.gl.FLOAT, false, 0, 0);
    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, self.buffer);
    cgl.gl.drawArrays(cgl.gl.LINE_STRIP, 0, self.buffer.numItems);

    self.trigger.trigger();
};

this.buffer = cgl.gl.createBuffer();

var num=50;
this.vertices = [];
for(var i=0;i<num;i++)
{
    this.vertices.push(1/num*i);
    this.vertices.push(Math.random()-0.5);
    this.vertices.push(0);
}

function bufferData()
{
    cgl.gl.lineWidth(4);

    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, self.buffer);
    cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(self.vertices), cgl.gl.STATIC_DRAW);
    self.buffer.itemSize = 3;
    self.buffer.numItems = num;
}
bufferData();

this.v.onValueChanged=function()
{
    self.vertices.splice(0,3);
    self.vertices.push(1);
    self.vertices.push(self.v.get());
    self.vertices.push(0);

    for(var i=0;i<num*3;i+=3)
    {
        self.vertices[i]=1/num*i;
    }

    bufferData();
};
