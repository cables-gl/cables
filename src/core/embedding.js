
CABLES=CABLES||{};
CABLES.EMBED=CABLES.EMBED||{};
CABLES.EMBED.addPatch=function(_element,options)
{
    var el=_element;
    var id=CABLES.generateUUID();
    if(typeof _element=="string" )
    {
        id=_element;
        el=document.getElementById(id);

        if(!el)
        {
            console.error(id+' Polyshape Container Element not found!');
            return;
        }
    }

    var canvEl=document.createElement("canvas");
    canvEl.id="glcanvas_"+id;
    canvEl.width=el.clientWidth;
    canvEl.height=el.clientHeight;

    window.addEventListener( 'resize',
        function()
        {
            this.setAttribute("width",el.clientWidth);
            this.height=el.clientHeight;
        }.bind(canvEl));

    el.appendChild(canvEl);

    options=options||{};
    options.glCanvasId=canvEl.id;
    options.onError=alert;

    CABLES.patch=new CABLES.Patch(options);
    return canvEl;
};
