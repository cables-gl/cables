    Op.apply(this, arguments);
    var self=this;
    var cgl=this.patch.cgl;

    this.name='rectangle';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
    this.width=this.addInPort(new Port(this,"width"));
    this.height=this.addInPort(new Port(this,"height"));
    
    this.pivotX=this.addInPort(new Port(this,"pivot x",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","left","right"]} ));
    this.pivotX.val='center';

    this.pivotY=this.addInPort(new Port(this,"pivot y",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","top","bottom"]} ));
    this.pivotY.val='center';

    this.width.val=1.0;
    this.height.val=1.0;

    this.render.onTriggered=function()
    {
        self.mesh.render(cgl.getShader());
        self.trigger.trigger();
    };

    var geom=new CGL.Geometry();
    this.mesh=null;

    function rebuild()
    {
        var x=0;
        var y=0;
        if(self.pivotX.get()=='center') x=0;
        if(self.pivotX.get()=='right') x=-self.width.get()/2;
        if(self.pivotX.get()=='left') x=+self.width.get()/2;

        if(self.pivotY.get()=='center') y=0;
        if(self.pivotY.get()=='top') y=-self.height.get()/2;
        if(self.pivotY.get()=='bottom') y=+self.height.get()/2;

        geom.vertices = [
             self.width.get()/2+x,  self.height.get()/2+y,  0.0,
            -self.width.get()/2+x,  self.height.get()/2+y,  0.0,
             self.width.get()/2+x, -self.height.get()/2+y,  0.0,
            -self.width.get()/2+x, -self.height.get()/2+y,  0.0
        ];

        geom.texCoords = [
             1.0, 0.0,
             0.0, 0.0,
             1.0, 1.0,
             0.0, 1.0
        ];

        geom.verticesIndices = [
            0, 1, 2,
            2, 1, 3
        ];
        if(!self.mesh) self.mesh=new CGL.Mesh(cgl,geom);
        self.mesh.setGeom(geom);
    }
    rebuild();

    this.pivotX.onValueChanged=rebuild;
    this.pivotY.onValueChanged=rebuild;
    this.width.onValueChanged=rebuild;
    this.height.onValueChanged=rebuild;