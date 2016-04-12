this.name="Ops.user.tim.CablesIntro";

$.getScript( 'https://cdnjs.cloudflare.com/ajax/libs/intro.js/2.0.0/intro.min.js', function( data, textStatus, jqxhr ) {
  /*console.log( data ); // Data returned
  console.log( textStatus ); // Success
  console.log( jqxhr.status ); // 200*/
  console.log( "intro.js loaded..." );
  
  /* Add intro.js stylesheet to page */
  $('head').append('<link rel="stylesheet" type="text/css" href="//cdn.bootcss.com/intro.js/2.0.0/introjs.min.css">');
  /*$('head').append('<link rel="stylesheet" type="text/css" href="css/introjs-themes/introjs-nassim.css">');*/
  
  /* Define intros */
  $('#project_settings').parent().parent().parent()
    .attr("data-step", 1)
    .attr("data-intro", "Settings panel, where you can access all project settings. If you select an op in the patch panel you will see its settings here instead.")
    .attr("data-position", "left");
  $('#glcanvas')
    .attr("data-step", 2)
    .attr("data-intro", "WebGL canvas where the visual output will be rendered to.")
    .attr("data-position", "bottom");
  $('#infoArea')
    .attr("data-step", 3)
    .attr("data-intro", "Hover over any element on the page to receive some information in the info panel.")
    .attr("data-position", "left");    
  $('#projectfiles')
    .attr("data-step", 4)
    .attr("data-intro", "Easily upload project files (images, 3D-models, audio-files) by drag and dropping them to the files panel.")
    .attr("data-position", "left");
  $('#patch')
    .attr("data-step", 5)
    .attr("data-intro", "This is the most important part of <i>cables</i> – the patch panel – here you can connect ops together and create something.")
    .attr("data-position", "right");
  $('.cables')
    .attr("data-step", 6)
    .attr("data-intro", "On the main cables site you can browse through public projects / examples and get some inspiration.")
    .attr("data-position", "bottom");
  
  /* SVGs cannot be used right now, see https://github.com/usablica/intro.js/issues/66*/
  /*$('text').each(function() {
    if( $(this).text() === "renderer"){ // TODO: Change to "Renderer" after rename
    console.log($(this).prev());
      $(this).prev()
        .attr("data-step", 7)
        .attr("data-intro", "Renderer-op, this is the first op you should add if you want to generate visual outcome.")
        .attr("data-position", "bottom");
    } 
  });
  $('rect')
    .attr("data-step", 1)
    .attr("data-intro", "Rect")
    .attr("data-position", "bottom");*/
    
    /* Disables intro.js for the current logged-in user */
  function disableIntroForUser(){
      op.log("Intro completed");
      
      // TODO
  }    
    
    addIntroJsStyles();
    
    introJs()
        .oncomplete(disableIntroForUser)
        /*introJs().onbeforechange(function(targetElement) {
          addIntroJsStyles();
        })*/
        .onafterchange(function(targetElement) {
          addIntroJsStyles();
        })
        /*.onchange(function(targetElement) {
            addIntroJsStyles();
        })*/
        .setOptions({ 
            'showBullets': false, 
            'skipLabel': 'Close', 
            'showProgress': true, 
            'tooltipPosition': "left"
        })
        .start()
        ;
        
    addIntroJsStyles();
});

function addIntroJsStyles(){
  /*$('.introjs-overlay')
    .css("display", "none")
    .css("background", "rgba(0, 0, 0, 0.2) !important")
    .css("background-color", "rgba(0, 0, 0, 0.2) !important")
    ;*/
  $('.introjs-helperLayer')
    .css("background", "rgba(255, 255, 255, 0.2)")
    .css("background-color", "rgba(255, 255, 255, 0.2)")
    .css("background-color", "transparent")
    /*.css("transition", "none")
    .css("-moz-transition", "none")
    .css("-webkit-transition", "none")*/
    .css("border-radius", "0")
    .css("border-top-left-radius", "0")
    .css("border-top-right-radius", "0")
    .css("border-bottom-right-radius", "0")
    .css("border-bottom-left-radius", "0")
    .css("border", "1px solid white")
    ;
  $('.introjs-tooltip')
    .css("background-color", "white")
    .css("border", "none")
    .css("border-radius", "0")
    .css("box-shadow", "none")
    /*.css("padding","20px")*/
    ;
  $('.introjs-tooltipReferenceLayer')
    .css("border","1px solid white")
    .css("border-radius", "0")
    .css("z-index", "1000000")
    ;    
  $('.introjs-tooltiptext')
    .css("color", "black")
    ;
  $('.introjs-helperNumberLayer')
    .css("padding", "20px")
    .css("display", "none")
    .css("background-color", "black")
    .css("background", "black")
    .css("text-shadow", "none")
    .css("color", "white")
    .css("box-shadow", "none")
    .css("border-radius", "1px solid white")
    .css("left", "-13")
    .css("top", "-13")
    ;
  $('.introjs-button')
    .css("border-radius", "0")
    .css("padding", "4px 10px")
    ;
  $('.introjs-showElement')
    .css("z-index", "1000")
    ;
}