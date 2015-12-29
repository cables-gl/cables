// todo: move to ops.gl

    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    this.name='random cluster';
    this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
    this.num=this.addInPort(new Port(this,"num"));
    this.size=this.addInPort(new Port(this,"size"));
    this.seed=this.addInPort(new Port(this,"random seed"));

    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION)) ;
    this.idx=this.addOutPort(new Port(this,"index")) ;
    this.rnd=this.addOutPort(new Port(this,"rnd")) ;
    this.randoms=[];
    this.randomsRot=[];
    this.randomsFloats=[];

    var transVec=vec3.create();

    this.exe.onTriggered=function()
    {
        for(var i=0;i<self.randoms.length;i++)
        {
            cgl.pushMvMatrix();

            mat4.translate(cgl.mvMatrix,cgl.mvMatrix, self.randoms[i]);

            mat4.rotateX(cgl.mvMatrix,cgl.mvMatrix, self.randomsRot[i][0]);
            mat4.rotateY(cgl.mvMatrix,cgl.mvMatrix, self.randomsRot[i][1]);
            mat4.rotateZ(cgl.mvMatrix,cgl.mvMatrix, self.randomsRot[i][2]);

            self.idx.set(i);
            self.rnd.set(self.randomsFloats[i]);

            self.trigger.trigger();

            cgl.popMvMatrix();
        }
    };

    function reset()
    {
        self.randoms=[];
        self.randomsRot=[];
        self.randomsFloats=[];

        Math.randomSeed=self.seed.get();

        for(var i=0;i<self.num.get();i++)
        {
            self.randomsFloats.push(Math.seededRandom());
            self.randoms.push(vec3.fromValues(
                (Math.seededRandom()-0.5)*self.size.get(),
                (Math.seededRandom()-0.5)*self.size.get(),
                (Math.seededRandom()-0.5)*self.size.get()
                ));
            self.randomsRot.push(vec3.fromValues(
                Math.seededRandom()*360*CGL.DEG2RAD,
                Math.seededRandom()*360*CGL.DEG2RAD,
                Math.seededRandom()*360*CGL.DEG2RAD
                ));
        }
    }

    this.size.set(40);
    this.seed.set(1);
    this.seed.onValueChanged=reset;
    this.num.onValueChanged=reset;
    this.size.onValueChanged=reset;

    this.num.set(100);