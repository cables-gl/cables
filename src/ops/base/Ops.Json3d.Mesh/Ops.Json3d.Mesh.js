
op.name='json3d Mesh';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION ));
var index=op.addInPort(new Port(op,"mesh index",OP_PORT_TYPE_VALUE,{type:'string'} ));
var centerPivot=op.addInPort(new Port(op,"center pivot",OP_PORT_TYPE_VALUE,{display:'bool'} ));
var next=op.addOutPort(new Port(op,"next",OP_PORT_TYPE_FUNCTION));

var geometryOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT ));
var draw=op.addInPort(new Port(op,"draw",OP_PORT_TYPE_VALUE,{display:'bool'}));

index.set(-1);
geometryOut.ignoreValueSerialize=true;
centerPivot.set(false);
draw.set(true);

var cgl=op.patch.cgl;
var mesh=null;
var currentIndex=-1;

index.onValueChanged=reload;
render.onTriggered=doRender;

function doRender()
{
    if(!mesh && cgl.frameStore.currentScene && cgl.frameStore.currentScene.getValue() || currentIndex!=index.get()) reload();
    if(draw.get())
    {
        if(mesh!==null) mesh.render(cgl.getShader());
        next.trigger();
    }
}

function reload()
{
    if(!cgl.frameStore.currentScene || !cgl.frameStore.currentScene.getValue())return;
    var meshes=cgl.frameStore.currentScene.getValue().meshes;

    if(cgl.frameStore.currentScene && cgl.frameStore.currentScene.getValue() && index.get()>=0)
    {
        op.uiAttr({warning:''});
        op.uiAttr({info:''});

        var jsonMesh=null;

        currentIndex=index.get();

        if(isNumeric(index.get()))
        {
            if(index.get()<0 || index.get()>=cgl.frameStore.currentScene.getValue().meshes.length)
            {
                op.uiAttr({warning:'mesh not found - index out of range '});
                return;
            }

            jsonMesh=cgl.frameStore.currentScene.getValue().meshes[parseInt(index.get(),10) ];
        }
        // else
        // {
        //     var scene=cgl.frameStore.currentScene.getValue();
        // }

        if(!jsonMesh)
        {
            mesh=null;
            op.uiAttr({warning:'mesh not found'});
            return;
        }
        op.uiAttribs.warning='';

        var i=0;

        var verts=JSON.parse(JSON.stringify(jsonMesh.vertices));

        if(centerPivot.get())
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
        geom.vertices=verts;
        geom.vertexNormals=jsonMesh.normals;
        geom.tangents=jsonMesh.tangents;
        geom.biTangents=jsonMesh.bitangents;

        if(jsonMesh.texturecoords) geom.texCoords = jsonMesh.texturecoords[0];
        geom.verticesIndices=[];
        geom.verticesIndices=[].concat.apply([], jsonMesh.faces);

        var nfo='';
        nfo += geom.verticesIndices.length+' faces <br/>';
        nfo += geom.vertices.length+' vertices <br/>';
        nfo += geom.texCoords.length+' texturecoords <br/>';
        nfo += geom.vertexNormals.length+' normals <br/>';
        
        op.uiAttr({info:nfo});

        geometryOut.set(geom);
        mesh=new CGL.Mesh(cgl,geom);
    }

}



centerPivot.onValueChanged=function()
{
    mesh=null;
};

