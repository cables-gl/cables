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
    .attr("data-intro", "Settings panel, where you can access all project settings. If you select an op in the patch panel you will see its settings here instead.");
  $('#glcanvas')
    .attr("data-step", 2)
    .attr("data-intro", "WebGL canvas where the visual output will be rendered to.");
  $('#infoArea')
    .attr("data-step", 3)
    .attr("data-intro", "Hover over any element on the page to receive some information in the info panel.");    
  $('#projectfiles')
    .attr("data-step", 4)
    .attr("data-intro", "Easily upload project files (images, 3D-models, audio-files) by drag and dropping them to the files panel.");
  $('#projectfiles')
    .attr("data-step", 5)
    .attr("data-intro", "This is the most important part of <i>cables</i> – the patch panel – here you can connect ops together and create something.");
  $('.cables')
    .attr("data-step", 6)
    .attr("data-intro", "On the main cables site you can browse through public projects / examples and get some inspiration.");        
    
    /* Disables intro.js for the current logged-in user */
  function disableIntroForUser(){
      // TODO
  }    

  introJs().setOption("skipLabel", "Close")
    .setOption('showBullets', false)
    .oncomplete(disableIntroForUser)
    .start();
  
  /* Style introjs*/
  $('.introjs-helperLayer')
    .css("background-color", "red")
    .css("transition", "none")
    .css("-moz-transition", "none")
    .css("-webkit-transition", "none")
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
    .css("padding","20px")
    ;
  $('.introjs-tooltipReferenceLayer')
    .css("border","1px solid white")
    .css("border-radius", "0")
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
});