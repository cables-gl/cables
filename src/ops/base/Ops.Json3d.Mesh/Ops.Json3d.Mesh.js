CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='json3d Mesh';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION ));
this.index=this.addInPort(new Port(this,"mesh index",OP_PORT_TYPE_VALUE,{type:'string'} ));

this.index.val=-1;
this.centerPivot=this.addInPort(new Port(this,"center pivot",OP_PORT_TYPE_VALUE,{display:'bool'} ));
this.centerPivot.val=false;

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.geometryOut=this.addOutPort(new Port(this,"geometry",OP_PORT_TYPE_OBJECT ));
this.geometryOut.ignoreValueSerialize=true;

var draw=this.addInPort(new Port(this,"draw",OP_PORT_TYPE_VALUE,{display:'bool'}));
draw.set(true);

var mesh=null;
var currentIndex=-1;

function render()
{
    if(!mesh && cgl.frameStore.currentScene && cgl.frameStore.currentScene.getValue() || currentIndex!=self.index.val) reload();
    if(draw.get())
    {
        if(mesh!==null) mesh.render(cgl.getShader());
        self.trigger.trigger();
    }
}

function reload()
{
    if(!cgl.frameStore.currentScene || !cgl.frameStore.currentScene.getValue())return;
    var meshes=cgl.frameStore.currentScene.getValue().meshes;
    // console.log('---',meshes.length);
    // for(var i in meshes)
    // {
    //     console.log(meshes[i].name);
    // }

    // ---------

    if(cgl.frameStore.currentScene && cgl.frameStore.currentScene.getValue() && self.index.get()>=0)
    {
        // console.log(' has '+cgl.frameStore.currentScene.getValue().meshes.length+' meshes ');
        // console.log('reload');

        self.uiAttr({warning:''});
        self.uiAttr({info:''});

        var jsonMesh=null;

        currentIndex=self.index.val;

        if(isNumeric(self.index.val))
        {
            if(self.index.val<0 || self.index.val>=cgl.frameStore.currentScene.getValue().meshes.length)
            {
                self.uiAttr({warning:'mesh not found - index out of range '});
                return;
            }

            jsonMesh=cgl.frameStore.currentScene.getValue().meshes[parseInt(self.index.val,10) ];
        }
        else
        {
            var scene=cgl.frameStore.currentScene.getValue();
        }

        if(!jsonMesh)
        {
            mesh=null;
            self.uiAttr({warning:'mesh not found'});
            return;
        }
        self.uiAttribs.warning='';

        var i=0;

        var verts=JSON.parse(JSON.stringify(jsonMesh.vertices));

        if(self.centerPivot.val)
        {
            var max=[-998999999,-998999999,-998999999];
            var min=[998999999,998999999,998999999];

            for(i=0;i<verts.length;i+=3)
            {
                max[0]=Math.max( max[0] , verts[i+0] );
                max[1]=Math.max( max[1] , verts[i+1] );
                max[2]=Math.max( max[2] , verts[i+2] );

                min[0]=Math.min( min[0] , verts[i+0] );
                min[1]=Math.min( min[1] , verts[i+1] );
                min[2]=Math.min( min[2] , verts[i+2] );
            }

            console.log('max',max);
            console.log('min',min);

            var off=[
                Math.abs(Math.abs(max[0])-Math.abs(min[0])),
                Math.abs(Math.abs(max[1])-Math.abs(min[1])),
                Math.abs(Math.abs(max[2])-Math.abs(min[2]))
            ];

            console.log('off',off);

            for(i=0;i<verts.length;i+=3)
            {
                verts[i+0]+=(off[0] );
                verts[i+1]+=(off[1] );
                verts[i+2]+=(off[2] );
            }

            max=[-998999999,-998999999,-998999999];
            min=[998999999,998999999,998999999];

            for(i=0;i<verts.length;i+=3)
            {
                max[0]=Math.max( max[0] , verts[i+0] );
                max[1]=Math.max( max[1] , verts[i+1] );
                max[2]=Math.max( max[2] , verts[i+2] );

                min[0]=Math.min( min[0] , verts[i+0] );
                min[1]=Math.min( min[1] , verts[i+1] );
                min[2]=Math.min( min[2] , verts[i+2] );
            }

            console.log('after max',max);
            console.log('after min',min);
        }

        var geom=new CGL.Geometry();
        // geom.calcNormals=true;
        geom.vertices=verts;
        geom.vertexNormals=jsonMesh.normals;
        geom.tangents=jsonMesh.tangents;
        geom.biTangents=jsonMesh.bitangents;

        if(jsonMesh.texturecoords) geom.texCoords = jsonMesh.texturecoords[0];
        geom.verticesIndices=[];

        // for(i=0;i<jsonMesh.faces.length;i++)
        // geom.verticesIndices=geom.verticesIndices.concat(jsonMesh.faces[i]);
        geom.verticesIndices=[].concat.apply([], jsonMesh.faces);

        var nfo='';
        nfo += geom.verticesIndices.length+' faces <br/>';
        nfo += geom.vertices.length+' vertices <br/>';
        nfo += geom.texCoords.length+' texturecoords <br/>';
        nfo += geom.vertexNormals.length+' normals <br/>';
        
        // console.log(geom.verticesIndices);
        
        self.uiAttr({info:nfo});

        self.geometryOut.val=geom;
        mesh=new CGL.Mesh(cgl,geom);
    }

}


this.render.onTriggered=render;
this.centerPivot.onValueChanged=function()
{
    mesh=null;
};

this.index.onValueChanged=reload;










