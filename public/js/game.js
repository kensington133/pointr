//reposition elements based on screen size
function resize(){
	if($('#game').length > 0){
		//get the window width and height
		var windowHeight = $(window).height();
		var windowWidth = $(window).width();

		//set the game area to the height of screen minus the info text and height
		$('#game').css({
			height: (windowHeight - ($('.info').height() + $('.timer').height()) ),
			paddingTop: $('.info').height() + $('.timer').height()
		});

		//set the game over overlay and user name entry height to screen height
		$('.overLay, .userOverlay').height(windowHeight);
		//set game and game over lay width to screen width minus the chat frame width
		$('.overLay, #game').width(windowWidth - $('.chatFrame').width());
		//set the user entry width to screen width
		$('.userOverlay').width(windowWidth);

		//center the user name input within the screen
		$('#user').css({
			top: windowHeight / 2,
			left: windowWidth / 2 - $('#user').width() / 2
		});

		//center the game over div in the center of the screen
		$('.gameOver').css({
			top: windowHeight / 2 - $('.gameOver').height() / 2,
			left: ((windowWidth  - $('.chatFrame').width()) / 2) - ($('.gameOver').width() / 2)
		});

		//center the game start info text in the center and top of the screen
		$('.info').css('left', ((windowWidth - $('.chatFrame').width()) / 2) - $('.info').width() / 2 );

		//center the timer to center of screen and below the game start text
		$('.timer').css({
			left: ((windowWidth - $('.chatFrame').width()) / 2) - ($('.timer').width() / 2),
			top: $('.info').height() + 5
		});

		//set the chat frame to screen height
		$('.chatFrame').height(windowHeight);
	}
}

//initialise variables
var paper = Raphael("game", "100%", "100%"),
canvas = $(paper.canvas),
offset = canvas.offset(),
margin = 50,
clicked = false;

function init() {

	//make sure everything is in the right place
	resize();

	//create new game timer
	var timer = new gameTimer();

	//add circle for players to follow and make it red with white outline
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

		//players only allowed to be clicked once
		if(clicked === false){
			//make the circle green
			circle.attr('fill', '#00d419');

			//fade out the starting info then fade in the timer
			$('.info').fadeOut( function(){
				$('.timer').css('visibility','visible').hide().fadeIn();
			});

			//start the game timer and play the game
			timer.start();
			playGame(circle);
		}

		//only run game once per click!
		clicked = true;

		//if the player falls out of the shape, game over
		circle.mouseout(function(e){
			timer.stop();
			endGame(circle);
		});
	});
}

function playGame(element){

	//create random animation paths
	var x = Math.max(margin, Math.floor(Math.random() * canvas.width() - margin)),
	y = Math.max(margin, Math.floor(Math.random() * canvas.height() - margin));
	var pos = {x: x, y: y, cx: x, cy: y};

	//create the animation
	var anim = Raphael.animation(pos, 4000, '<>', function(){
		playGame(element);
	});

	//animate the given element using the created animation
	element.animate(anim);
}

/*===NOT IN USE===*/
//works but size change breaks margin and exit detection
function changeScale(element){
	element.animate({'transform': 's2 2'}, 1000);
}

//ending the game
function endGame(element){
	//stop the shape, change the colour to red and fade it out
	element.attr('fill', '#df2020');
	element.stop();
	element.animate({opacity: 0}, 1000, function(){this.remove()});

	//get total time from timer div
	var totalTime = $('.timer').text();
	var secondsLasted = parseInt($('.ss').text());
	var minutesLasted = parseInt($('.mm').text());
	var minInflection = (minutesLasted > 1)? 'minutes' : 'minute';
	var secInflection = (secondsLasted > 1)? 'seconds' : 'second';

	if(minutesLasted > 0){
		$('.score').text('You lasted ' + minutesLasted +' '+ minInflection +' and '+ secondsLasted + ' ' + secInflection +'!');
	} else {
		$('.score').text('You lasted ' + secondsLasted +' '+ secInflection +'!');
	}

	//fade in the game over overlay
	$('.overLay').css('visibility','visible').hide().fadeIn();

	//send score to server using socket
	socket.emit('score-submit', totalTime);
}

//game timer to create score
function gameTimer(){
	//start the timer
	this.start = function(){
		var sec = 0;
		//every second update timer display
		timerInterval = setInterval( function(){
			$(".ss").html(pad(++sec%60));
			$(".mm").html(pad(parseInt(sec/60,10)));
		}, 1000);
	}

	//end the timer
	this.stop = function(){
		clearInterval(timerInterval);
	}
}

//add leading 0's to single digits
function pad ( val ) {
	return val > 9 ? val : "0" + val;
}

/* SOCKET IO FUNCTIONS */
//initialise socket and variables
var socket = io();
var	username,
	usercolor,
	connected = false;

var colors = [
	'#f2992b', '#0888e7', '#bb18db',
	'#0fce09', '#00ffb8', '#f06214 ',
	'#e11a2f', '#0e6ef2', '#ff00f4'
];

// Gets the color based on username
function getUserColor (username) {

	var hash = 7;
	for (var i = 0; i < username.length; i++) {
		hash = username.charCodeAt(i) + (hash << 5) - hash;
	}

	var index = Math.abs(hash % colors.length);
	return colors[index];
}

//add a user by sending name up to the server
function addUser(){
	//get username from the input
	username = $('#user').val().trim();

	//and send it to the server using socket
	if(username){
		$('.userOverlay').fadeOut();
		socket.emit('add-user', username);
	}
}

//send a message up to the server
function sendMessage(){
	//get the message from the input
	var messageText = $('#chatText').val().trim();

	//if we have a message
	if(messageText.length > 0){
		//clear the input
		$('#chatText').val('');
		//display the message to the current players
		displayMessage({
			username: username,
			message: messageText
		});
		//and display it to other players via the server
		socket.emit('add-message', messageText);
	}
}

//display message
function displayMessage(data){
	//create html to output using data provided
	var messageDiv = $('<div class="message">');
	var newUserName = $('<span class="userName">').text(data.username).css('color', getUserColor(data.username));
	var newUserText = $('<span class="messageText">').text(data.message);
	//create one message div
	messageDiv.append(newUserName, newUserText);

	//add it to the messages
	$('.messages').append(messageDiv);

	//scroll up the chat frame
	scrollUp();
}

function displayCustomMessage(data, message){
	//create html to output using data provided and a custom message
	var messageDiv = $('<div class="message">');
	var newUserName = $('<span class="userName">').text(data.username).css('color', getUserColor(data.username));
	var newUserText = $('<span class="messageText custom">').text(message);

	//create one message div
	messageDiv.append(newUserName, newUserText);

	//add custom message to messages
	$('.messages').append(messageDiv);

	//scroll up the chat frame
	scrollUp();
}

//scroll up the chat frame using the scroll height of all messages minus the input height
function scrollUp(){
	$('.chatFrame').scrollTop($('.messages').prop("scrollHeight") - $('#chatText').height());
}

/* SOCKET FUNCTIONS */
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

socket.on('new-high-score', function(data){
	displayCustomMessage(data, 'has achieved the new high score of '+ data.score +'!');
});

//when document is ready, initialise the game
$(document).ready(function(){
	init();
});

//if the screen is resized, reposition certain elements
$(window).resize( function(){
	resize();
});

//when restart is clicked
$('.restart').click( function(){
	//reset timer and fadeout game over overlay
	$('.mm').text('00');
	$('.ss').text('00');

	//show the starting text and hide the timer
	$('.info').show();
	$('.timer').css('visibility', 'hidden');

	//hide the game over overlay
	$('.overLay').fadeOut();

	//reset clicked counter
	clicked = false;
	//load game again
	init();
});

//getting user input
$(window).keydown(function(e){
	//if any key but ctrl, cmd etc..
	if (!(e.ctrlKey || e.metaKey || e.altKey)) {
     	//set users input focus to the correct input depending if user is logged in
     	if(username){
	    	$('#chatText').focus();
	  	} else {
	  		$('#user').focus();
	  	}
    }

	//on enter key
	if(e.which === 13){
		//send message to server if logged in or add user if not
		if(username){
			sendMessage();
		} else {
			addUser();
		}
	}
});
