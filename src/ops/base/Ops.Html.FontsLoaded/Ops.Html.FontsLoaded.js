const loaded = op.outTrigger("Font Loaded");

document.fonts.ready.then(function (e)
{
//   console.log('All fonts in use by visible text have loaded.',e);
    loaded.trigger();
//   console.log('Roboto loaded? ' + document.fonts.check('1em Roboto'));  // true
});

document.fonts.onloadingdone = function (fontFaceSetEvent)
{
    // console.log(fontFaceSetEvent);
    //   console.log('onloadingdone we have ' + fontFaceSetEvent.fontfaces.length + ' font faces loaded');
    loaded.trigger();
};
