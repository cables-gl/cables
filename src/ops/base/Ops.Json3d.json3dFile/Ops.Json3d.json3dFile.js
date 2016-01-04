CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='json3dFile';
var scene=new CABLES.Variable();

cgl.frameStore.currentScene=null;

this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

function render()
{
    var oldScene=cgl.frameStore.currentScene;
    cgl.frameStore.currentScene=scene;
    self.trigger.trigger();
    cgl.frameStore.currentScene=oldScene;
}

this.exe.onTriggered=render;

var maxx=-3;
var row=0;
function addChild(x,y,parentOp,parentPort,ch)
{
    if(ch.hasOwnProperty('transformation'))
    {
        maxx=Math.max(x,maxx)+1;

        var posx=self.uiAttribs.translate.x+x*130;
        if(ch.children && ch.children.length>1) posx=posx+(ch.children.length+1)*130/2;// center
        var posy=self.uiAttribs.translate.y+y*50;

        var transOp=self.patch.addOp('Ops.Gl.Matrix.MatrixMul',{translate:{x:posx,y:posy}});
        var mat=ch.transformation;
        mat4.transpose(mat,mat);
        transOp.matrix.val=ch.transformation;

        if(ch.name)
        {
            transOp.uiAttribs.title=transOp.name=ch.name;
        }

        if(ch.children)console.log('ch ',ch.name,ch.children.length);

        self.patch.link(parentOp,parentPort,transOp,'render');

        var i=0;
        if(ch.hasOwnProperty('meshes'))
        {
            for(i=0;i<ch.meshes.length;i++)
            {
                console.log('   meshes...'+i);
                var index=ch.meshes[i];

                var meshOp=self.patch.addOp('Ops.Json3d.Mesh',{translate:{x:posx,y:posy+50}});
                meshOp.index.val=index;


                meshOp.uiAttribs.title=meshOp.name=transOp.name+' Mesh';
                // scene.meshes[index].name=meshOp.name;

                self.patch.link(transOp,'trigger',meshOp,'render');
            }
        }

        if(ch.hasOwnProperty('children'))
        {
            y++;
            for(i=0;i<ch.children.length;i++)
            {
                console.log('   child...');
                var xx=maxx;
                if(ch.children.length>1)xx++;
                addChild(xx,y,transOp,'trigger',ch.children[i]);
            }
        }
    }
}


var reload=function()
{
    if(!self.filename.get())return;

    // console.log('load ajax'+self.patch.getFilePath(self.filename.val));
    var loadingId=self.patch.loading.start('json3dFile',self.filename.get());

    CABLES.ajax(
        self.patch.getFilePath(self.filename.val),
        function(err,_data,xhr)
        {
            if(err)
            {
                console.log('ajax error:',err);
                self.patch.loading.finished(loadingId);
                return;
            }
            var data=JSON.parse(_data);
            scene.setValue(data);


            if(!self.trigger.isLinked())
            {
                var root=self.patch.addOp('Ops.Sequence',{translate:{x:self.uiAttribs.translate.x,y:self.uiAttribs.translate.y+50}});
                self.patch.link(self,'trigger',root,'exe');

                for(var i=0;i<data.rootnode.children.length;i++)
                {
                    addChild(maxx-2,3,root,'trigger 0',data.rootnode.children[i]);
                }
            }

            render();
            self.patch.loading.finished(loadingId);

        });

};

this.filename.onValueChanged=reload;