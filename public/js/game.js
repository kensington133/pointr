function resize(){
	if($('#game').length > 0){

		var windowHeight = $(window).height();
		var windowWidth = $(window).width();

		$('#game').css({
			height: (windowHeight - ($('.info').height() + $('.timer').height()) ),
			paddingTop: $('.info').height() + $('.timer').height()
		});

		$('.overLay, .userOverlay').height(windowHeight);
		$('.overLay, #game').width(windowWidth - $('.chatFrame').width());
		$('.userOverlay').width(windowWidth);

		$('#user').css({
			top: windowHeight / 2,
			left: windowWidth / 2 - $('#user').width() / 2
		});

		$('.gameOver').css({
			top: windowHeight / 2 - $('.gameOver').height() / 2,
			left: ((windowWidth  - $('.chatFrame').width()) / 2) - ($('.gameOver').width() / 2)
		});

		$('.info').css('left', ((windowWidth - $('.chatFrame').width()) / 2) - $('.info').width() / 2 );

		$('.timer').css({
			left: ((windowWidth - $('.chatFrame').width()) / 2) - ($('.timer').width() / 2),
			top: $('.info').height() + 5
		});

		$('.chatFrame').height(windowHeight);
	}
}



var paper = Raphael("game", "100%", "100%"),
canvas = $(paper.canvas),
offset = canvas.offset(),
margin = 50,
clicked = 1;

function init() {

	resize();

	var timer = new gameTimer();

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
		if( clicked === 1){
			circle.attr('fill', '#00d419');
			timer.start();
			playGame(circle);
		}

		clicked++;

		//if the player falls out of the shape, game over
		circle.mouseout(function(e){
			timer.stop();
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
	element.animate({opacity: 0}, 1000, function(){this.remove()});

	var secondsLasted = parseInt($('.ss').text());
	var minutesLasted = parseInt($('.mm').text());
	var minInflection = (minutesLasted > 1)? 'minutes' : 'minute';
	var secInflection = (secondsLasted > 1)? 'seconds' : 'second';

	if(minutesLasted > 0){
		$('.score').text('You lasted ' + minutesLasted +' '+ minInflection +' and '+ secondsLasted + ' ' + secInflection +'!');
	} else {
		$('.score').text('You lasted ' + secondsLasted +' '+ secInflection +'!');
	}

	$('.overLay').css('visibility','visible').hide().fadeIn();
}

function gameTimer(){
	this.start = function(){
		var sec = 0;
		timerInterval = setInterval( function(){
			$(".ss").html(pad(++sec%60));
			$(".mm").html(pad(parseInt(sec/60,10)));
		}, 1000);
	}

	this.stop = function(){
		clearInterval(timerInterval);
	}
}

function pad ( val ) {
	return val > 9 ? val : "0" + val;
}


/* SOCKET IO FUNCTIONS */
var socket = io();
var	username,
	usercolor,
	connected = false;

var colors = [
	'#f2992b', '#0888e7', '#bb18db',
	'#0fce09', '#00ffb8', '#f06214 ',
	'#e11a2f', '#0e6ef2', '#ff00f4'
];

// Gets the color of a username
function getUserColor (username) {

	var hash = 7;
	for (var i = 0; i < username.length; i++) {
		hash = username.charCodeAt(i) + (hash << 5) - hash;
	}

	var index = Math.abs(hash % colors.length);
	return colors[index];
}

function addUser(){
	username = $('#user').val().trim();
	usercolor = randomColor();
	console.log(username);
	if(username){
		$('.userOverlay').fadeOut();
		socket.emit('add-user', username);
	}
}

function sendMessage(){
	var messageText = $('#chatText').val().trim();

	if(messageText.length > 0){
		$('#chatText').val('');
		displayMessage({
			username: username,
			message: messageText
		});
		socket.emit('add-message', messageText);
	}
}

function displayMessage(data){
	var messageDiv = $('<div class="message">');
	var newUserName = $('<span class="userName">').text(data.username).css('color', getUserColor(data.username));
	var newUserText = $('<span class="messageText">').text(data.message);
	messageDiv.append(newUserName, newUserText);
	$('.messages').append(messageDiv);
	scrollUp();
}

function displayCustomMessage(data, message){
	var messageDiv = $('<div class="message">');
	var newUserName = $('<span class="userName">').text(data.username).css('color', getUserColor(data.username));
	var newUserText = $('<span class="messageText">').text(message);
	messageDiv.append(newUserName, newUserText);
	$('.messages').append(messageDiv);
	$('.totalUsers span').text(data.totalUsers);
	scrollUp();
}

function scrollUp(){
	$('.chatFrame').scrollTop($('.messages').prop("scrollHeight") - $('#chatText').height());
}

socket.on('total-users', function(data){
	$('.totalUsers span').text(data);
});

socket.on('new-user', function(data){
	displayCustomMessage(data, 'Has joined the game');
});

socket.on('new-message', function(data){
	displayMessage(data);
});

socket.on('user-left', function(data){
	displayCustomMessage(data, 'Has left the game');
});

$(document).ready(function(){
	init();
});

$(window).resize( function(){
	resize();
});

$('.restart').click( function(){
	//reset timer and fadeout game over overlay
	$('.mm').text('00');
	$('.ss').text('00');
	$('.overLay').fadeOut();

	//reset clicked counter
	clicked = 1;
	//load circle again
	init();
});

$(window).keydown(function(e){
	//if any key but ctrl, cmd etc..
	if (!(e.ctrlKey || e.metaKey || e.altKey)) {
     	if(username){
	    	$('#chatText').focus();
	  	} else {
	  		$('#user').focus();
	  	}
    }

	//on enter key
	if(e.which === 13){
		if(username){
			sendMessage();
		} else {
			addUser();
		}
	}
});
