op.name="PointClusterBoundings";

var exe=op.addInPort(new Port(op,"Execute",OP_PORT_TYPE_FUNCTION));
var arr=op.addInPort(new Port(op,"Array",OP_PORT_TYPE_ARRAY));

var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));
var outx=op.addOutPort(new Port(op,"X",OP_PORT_TYPE_VALUE));
var outy=op.addOutPort(new Port(op,"Y",OP_PORT_TYPE_VALUE));
var outw=op.addOutPort(new Port(op,"Width",OP_PORT_TYPE_VALUE));
var outh=op.addOutPort(new Port(op,"Height",OP_PORT_TYPE_VALUE));
var outCol=op.addOutPort(new Port(op,"col",OP_PORT_TYPE_VALUE));
var outNumPoints=op.addOutPort(new Port(op,"Num Points",OP_PORT_TYPE_VALUE));
var outIndex=op.addOutPort(new Port(op,"Index",OP_PORT_TYPE_VALUE));
var outNumRects=op.addOutPort(new Port(op,"Num Clusters",OP_PORT_TYPE_VALUE));

arr.ignoreValueSerialize=true;

var rects=[];

var grid=[];
var gridMaxX=[];
var gridMaxY=[];
var gridMinX=[];
var gridMinY=[];

var gridWidth=10;
var gridHeight=10;

var NUMBER_MAX= 999999;
var NUMBER_MIN=-999999;

function gridIndex(x,y)
{
    if(x>gridWidth-1)x=gridWidth-1;
    if(y>gridHeight-1)y=gridHeight-1;
    if(x<0)x=0;
    if(y<0)y=0;
    return x+(y*gridWidth);
}

function findCluster(x,y,bounds)
{
    var index=gridIndex(x,y);
    if(grid[index]>0)
    {
        bounds.minX = Math.min( bounds.minX, gridMinX[ index ] );
        bounds.maxX = Math.max( bounds.maxX, gridMaxX[ index ] );
        bounds.minY = Math.min( bounds.minY, gridMinY[ index ] );
        bounds.maxY = Math.max( bounds.maxY, gridMaxY[ index ] );
        bounds.num+=grid[ index ];
        grid[ index ]=0;

        if( grid[ gridIndex(x+1,y) ] > 0) bounds=findCluster(x+1,y,bounds);
        if( grid[ gridIndex(x-1,y) ] > 0) bounds=findCluster(x-1,y,bounds);

        if( grid[ gridIndex(x+1,y+1) ] > 0) bounds=findCluster(x+1,y+1,bounds);
        if( grid[ gridIndex(x-1,y+1) ] > 0) bounds=findCluster(x-1,y+1,bounds);
        if( grid[ gridIndex(x+0,y+1) ] > 0) bounds=findCluster(x+0,y+1,bounds);
    
        if( grid[ gridIndex(x+1,y-1) ] > 0) bounds=findCluster(x+1,y-1,bounds);
        if( grid[ gridIndex(x-1,y-1) ] > 0) bounds=findCluster(x-1,y-1,bounds);
        if( grid[ gridIndex(x+0,y-1) ] > 0) bounds=findCluster(x+0,y-1,bounds);
    }
    
    return bounds;
}

var oldLength=-1;

exe.onTriggered=function()
{
    if(!arr.get())
    {
        console.log('no array');
        return;
    }

    if(arr.get().length!=oldLength)
    {
        console.log('upd');
        oldLength=arr.get().length;

        var ar=arr.get().slice(0);
    
        for(i=0;i<ar.length;i+=3)
        {
            ar[i+0]+=100;
            ar[i+1]+=100;
        }
    
        var maxX =NUMBER_MIN;
        var minX =NUMBER_MAX;
        var maxY =NUMBER_MIN;
        var minY =NUMBER_MAX;
        
        rects.length=0;
        var i=0;
        var j=0;
    
        grid.length=gridWidth*gridHeight;
        gridMaxX.length=(gridWidth+1)*(gridHeight+1);
        gridMinX.length=(gridWidth+1)*(gridHeight+1);
        gridMaxY.length=(gridWidth+1)*(gridHeight+1);
        gridMinY.length=(gridWidth+1)*(gridHeight+1);
    
        for(i=0;i<gridWidth*gridHeight;i++)
        {
            grid[i]=0;
            gridMaxX[i]=NUMBER_MIN;
            gridMinX[i]=NUMBER_MAX;
            gridMaxY[i]=NUMBER_MIN;
            gridMinY[i]=NUMBER_MAX;
        }
    
        // find max/min etc...
    
        for(i=0;i<ar.length;i+=3)
        {
            maxX=Math.max(maxX,ar[i+0]);
            minX=Math.min(minX,ar[i+0]);
            maxY=Math.max(maxY,ar[i+1]);
            minY=Math.min(minY,ar[i+1]);
        }
        
        var w=Math.abs(maxX-minX);
        var h=Math.abs(maxY-minY);
        
        // console.log('arr length',ar.length);
        // console.log('clusterpoints wh',w,h);
    
        // put points into low res grid system
    
        var stepX=w/(gridWidth-1);
        var stepY=h/(gridHeight-1);
    
        for(i=0;i<ar.length;i+=3)
        {
            var xx=Math.floor((ar[i+0]-minX)/stepX);
            var yy=Math.floor((ar[i+1]-minY)/stepY);
            var gridIndex=xx+(yy*gridWidth);
            grid[gridIndex]++;
    
            // update min/max for that grid...
            gridMaxX[gridIndex]=Math.max( gridMaxX[gridIndex], ar[i+0]);
            gridMinX[gridIndex]=Math.min( gridMinX[gridIndex], ar[i+0]);
            gridMaxY[gridIndex]=Math.max( gridMaxY[gridIndex], ar[i+1]);
            gridMinY[gridIndex]=Math.min( gridMinY[gridIndex], ar[i+1]);
        }    
    
        // setup boundingboxed of grids
    
        outCol.set(0.0);
        for(i=0;i<gridWidth;i++)
        {
            for(j=0;j<gridHeight;j++)
            {
                if(grid[i+j*gridWidth]>0)
                {
                    outx.set(minX+i*stepX-100);
                    outy.set(minY+j*stepY-100);
                    outw.set(stepX);
                    outh.set(stepY);
                    trigger.trigger();
                }
            }
        }
    
        outCol.set(1);
    
        for(i=0;i<gridWidth;i++)
            for(j=0;j<gridHeight;j++)
            {
                var bounds=findCluster(i,j,{minX:NUMBER_MAX,minY:NUMBER_MAX,maxX:NUMBER_MIN,maxY:NUMBER_MIN,num:0});
                if(
                    bounds.minX!=NUMBER_MAX && 
                    bounds.minY!=NUMBER_MAX &&
                    bounds.maxY!=NUMBER_MIN &&
                    bounds.maxX!=NUMBER_MIN 
                )
                {
                    var bigger=0.01;
                    // console.log(bounds.minX,bounds.maxX);
                    if(bounds.num>1)
                    rects.push(
                        {
                            x:bounds.minX-100,
                            y:bounds.minY-100,
                            w:Math.abs(bounds.maxX-bounds.minX),
                            h:Math.abs(bounds.maxY-bounds.minY)
                        });
                        
                }
            }
    
        // render all rects...
    
        // console.log(rects.length,rects[0]);
    }

outNumRects.set(rects.length);

    for(i=0;i<rects.length;i++)
    {
        outIndex.set(i);
        outx.set(rects[i].x);
        outy.set(rects[i].y);
        outw.set(rects[i].w);
        outh.set(rects[i].h);
        trigger.trigger();
    }
    


    
};
