
(function(){
 $(document).click(function() {
    var $item = $(".dropdown-content");
    if ($item.hasClass("active")) {
      $item.removeClass("active");
    }
  });
   $('#cart').click(function(e) {
    e.stopPropagation();
    $(".dropdown-content").toggleClass("active");
  });
  $('#addtocartA').click(function(e) {
    e.stopPropagation();
    $(".dropdown-content").toggleClass("active");
  });


  
})();
$(document).ready(function() {

    var $el, leftPos, newWidth, ratio, origLeft, origRatio,
        origWidth = 100,
        $mainNav  = $("#example-one");
    
    $mainNav.append("<li id='magic-line'></li>");
    var $magicLine = $("#magic-line");
    
    origLeft  = $(".current_page_item strong").position().left;
    newWidth  = $(".current_page_item").width();
    origRatio = newWidth / $magicLine.width();

    $magicLine
        .css("transform", "translateX("+origLeft+"px) scaleX("+origRatio+")");

    $("li").not("#magic-line").hover(function() {
        $el = $(this).find("> strong");
        leftPos = $el.position().left;
        newWidth = $el.parent().width();
        ratio = newWidth / origWidth;
        $magicLine
            .css("transform", "translateX("+leftPos+"px) scaleX("+ratio+")");
    }, function() {
        $magicLine
            .css("transform", "translateX("+origLeft+"px) scaleX("+origRatio+")");
    });
});
$(document).ready(function(){
	
	// Variables
	var clickedTab = $(".tabs > .active");
	var tabWrapper = $(".tab__content");
	var activeTab = tabWrapper.find(".active");
	var activeTabHeight = activeTab.outerHeight();
	
	// Show tab on page load
	activeTab.show();
	
	// Set height of wrapper on page load
	tabWrapper.height(activeTabHeight);
	
	$(".tabs > li").on("click", function() {
		
		// Remove class from active tab
		$(".tabs > li").removeClass("active");
		
		// Add class active to clicked tab
		$(this).addClass("active");
		
		// Update clickedTab variable
		clickedTab = $(".tabs .active");
		
		// fade out active tab
		activeTab.fadeOut(250, function() {
			
			// Remove active class all tabs
			$(".tab__content > li").removeClass("active");
			
			// Get index of clicked tab
			var clickedTabIndex = clickedTab.index();

			// Add class active to corresponding tab
			$(".tab__content > li").eq(clickedTabIndex).addClass("active");
			
			// update new active tab
			activeTab = $(".tab__content > .active");
			
			// Update variable
			activeTabHeight = activeTab.outerHeight();
			
			// Animate height of wrapper to new tab height
			tabWrapper.stop().delay(50).animate({
				height: activeTabHeight
			}, 500, function() {
				
				// Fade in active tab
				activeTab.delay(50).fadeIn(250);
				
			});
		});
	});
	
	// Variables
	var colorButton = $(".colors li");
	
	colorButton.on("click", function(){
		
		// Remove class from currently active button
		$(".colors > li").removeClass("active-color");
		
		// Add class active to clicked button
		$(this).addClass("active-color");
		
		// Get background color of clicked
		var newColor = $(this).attr("data-color");
		
		// Change background of everything with class .bg-color
		$(".bg-color").css("background-color", newColor);
		
		// Change color of everything with class .text-color
		$(".text-color").css("color", newColor);
	});
});


  

$(document).ready(function()
{
	"use strict";



	var header = $('.header');

	setHeader();

	$(window).on('resize', function()
	{
		setHeader();
	});

	$(document).on('scroll', function()
	{
		setHeader();
	});

	
	initImage();
	initIsotope();



	function setHeader()
	{
		if($(window).scrollTop() > 100)
		{
			header.addClass('scrolled');
		}
		else
		{
			header.removeClass('scrolled');
		}
	}



	function initImage()
	{
		var images = $('.details_image_thumbnail');
		var selected = $('.details_image_large img');

		images.each(function()
		{
			var image = $(this);
			image.on('click', function()
			{
				var imagePath = new String(image.data('image'));
				selected.attr('src', imagePath);
				images.removeClass('active');
				image.addClass('active');
			});
		});
	}
});





$(".galleryA").each( function(){
	var gal = $(this),
			imgsCont = gal.find(".images-container"),
			imgs = imgsCont.find(".details_image_thumbnails_gold"),
			product = gal.parents(".product_details").find(".product");
	
	if (imgsCont.find(".details_image_thumbnails_gold.active").length == 0){
		imgsCont.find(".details_image_thumbnails_gold").first().addClass("active")
	}
	
	var imgsActive = imgsCont.find(".details_image_thumbnails_gold.active"),
			activeOffset = imgsActive.offset().top - imgsCont.offset().top
	
	imgs.each( function(){
		var $this = $(this),
				childrenWidth = 0;
		
		$this.children().each(function(){
			childrenWidth += $(this).outerWidth()
		});
		
		$this.width(childrenWidth)
		
	});
	
	imgsCont.css({"transform": "translate(0, -"+ activeOffset +"px)"});
	
	product.find(".options").find("li").eq(imgsActive.index()).addClass("active")
	
	product.find(".options").find("li").on('click', function(e){
		e.preventDefault();
		
		var $this = $(this),
				optIndex = $this.index();
		
		$this.parents("ul").find(".active").removeClass("active");
		$this.addClass("active");
		
		var nextImgs = imgsCont.find(".details_image_thumbnails_gold").eq(optIndex),
				nextImgsoffset = nextImgs.offset().top - imgsCont.offset().top 
		
		imgsCont.find(".details_image_thumbnails_gold.active").removeClass("active")
		nextImgs.addClass("active")
	
	imgsCont.css({"transform": "translate(0, -"+ nextImgsoffset +"px)"});
		
	});
	
	imgs.each( function(){
		if ($(this).find(".active").length == 0){
			$(this).find("img").first().addClass("active")
		}
	})
});

//hide price function//
function hide() {
  var x = document.getElementById("price");
  if (x.style.display === "none") {
    x.style.display = "none";
  } else {
    x.style.display = "none";
  }
};
