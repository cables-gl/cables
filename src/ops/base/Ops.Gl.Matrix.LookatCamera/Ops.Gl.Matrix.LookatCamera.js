    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    this.name='LookatCamera';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    this.centerX=this.addInPort(new Port(this,"centerX"));
    this.centerY=this.addInPort(new Port(this,"centerY"));
    this.centerZ=this.addInPort(new Port(this,"centerZ"));

    this.eyeX=this.addInPort(new Port(this,"eyeX"));
    this.eyeY=this.addInPort(new Port(this,"eyeY"));
    this.eyeZ=this.addInPort(new Port(this,"eyeZ"));

    this.vecUpX=this.addInPort(new Port(this,"upX"));
    this.vecUpY=this.addInPort(new Port(this,"upY"));
    this.vecUpZ=this.addInPort(new Port(this,"upZ"));

    this.centerX.set(0);
    this.centerY.set(0);
    this.centerZ.set(0);

    this.eyeX.set(5);
    this.eyeY.set(5);
    this.eyeZ.set(5);

    this.vecUpX.set(0);
    this.vecUpY.set(1);
    this.vecUpZ.set(0);
    
    var vUp=vec3.create();
    var vEye=vec3.create();
    var vCenter=vec3.create();
    var transMatrix = mat4.create();
    mat4.identity(transMatrix);


    this.render.onTriggered=function()
    {
        cgl.pushViewMatrix();

        vec3.set(vUp, self.vecUpX.get(),self.vecUpY.get(),self.vecUpZ.get());
        vec3.set(vEye, self.eyeX.get(),self.eyeY.get(),self.eyeZ.get());
        vec3.set(vCenter, self.centerX.get(),self.centerY.get(),self.centerZ.get());

        mat4.lookAt(transMatrix, vEye, vCenter, vUp);
        
        mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);


        self.trigger.trigger();
        cgl.popViewMatrix();
    };
