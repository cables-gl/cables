var self=this;
var cgl=self.patch.cgl;

this.name='SpotLight';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

this.show=this.addInPort(new Port(this,"show",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.show.set(true);

this.x=this.addInPort(new Port(this,"eye x",OP_PORT_TYPE_VALUE));
this.y=this.addInPort(new Port(this,"eye y",OP_PORT_TYPE_VALUE));
this.z=this.addInPort(new Port(this,"eye z",OP_PORT_TYPE_VALUE));

this.tx=this.addInPort(new Port(this,"target x",OP_PORT_TYPE_VALUE));
this.ty=this.addInPort(new Port(this,"target y",OP_PORT_TYPE_VALUE));
this.tz=this.addInPort(new Port(this,"target z",OP_PORT_TYPE_VALUE));

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var buffer = cgl.gl.createBuffer();

this.exe.onTriggered=function()
{
    if(self.show.get())
    {
        var shader=cgl.getShader();
        shader.bind();

        cgl.pushMvMatrix();

        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
        cgl.gl.vertexAttribPointer(cgl.getShader().getAttrVertexPos(),3, cgl.gl.FLOAT, false, 0, 0);
        cgl.gl.enableVertexAttribArray(cgl.getShader().getAttrVertexPos());

        cgl.gl.drawArrays(cgl.gl.LINES, 0, 4);
        cgl.gl.drawArrays(cgl.gl.POINTS, 0, 4);
        // cgl.gl.drawArrays(cgl.gl.POINTS, 0, 2);
        cgl.gl.disableVertexAttribArray(cgl.getShader().getAttrVertexPos());

        cgl.popMvMatrix();
    }

    self.trigger.trigger();

};

function update()
{
    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(
        [
            self.x.get(),
            self.y.get(),
            self.z.get(),
            self.tx.get(),
            self.ty.get(),
            self.tz.get(),

            self.x.get(),
            self.y.get(),
            self.z.get(),
            self.tx.get()+0.1,
            self.ty.get()+0.1,
            self.tz.get()+0.1,

            // self.x.get(),
            // self.y.get(),
            // self.z.get(),
            // self.tx.get()+0.1,
            // self.ty.get()+0.1,
            // self.tz.get(),


        ]), cgl.gl.STATIC_DRAW);

}

this.x.onValueChanged=update;
this.y.onValueChanged=update;
this.z.onValueChanged=update;

this.tx.onValueChanged=update;
this.ty.onValueChanged=update;
this.tz.onValueChanged=update;

