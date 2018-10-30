var connection=op.inObject("Connection");

var outMsg=op.outValue("Message");

connection.onChange=function()
{
    var conn=connection.get();
    if(!conn)return;
    
    conn.on("event",function(r)
    {
        
        
        
        outMsg.set(r);
    });
};

