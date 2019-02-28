const
    inW=op.inValueInt("Width"),
    inH=op.inValueInt("Height"),
    inStrat=op.inValueSelect("Strategy",['floor','floor/2','ceil'],'floor'),
    outW=op.outValue("Width Result"),
    outH=op.outValue("Height Result")
    ;

inStrat.onChange=updateStrategy;
inW.onChange=inH.onChange=update;
var getPOT=null;
updateStrategy();


function isPOT(x)
{
    return ( x == 1 || x == 2 || x == 4 || x == 8 || x == 16 || x == 32 || x == 64 || x == 128 || x == 256 || x == 512 || x == 1024 || x == 2048 || x == 4096 || x == 8192 || x == 16384);
}

function updateStrategy()
{
    var s=inStrat.get();

    if(s=='floor')getPOT=getPotNextfloor;
    if(s=='floor/2')getPOT=getPotNextfloorx2;
    if(s=='ceil')getPOT=getPotNextBigger;
    if(s=='nearest')getPOT=getPotNearest;

    update();
}

function getPotNextBigger(x)
{
    // if(x>8192)return 16384;
    // if(x>4096)return 8129;
    if(x>2048)return 4096;
    if(x>1024)return 2048;
    if(x>512)return 1024;
    if(x>256)return 512;
    if(x>128)return 256;
    if(x>64)return 128;
    if(x>32)return 64;
    if(x>16)return 32;
    if(x>8)return 16;
    if(x>4)return 8;
    if(x>2)return 4;
}

function getPotNextfloorx2(x)
{
    return Math.ceil(getPotNextfloor(x)/2);
}

function getPotNextfloor(x)
{
    if(x<2)return 1;
    if(x<4)return 2;
    if(x<8)return 4;
    if(x<16)return 8;
    if(x<32)return 16;
    if(x<64)return 32;
    if(x<128)return 64;
    if(x<256)return 128;
    if(x<512)return 256;
    if(x<1024)return 512;
    if(x<2048)return 1024;
    if(x<4096)return 2048;
    if(x<8192)return 4096;
    // if(x<16384)return 8192;
}

function getPotNearest(x)
{
    if(x>3072)return 4096;
    if(x>1536)return 2048;
    if(x>768)return 1024;
    if(x>320)return 512;
    if(x>191)return 256;
    if(x>95)return 128;
    if(x>47)return 64;
    if(x>23)return 32;
    if(x>11)return 16;
    if(x>5)return 8;
    if(x>3)return 4;
    return 2;
}


function update()
{
    var w=inW.get();
    var h=inH.get();

    if(!isPOT(w)) w = getPOT(w);
    if(!isPOT(h)) h = getPOT(h);

    outW.set(w);
    outH.set(h);

}