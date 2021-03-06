var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var spaces = require("./public/js/game/spaces.js");

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendfile('index.html');
});


playOrder = [];
playerMap={};
gameState = {
  "playerCount":0,
  "playOrder":playOrder,
  "playerMap":playerMap
}

io.on('connection', function(socket){
  console.log('a user connected');

  newPlayer = {
    "name":gameState.playerCount,
    "starter":"squirtle",
    "space":0,
    "effect":"none",
    "destinationSpace":0
  };

  //New Player Joined - Request Creation
  gameState.playOrder.push(gameState.playerCount);
  gameState.playerMap[gameState.playerCount]=newPlayer;
  gameState.playerCount++;

  //io.emit('create_player', newPlayer);
  io.emit('game_state', gameState);

  socket.on('player_moved', function(msg){
    console.log("player moved: " + msg);
  });

  socket.on('roll_dice', function(){
    console.log("dice rolled!");

    player = gameState.playerMap[gameState.playOrder[gameState.playOrder.length-1]];
    diceNum = rollDice(player);
    moveSpaces(diceNum, player);
  });

  socket.on('end_turn', function(){
    console.log("end turn");

    nextPlayer();
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});



function rollDice(player)
{	// Do we need player params or what space the player is on?
	// Also in special cases where players move half spaces/double spaces we need to do something else
	diceVal = Math.random() * (6 -1) + 1;
	if (player.effect == "slow") {
		// do we want to use floor or ceil?  hmmmmm
		diceVal = Math.ceil(diceVal / 2);
		// Remove effect
		player.effect = "none";
	}
	if (player.effect == "fast") {
		diceVal = diceVal * 2;
		// Remove effect
		player.effect = "none";
	}
	// Need to create an if statement if we need to stay on the same space but roll dice
	return 1;
}

function pokemonFight(p1, p2) {
	// if 1 pokemon is stronger than the other we need to roll 2 dice
	// TODO
}

// Move the player, need to tweak x/y values a bit
function moveSpaces(numberOfSpaces, player) {
	oldSpace = player.space;
	newSpace = player.space + numberOfSpaces;

	newSpace = handleSpecialTiles(oldSpace, newSpace, player)

	// Update the player space
	player.space = newSpace;
	//moveTo = spaces[newSpace];
				io.emit('player_moved', player);
}


// This is the last thing that will happen at the end of a players turn
function nextPlayer() {
	gameState.playOrder.push(gameState.playOrder.shift());
}

// Pokegyms we need the player to always stop at.
// If player square >= required square
// 		playerSq = rSq;
//      do required square logic
// else playerSq = square+diceroll
// combine this with the spaces array?

function handleSpecialTiles(oldSpace, newSpace, player) {
	// Player wins, don't move call win command
	if (newSpace > 71) {
		return 71;
		// TODO return win screen/animation
	}

	// First Abra teleport logic
	if(newSpace == 11 && oldSpace < 11) {
		return 28;
	}
	// Second Abra teleport logic
	if(newSpace == 28 && (oldSpace > 11 && oldSpace < 28)) {
		return 11;
	}

	if(newSpace == 2 || newSpace == 41) {
		player.effect = "extraTurn";
	}

	if(newSpace == 3) {
		// TODO give all other players the slow effect
	}

	if(newSpace == 20) {
		player.effect = "fast";
	}

	if(newSpace == 4) {
		// TODO
		// update the player sprite
		// we shouldn't have to create a new entity here?
		//player.sprite("pikachu");
		player.starter = "pikachu";
	}

	// TODO add more special tiles
	return newSpace;
}
