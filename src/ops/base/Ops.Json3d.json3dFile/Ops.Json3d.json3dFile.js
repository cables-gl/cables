CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='json3dFile';
var scene=new CABLES.Variable();

cgl.frameStore.currentScene=null;

this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

// var saveChilds=this.addInPort(new Port(this,"save childs",OP_PORT_TYPE_VALUE,{ display:'bool' }));
// saveChilds.onValueChanged=function()
// {
// trigger.ignoreValueSerialize=!saveChilds.get();
// }
// saveChilds.set(true);



function render()
{
    var oldScene=cgl.frameStore.currentScene;
    cgl.frameStore.currentScene=scene;
    trigger.trigger();
    cgl.frameStore.currentScene=oldScene;
}

this.exe.onTriggered=render;

function dataGetAnimation(data,name)
{
    if(!data.hasOwnProperty('animations')) return false;
    
    for(var iChannels in data.animations[0].channels)
    {
        if(data.animations[0].channels[iChannels].name==name)
        {
            console.log('anim found for '+name);
            // console.log( data.animations.channels[iChannels] );
            return data.animations[0].channels[iChannels];
        }
        
    }
    return false;

}

var maxx=-3;
var row=0;
function addChild(data,x,y,parentOp,parentPort,ch)
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
            transOp.uiAttribs.title=transOp.name=ch.name+' transform';
        }

        if(ch.children)console.log('ch ',ch.name,ch.children.length);

        self.patch.link(parentOp,parentPort,transOp,'render');


        var i=0;
        if(ch.hasOwnProperty('meshes'))
        {
            for(i=0;i<ch.meshes.length;i++)
            {
                var index=ch.meshes[i];
                var posyAdd=0;
                var prevOp=transOp;
                
                {
                    // animation
                    
                    if(data.hasOwnProperty('animations'))
                    {
                        var an=dataGetAnimation(data,ch.name);
                        if(an)
                        {
                            if(an.positionkeys && an.positionkeys.length>0)
                            {
                                posyAdd+=50;
                                var anTransOp=self.patch.addOp('Ops.Gl.Matrix.Transform.v2',{translate:{x:posx,y:posy+posyAdd}});
                                anTransOp.uiAttribs.title=anTransOp.name=ch.name+' trans anim';
                                self.patch.link(prevOp,'trigger',anTransOp,'render');
                                prevOp=anTransOp;
                
                                anTransOp.getPort('posX').setAnimated(true);
                                anTransOp.getPort('posY').setAnimated(true);
                                anTransOp.getPort('posZ').setAnimated(true);
                                
                                for(var k in an.positionkeys)
                                {
                                    anTransOp.getPort('posX').anim.setValue( an.positionkeys[k][0],an.positionkeys[k][1][0] );
                                    anTransOp.getPort('posY').anim.setValue( an.positionkeys[k][0],an.positionkeys[k][1][1] );
                                    anTransOp.getPort('posZ').anim.setValue( an.positionkeys[k][0],an.positionkeys[k][1][2] );
                                }
                            }
                            if(an.rotationkeys && an.rotationkeys.length>0)
                            {
                                posyAdd+=50;
                                var anRotOp=self.patch.addOp('Ops.Gl.Matrix.Quaternion',{translate:{x:posx,y:posy+posyAdd}});
                                anRotOp.uiAttribs.title=anRotOp.name=ch.name+' quat rot anim';
                                self.patch.link(prevOp,'trigger',anRotOp,'render');
                                prevOp=anRotOp;
                
                                anRotOp.getPort('x').setAnimated(true);
                                anRotOp.getPort('y').setAnimated(true);
                                anRotOp.getPort('z').setAnimated(true);
                                anRotOp.getPort('w').setAnimated(true);
                                
                                for(var k in an.rotationkeys)
                                {
                                    console.log('time:',an.rotationkeys[k][0]);
                                    console.log('val:',an.rotationkeys[k][1]);
                                    
                                    anRotOp.getPort('w').anim.setValue( an.rotationkeys[k][0],an.rotationkeys[k][1][0] );
                                    anRotOp.getPort('x').anim.setValue( an.rotationkeys[k][0],an.rotationkeys[k][1][1] );
                                    anRotOp.getPort('z').anim.setValue( an.rotationkeys[k][0],an.rotationkeys[k][1][2] );
                                    anRotOp.getPort('y').anim.setValue( an.rotationkeys[k][0],an.rotationkeys[k][1][3] );
                                }
                            }

                        }
                    }
                }        
                
                {
                    // material
                    if(data.meshes[index].hasOwnProperty('materialindex') &&
                        data.hasOwnProperty('materials'))
                    {
                        var matIndex=data.meshes[index].materialindex;
                        var jsonMat=data.materials[matIndex];
                        for(var j in jsonMat.properties)
                        {
                            if(jsonMat.properties[j].key && jsonMat.properties[j].value && jsonMat.properties[j].key=='$clr.diffuse')
                            {
                                posyAdd+=50;
                                var matOp=self.patch.addOp('Ops.Gl.Phong.PhongMaterial',{translate:{x:posx,y:posy+posyAdd}});
                                matOp.getPort('diffuse r').set( jsonMat.properties[j].value[0] );
                                matOp.getPort('diffuse g').set( jsonMat.properties[j].value[1] );
                                matOp.getPort('diffuse b').set( jsonMat.properties[j].value[2] );
                                matOp.uiAttribs.title=matOp.name=ch.name+' Material';
                        
                                self.patch.link(prevOp,'trigger',matOp,'render');
                                prevOp=matOp;
                            }
                        }
                    }
                    
                }

                // mesh
                posyAdd+=50;
                var meshOp=self.patch.addOp('Ops.Json3d.Mesh',{translate:{x:posx,y:posy+posyAdd}});
                meshOp.index.val=index;
                meshOp.uiAttribs.title=meshOp.name=ch.name+' Mesh';

                self.patch.link(prevOp,'trigger',meshOp,'render');
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
                addChild(data,xx,y,transOp,'trigger',ch.children[i]);
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

            if(data.hasOwnProperty('animations'))
            {
                console.log("has "+data.animations.length+" animations!"+data.animations[0].name+" - "+data.animations[0].duration);
            }

            if(!trigger.isLinked())
            {
                var root=self.patch.addOp('Ops.Sequence',{translate:{x:self.uiAttribs.translate.x,y:self.uiAttribs.translate.y+50}});
                self.patch.link(self,'trigger',root,'exe');

                for(var i=0;i<data.rootnode.children.length;i++)
                {
                    var ntrigger=i;
                    if(ntrigger>9)ntrigger=9;
                    addChild(data,maxx-2,3,root,'trigger '+ntrigger,data.rootnode.children[i]);
                }
            }

            render();
            self.patch.loading.finished(loadingId);

        });

};

this.filename.onValueChanged=reload;