// vars
const CSS_ELEMENT_ID = 'cables-sidebar-style'; /* id for the style element to be generated */
const SIDEBAR_CLASS = 'sidebar';
const SIDEBAR_ITEMS_CLASS = 'sidebar__items'
const SIDEBAR_OPEN_CLOSE_BTN_CLASS = 'sidebar__close-button';
const BTN_TEXT_OPEN = 'Close';
const BTN_TEXT_CLOSED = 'Show Controls';
var cssFileContent = attachments.style_css; /* the CSS style attachment */
let openCloseBtn = null;

// inputs
var visiblePort = op.inValueBool("Visible", true);
var opacityPort = op.inValueSlider('Opacity', 1)
var defaultMinimizedPort = op.inValueBool('Default Minimized');

// outputs
var childrenPort = op.outObject('childs');

var sidebarEl = document.querySelector('.' + SIDEBAR_CLASS);
if(!sidebarEl) {
    sidebarEl = initSidebarElement();    
}
var sidebarItemsEl = sidebarEl.querySelector('.' + SIDEBAR_ITEMS_CLASS);
childrenPort.set({
    parentElement: sidebarItemsEl,
    parentOp: op,
});
onDefaultMinimizedPortChanged();
initSidebarCss();

// change listeners
visiblePort.onChange = onVisiblePortChange;
opacityPort.onChange = onOpacityPortChange;
defaultMinimizedPort.onChange = onDefaultMinimizedPortChanged;

// functions

function onDefaultMinimizedPortChanged() {
    if(!openCloseBtn) { return; }
    if(defaultMinimizedPort.get()) {
        sidebarEl.classList.add('sidebar--closed');    
        openCloseBtn.textContent = BTN_TEXT_CLOSED;
    } else {
        sidebarEl.classList.remove('sidebar--closed');    
        openCloseBtn.textContent = BTN_TEXT_OPEN;
    }
}

function onOpacityPortChange() {
    var opacity = opacityPort.get();
    sidebarEl.style.opacity = opacity;    
}

function onVisiblePortChange() {
    if(visiblePort.get()) {
        sidebarEl.style.display = 'block';    
    } else {
        sidebarEl.style.display = 'none';    
    }
}

function initSidebarElement() {
    var element = document.createElement('div');
    element.classList.add(SIDEBAR_CLASS);    
    var canvasWrapper = op.patch.cgl.canvas.parentElement; /* maybe this is bad outside cables!? */
    canvasWrapper.appendChild(element);
    var items = document.createElement('div');
    items.classList.add(SIDEBAR_ITEMS_CLASS);
    element.appendChild(items);
    openCloseBtn = document.createElement('div');
    openCloseBtn.classList.add(SIDEBAR_OPEN_CLOSE_BTN_CLASS);
    openCloseBtn.addEventListener('click', onOpenCloseBtnClick);
    openCloseBtn.textContent = BTN_TEXT_OPEN;
    element.appendChild(openCloseBtn);
    return element;
}

function onOpenCloseBtnClick(ev) {
  ev.stopPropagation();
  const sidebarEl = ev.target.closest('.' + SIDEBAR_CLASS)
  if(!sidebarEl) { console.error('Sidebar could not be closed...'); return; }
  sidebarEl.classList.toggle('sidebar--closed');
  const btn = ev.target;
  let btnText = BTN_TEXT_OPEN;
  if(sidebarEl.classList.contains('sidebar--closed')) {
    btnText = BTN_TEXT_CLOSED;
   }
   btn.textContent = btnText
}

function initSidebarCss() {
    var cssEl = document.getElementById(CSS_ELEMENT_ID);
    if(!cssEl) {
        cssEl = document.createElement('style')
        cssEl.innerHTML = cssFileContent;
        document.body.appendChild(cssEl);
    }
}

