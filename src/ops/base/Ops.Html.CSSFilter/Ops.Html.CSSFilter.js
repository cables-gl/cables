const inEle=op.inObject("Element");
const inMethod=op.inValueSelect("method",["-","blur","brightness","contrast","grayscale","hue-rotate","invert","opacity","saturate","sepia"]);
const inVal=op.inValue("Value");

var suffix="";
var prefix="";

inVal.onChange=setValue;
inEle.onChange=setValue;

var oldEle=null;

function getCSSFilterString()
{
    return inMethod.get()+'('+inVal.get()+suffix+')';
}

inEle.onLinkChanged=function()
{
    // remove style when deleting op
    if(inEle.isLinked())return;

    const ele=oldEle;//inEle.get();

    if(ele && ele.style)
    {
        var filter=ele.style.filter;
        var str='';

        if(filter && filter.length>0)
        {
            var str='';
            var parts=filter.split(' ');
            for(var i=0;i<parts.length;i++)
            {
                if(parts[i].indexOf(inMethod.get())==0)
                    parts[i]='';
            }

            str=parts.join(' ');
        }
        ele.style.filter=str;
    }


};

function setValue()
{
    const ele=inEle.get();
    var str='';

    if(ele && ele.style)
    {
        if(ele!=oldEle) oldEle=ele;
        var foundMyFilter=false;
        var filter=ele.style.filter;

        if(filter && filter.length>0)
        {
            var parts=filter.split(' ');
            for(var i=0;i<parts.length;i++)
            {
                if(parts[i].indexOf(inMethod.get())==0)
                {
                    foundMyFilter=true;
                    parts[i]=getCSSFilterString();
                }
            }

            str=parts.join(' ');
        }

        if(!foundMyFilter)
            str+=' '+getCSSFilterString();

        ele.style.filter=str;
    }
}


inMethod.onChange=function()
{
    var m=inMethod.get();

    prefix=inMethod.get()+":";

    if(m=='blur') suffix='px';
    if(m=='brightness') suffix='';
    if(m=='contrast') suffix='%';
    if(m=='grayscale') suffix='%';
    if(m=='hue-rotate') suffix='deg';
    if(m=='invert') suffix='%';
    if(m=='opacity') suffix='%';
    if(m=='saturate') suffix='';
    if(m=='sepia') suffix='%';
    setValue();
};

