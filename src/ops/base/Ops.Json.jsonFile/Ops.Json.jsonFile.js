    var self=this;
    Op.apply(this, arguments);

    this.name='jsonFile';

    this.filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
    this.result=this.addOutPort(new Port(this,"result",OP_PORT_TYPE_OBJECT));

    var reload=function()
    {

    CABLES.ajax(
        self.patch.getFilePath(self.filename.val),
        function(err,_data,xhr)
        {
            var data=JSON.parse(_data);
            self.result.val=data;
            console.log('data',data);

        });
        
        // ajaxRequest(self.patch.getFilePath(self.filename.val),function(data)
        // {
        //     self.result.val=data;
        //     console.log('data',data);

        // });
    };

    this.filename.onValueChanged=reload;