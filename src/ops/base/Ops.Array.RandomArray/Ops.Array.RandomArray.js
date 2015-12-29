    Op.apply(this, arguments);

    this.name='RandomArray';
    
    var numValues=this.addInPort(new Port(this, "numValues",OP_PORT_TYPE_VALUE));
    var seed=this.addInPort(new Port(this,"random seed"));

    var values=this.addOutPort(new Port(this, "values",OP_PORT_TYPE_ARRAY));
    var arr=[];


    var init = function()
    {

        Math.randomSeed=seed.get();

        arr.length=numValues.get();
        for(var i=0;i<arr.length;i++)
        {
            arr[i]=Math.seededRandom();//Math.random();
        }
        values.val=arr;
    };
    
    numValues.onValueChanged=init;
    seed.onValueChanged=init;

    numValues.set(100);
