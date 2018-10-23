    //Op.apply(this, arguments);
    var self=this;
    var cgl=this.patch.cgl;

    this.name='SkyBox';
    this.render=this.addInPort(new Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
    this.mapping=this.addInPort(new Port(this,"mapping",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:["-+--","--+-"]} ));
    this.mapping.val="-+--";

    this.trigger=this.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

    var mesh=null;

    this.render.onTriggered=function()
    {
        if(mesh!==null) mesh.render(cgl.getShader());
        self.trigger.trigger();
    };



    function build()
    {
        console.log('rebuild!!!'+self.mapping.get());

        var geom=new CGL.Geometry();
        var zeroDotThree=0.33333333;
        var zeroDotThree2=0.33333333*2;

        if(self.mapping.get()=='--+-')
        {
            geom.texCoords = [
              // Front face
              0, zeroDotThree2,
              0.25, zeroDotThree2,
              0.25, zeroDotThree,
              0, zeroDotThree,
              // Back face
              0.75, zeroDotThree2,
              0.75, zeroDotThree,
              0.5, zeroDotThree,
              0.5, zeroDotThree2,
              // Top face
              0.75, zeroDotThree,
              0.75, 0,
              0.5, 0,
              0.5, zeroDotThree,
              // Bottom face
              0.75,  zeroDotThree2,
              0.5, zeroDotThree2,
              0.5, 1,
              0.75,  1,
              // Right face
              0.5, zeroDotThree2,
              0.5, zeroDotThree,
              0.25, zeroDotThree,
              0.25, zeroDotThree2,
              // Left face
              0.75, zeroDotThree2,
              1, zeroDotThree2,
              1, zeroDotThree,
              0.75, zeroDotThree,
            ];

        }

        if(self.mapping.get()=='-+--')
        {
            geom.texCoords = [
              // Front face
              0, zeroDotThree2,
              0.25, zeroDotThree2,
              0.25, zeroDotThree,
              0, zeroDotThree,
              // Back face
              0.75, zeroDotThree2,
              0.75, zeroDotThree,
              0.5, zeroDotThree,
              0.5, zeroDotThree2,
              // Top face

              0.5,  0,
              0.25, 0,
              0.25, zeroDotThree,
              0.5,  zeroDotThree,
              

              // 0.5, zeroDotThree,
              // 0.5, 0,
              // 0.25, 0,
              // 0.25, zeroDotThree,
              // Bottom face
              0.5, 1,
              0.5, zeroDotThree2,
              0.25,  zeroDotThree2,
              0.25,  1,
              // Right face
              0.5, zeroDotThree2,
              0.5, zeroDotThree,
              0.25, zeroDotThree,
              0.25, zeroDotThree2,
              // Left face
              0.75, zeroDotThree2,
              1, zeroDotThree2,
              1, zeroDotThree,
              0.75, zeroDotThree,
            ];

        }


        geom.vertices = [
          
            1.0, -1.0,-1.0, // Front face
            1.0, -1.0, 1.0,
            1.0,  1.0, 1.0,
            1.0,  1.0,-1.0,
          
           -1.0, -1.0,-1.0,// Back face
           -1.0,  1.0,-1.0,
           -1.0,  1.0, 1.0,
           -1.0, -1.0, 1.0,
          
           -1.0,  1.0,-1.0,// Top face
            1.0,  1.0,-1.0,
            1.0,  1.0, 1.0,
           -1.0,  1.0, 1.0,
          
           -1.0, -1.0,-1.0,// Bottom face
           -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, -1.0,-1.0,
          
           -1.0, -1.0, 1.0,// Right face
           -1.0,  1.0, 1.0,
            1.0,  1.0, 1.0,
            1.0, -1.0, 1.0,
          
           -1.0, -1.0,-1.0,// Left face
            1.0, -1.0,-1.0,
            1.0,  1.0,-1.0,
           -1.0,  1.0,-1.0,
        ];


        geom.vertexNormals = [
            // Front face
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,

            // Back face
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,

            // Top face
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,

            // Bottom face
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,

            // Right face
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,

            // Left face
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0
        ];

        geom.verticesIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ];

        mesh=new CGL.Mesh(cgl,geom);
    }

    this.mapping.onValueChanged=build;
    build();