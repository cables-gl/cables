var patch=this.patch;
var cgl=this.patch.cgl;
Op.apply(this, arguments);

this.name='metroBusLines';
var self=this;

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"next",OP_PORT_TYPE_FUNCTION));
filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));

var time=this.addInPort(new Port(this,"time",OP_PORT_TYPE_VALUE));

var speed=this.addInPort(new Port(this,"speed",OP_PORT_TYPE_VALUE));
speed.set(0.08);



var outR=this.addOutPort(new Port(this,"r",OP_PORT_TYPE_VALUE));
var outG=this.addOutPort(new Port(this,"g",OP_PORT_TYPE_VALUE));
var outB=this.addOutPort(new Port(this,"b",OP_PORT_TYPE_VALUE));

var outIndex=this.addOutPort(new Port(this,"index",OP_PORT_TYPE_VALUE));


var data=null;
var anims=[];

// var speed=0.08;



var reload=function()
{

    CABLES.ajax(
        patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            try
            {
                data=JSON.parse(_data);
                console.log("data",data);
                // console.log("data",data.items.length);
                // self.uiAttr({'warning':' '});

                // console.log("! ! ! ! 1 ! ");
console.log('create anims...');

                var count=0;
                for(var i in data)
                {
                    // console.log("hjakhjlkashsa");
                    // console.log(i);
                    var anim={
                        posX:new CABLES.TL.Anim(),
                        posY:new CABLES.TL.Anim(),
                        posZ:new CABLES.TL.Anim(),
                        colr:Math.random()*1.5,
                        colg:Math.random()*1.5,
                        colb:Math.random()*1.5
                    };
                    
                    
                    count=0;

                    for(var j in data[i].items)
                    {
                        // if(count==0)console.log(data[i].items[j].latitude);
                        var time=count*0.1;

anim.posX.addKey(new CABLES.TL.Key({time:time,v:data[i].items[j].latitude-34}));
anim.posZ.addKey(new CABLES.TL.Key({time:time,v:data[i].items[j].longitude+118}));

                        // anim.posX.setValue(time,parseFloat(data[i].items[j].latitude)-34);
                        // anim.posZ.setValue(time,parseFloat(data[i].items[j].longitude)+118);

                        count++;
                    }
                    
                    // anim.posX.sortKeys();
                    // anim.posZ.sortKeys();
                    anims.push(anim);
                    // console.log('iiii',anim.posX.keys);


                }

console.log('anims OK...',anims.length);

            }
            catch(e)
            {
                self.uiAttr({'warning':'error loading json'});
            }
        });

};

filename.onValueChanged=reload;
var tempVec=vec3.create();
var index=0;

exe.onTriggered=function()
{
    var count=0;

    for(var i in anims)
    {
        if(i==0)
        {
            // console.log(anims[i].posX.keys);
        }
        
        var t = (time.get()*speed.get())% (0.1 * anims[i].posX.keys.length);

                    outIndex.set(i);

        cgl.pushMvMatrix();
        vec3.set(tempVec,
            anims[i].posX.getValue(t),
            0,
            anims[i].posZ.getValue(t)
            );

        outR.set(anims[i].colr);
        outG.set(anims[i].colg);
        outB.set(anims[i].colb);

        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, tempVec);
        trigger.trigger();
        cgl.popMvMatrix();

    

    }


};
