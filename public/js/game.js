function resize(){
	if($('#game').length > 0){
		$('#game, .overLay').height($(window).height());
		$('#game, .overLay').width($(window).width());
	}
	$('.gameOver').css({
		top: $(window).height() / 2 - $('.gameOver').height() / 2,
		left: $(window).width() / 2 - $('.gameOver').width() / 2
	});
}

var paper = Raphael("game", "100%", "100%"),
canvas = $(paper.canvas),
offset = canvas.offset(),
margin = 50,
hover = 1;

function init() {

	resize();

	var circle = paper.circle(canvas.width() / 2, canvas.height() / 2, 50);

	circle.attr({
		"fill": "#df2020",
		"stroke": "#fff"
	});

	//cursor pointer for the circle element
	circle.hover(function(e){e.currentTarget.style.cursor="hand";},function(e){e.currentTarget.style.cursor="pointer";})

	//click to start
	circle.click( function(e){

		//once clicked - change cursor to cross hair
		e.currentTarget.style.cursor="crosshair";

		//players only allowed to hover once
		if( hover === 1){
			circle.attr('fill', '#00d419');
			playGame(circle);
		}

		hover++;

		//if the player falls out of the shape, game over
		circle.mouseout(function(e){
			endGame(circle);
		});
	});
}

function playGame(element){

	var x = Math.max(margin, Math.floor(Math.random() * canvas.width() - margin)),
	y = Math.max(margin, Math.floor(Math.random() * canvas.height() - margin));
	var pos = {x: x, y: y, cx: x, cy: y};

	var anim = Raphael.animation(pos, 4000, '<>', function(){
		// changeScale(element);
		playGame(element);
	});

	element.animate(anim);
}

//works but size change breaks margin and exit detection
function changeScale(element){
	element.animate({'transform': 's2 2'}, 1000);
}

function endGame(element){
	element.attr('fill', '#df2020');
	element.stop();
	$('.overLay').css('visibility','visible').hide().fadeIn();
}

$(document).ready(function(){
	init();
});

$(window).resize( function(){
	resize();
});
