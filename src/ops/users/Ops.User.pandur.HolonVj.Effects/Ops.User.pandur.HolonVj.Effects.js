op.name="Effects";
var effects=op.addInPort(new Port(op,"Effects",OP_PORT_TYPE_ARRAY));
var array=op.addInPort(new Port(op,"Points Array",OP_PORT_TYPE_ARRAY));
var outArray=op.addOutPort(new Port(op,"Points",OP_PORT_TYPE_ARRAY));


var count=0;
array.onValueChanged=function()
{
    
    var effects=[1,0];
    
    
    if(array.get())
    {
        var arr = array.get().slice(0);
    
        for(var e=0;e<effects.length;e++)
        {
            for(var i=0;i<arr.length;i+=6)
            {
                
                if(effects[e]===0)
                {
                    if(arr[i+1]<100)
                    {
                        arr[i+0]*=1.0-(arr[i+1]*0.0008);
                    }
                    else
                    {
                        arr[i+0]*=(arr[i+1]*0.0008);
                    }
                }
                
                if(effects[e]==2)
                {
                    if(arr[i+1]<0 && arr[i+1]>-100)
                    {
                        arr[i+0]*=1.0-(arr[i+1]*0.0008);
                    }
                }
                
                if(effects[e]==1)
                {
                    if(i%24===0)
                    {
                        arr[i+3]=0;
                        arr[i+4]=0;
                        arr[i+5]=0;
                    }
                    
                }
                
            }
            
        }
    
        
        outArray.set(null);
        outArray.set(arr);
        
    }
    count++;
    
};