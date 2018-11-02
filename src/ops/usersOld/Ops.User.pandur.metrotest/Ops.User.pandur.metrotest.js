var filename=op.addInPort(new CABLES.Port(op,"file",CABLES.OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var geomOut=op.addOutPort(new CABLES.Port(op,"geom",CABLES.OP_PORT_TYPE_OBJECT));

geomOut.ignoreValueSerialize=true;
var patch=op.patch;
var geom=new CGL.Geometry();

var loadingId=0;

function buildGeom(data)
{
    var verts=[];
    geom.clear();
    verts.length=data.length*3;
    
    for(var i=0;i<data.length;i++)
    {
        verts[i*3+0]=data[i].lat;
        verts[i*3+1]=data[i].lon;
        verts[i*3+2]=0;
    }

    geom.setPointVertices(verts);
    geomOut.set(geom);
}


var reload=function()
{
    loadingId=patch.loading.start('jsonFile',''+filename.get());

    CABLES.ajax(
        patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            if(err)
            {
                console.log(err);
            }
            try
            {
                var data=JSON.parse(_data);
                op.uiAttr({'error':''});

                buildGeom(data);
                patch.loading.finished(loadingId);
            }
            catch(e)
            {
                if(CABLES.UI) CABLES.UI.MODAL.showException(e);

                op.uiAttr({'error':'error loading json'});
                patch.loading.finished(loadingId);
            }
        });
    
};

filename.onChange=reload;