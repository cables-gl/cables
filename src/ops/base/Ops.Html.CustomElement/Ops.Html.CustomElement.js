// constants
var ELEMENT_TYPE_DEFAULT_TEXT = 'Select one...'
var ELEMENT_TYPES = [
    ELEMENT_TYPE_DEFAULT_TEXT,
    'span',
    'div',
    'a',
    'abbr',
    'address',
    'area',
    'article',
    'aside',
    'audio',
    'base',
    'bdi',
    'bdo',
    'blockquote',
    'br',
    'button',
    'canvas',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'datalist',
    'dd',
    'del',
    'details',
    'dfn',
    'dialog',
    'dl',
    'dt',
    'em',
    'embed',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hr',
    'i',
    'iframe',
    'img',
    'input',
    'ins',
    'kbd',
    'label',
    'legend',
    'li',
    'link',
    'main',
    'map',
    'mark',
    'menu',
    'menuitem',
    'meta',
    'meter',
    'nav',
    'noscript',
    'object',
    'ol',
    'optgroup',
    'option',
    'option',
    'output',
    'p',
    'param',
    'picture',
    'pre',
    'progress',
    'q',
    'rp',
    'rt',
    'ruby',
    's',
    'samp',
    'script',
    'section',
    'select',
    'small',
    'source',
    'strong',
    'style',
    'sub',
    'summary',
    'sup',
    'table',
    'tbody',
    'td',
    'template',
    'textarea',
    'tfoot',
    'th',
    'thead',
    'time',
    'title',
    'tr',
    'track',
    'u',
    'ul',
    'var',
    'video',
    'wbr',
];

console.log('op: ', op);

var PARENT = op.patch.cgl.canvas;

// inputs
var elTypePort = op.inValueSelect('Element Type', ELEMENT_TYPES, ELEMENT_TYPE_DEFAULT_TEXT);
var idPort = op.inValueString("Id");
var classPort = op.inValueString("Class");
var textPort = op.inValueString("Text");
var stylePort = op.inValueEditor("Inline Style", "/* e.g. position: absolute; */", "css");
var visiblePort = op.inValueBool("Visible", true);

// outputs
var elementPort = op.outObject("DOM Element");

// variables
var el = null;

// el = document.createElement('div');

// var canvas = op.patch.cgl.canvas;
// PARENT.appendChild(div);
// elementPort.set(div);

classPort.onChange = updateClass;
textPort.onChange = updateText;
stylePort.onChange = updateStyle;
visiblePort.onChange = updateVisibility;
elTypePort.onChange = recreateElement;

function setAllProperties() {
    updateId();
    updateClass();
    updateText();
    updateStyle();
    updateVisibility();
}

function recreateElement() {
    deleteElement();
    el = null;
    var elType = elTypePort.get();
    // TODO: Set Op Name to Element type here
    if(elType === ELEMENT_TYPE_DEFAULT_TEXT) { return; }
    op.log('elType: ', elType);
    if(elType) {
        el = document.createElement(elType);
        PARENT.appendChild(el);
    }
    setAllProperties();
    op.log('el: ', el);
    elementPort.set(el);
}

function updateVisibility() {
    if(!el) { return; }
    var isVisible = visiblePort.get();
    if(isVisible) {
        el.style.visibility = 'visible';
    } else {
        el.style.visibility = 'hidden';
    }
}

function updateText() {
    if(!el) { return; }
    el.innerHTML = textPort.get();
}

function deleteElement() {
    if(!el) { return; }
    el.remove();    
}

function updateId() {
    if(!el) { return; }
    el.id = idPort.get();
}

op.onDelete = function() {
    deleteElement();
};

function updateStyle() {
    if(!el) { return; }
    el.setAttribute('style', stylePort.get());
}

function updateClass() {
    if(!el) { return; }
    el.setAttribute('class', classPort.get());
}

/*
function onMouseEnter() {
    outHover.set(true);
}

function onMouseLeave() {
    outHover.set(false);
}

function onMouseClick()
{
    outClicked.trigger();
}

function updateInteractive()
{
    removeListeners();
    if(inInteractive.get()) addListeners();
}

function removeListeners()
{
    if(listenerElement)
    {
        listenerElement.removeEventListener('click', onMouseClick);
        listenerElement.removeEventListener('mouseleave', onMouseLeave);
        listenerElement.removeEventListener('mouseenter', onMouseEnter);
        listenerElement=null;
    }
}

function addListeners()
{
    if(listenerElement)removeListeners();
    
    listenerElement=div;

    if(listenerElement)
    {
        listenerElement.addEventListener('click', onMouseClick);
        listenerElement.addEventListener('mouseleave', onMouseLeave);
        listenerElement.addEventListener('mouseenter', onMouseEnter);
    }
}
*/
