const
    inEle=op.inObject("HTML Element"),
    inClassName=op.inString("Classname"),
    inActive=op.inValueBool("Active",true);

inActive.onChange=
    inClassName.onChange=
    inEle.onChange=update;

var oldEle=null;

function update()
{
    var ele=inEle.get();
    var cn=inClassName.get();

    if(!cn || !ele || !ele.classList)return;
    if(oldEle && ele!=oldEle)oldEle.classList.remove(cn);

    if(!inActive.get()) ele.classList.remove(cn);
        else ele.classList.add(cn);

    oldEle=ele;
}