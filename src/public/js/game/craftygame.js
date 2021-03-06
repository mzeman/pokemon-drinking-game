// OPTIONS
// let's start with 4 players for simplicity sake
// debug option to display debug values on the front end (potential option)
var gameOptions = {
	"MAX_PLAYERS": 4,
	"DEBUG" : false
};

var playersArray = {};
// Start the game with the 1st player
var currentPlayer = 0;
// The number of players for the current game
var currentNumPlayers = 0;

Game = {
	// Initialize and start our game
	createMenu: function() {
		Crafty.scene("menu", function(){
			$("#menu").show();
			// TODO: take player # input
			var select = document.getElementById('playerNum');

			// We need to remove all the options when the options get updated and recreate the select

			// Create the select
			for(var i = 0; i<gameOptions.MAX_PLAYERS; i++) {
				select.options[select.options.length] = new Option(i+1, i+1);
			}
			$("#maxPlayers").html("Max Players: " + gameOptions.MAX_PLAYERS);

			// TODO
			// player name entry
			// player character select: dropdown
			// player color select: dropdown of colors
		});
	},

	start: function() {
		//Skip create Menu Function for now
		//Game.createMenu();
		Crafty.init($("#game").width(), $("#game").height(), document.getElementById('game'));
		// Game pieces for the 4 pokemon you can potentially have
		// Need to create background colors per user for these to sit on (MAYBE?)
		/*Crafty.sprite("./gamepieces_alpha.png", {
											bulbasaur:[7,7,50,50],
											charmander:[398,10,50,50],
											squirtle:[135,75,50,50],
											pikachu:[523,265,50,50]
										});*/



		//Test Sprite animation
		//Tiles are 65x65
		var assetsObj = {
    "sprites": {
        "resources/gamepieces_alpha.png": {
            tile: 65,
            tileh: 65,
            // We give names to three individual images
            map: {
                bulbasaur: [0, 0],
								charmander:[6,0],
								squirtle:[2,1],
								pikachu:[8,4]

            }
        }
    }
};

	  Crafty.load(assetsObj);


		//Skip Menu Scene
		//Crafty.enterScene("menu");
		//Hack for 3 players
		Game.initBoard();
		//Game.initPlayers(3,[{"name":"test1","starter":"squirtle","space":0,"effect":"none","destinationSpace":0},{"name":"test2","starter":"charmander","space":0,"effect":"none","destinationSpace":0},{"name":"test3","starter":"bulbasaur","space":0,"effect":"none","destinationSpace":0}]);
	},

	initBoard: function() {
		//TODO figure out how to resize image and zoom in on players
		Crafty.scene("game", function() {
			//Crafty.background("url('./wall-old.png')");
			$("#menu").hide();
			Crafty.e("2D, Canvas, Image").image("resources/wall-old.png").bind("EnterFrame", function(eventData){
				try{
					if(Crafty.DrawManager.onScreen(playersArray[currentPlayer].mbr())){
						//console.log(currentPlayer);
					}else{
						Crafty.viewport.centerOn(playersArray[currentPlayer],1000);
					}
				}catch(e){
					//console.log("Player not found");
				}
			});
		});

		Game.playGame();
		// Play the game after the players are created
	},
	initPlayer: function(numPlayers, newPlayer) {
		//TODO figure out how to resize image and zoom in on players

			currentNumPlayers = numPlayers;
				// Create players, move to Pallet Town
				playerSpace = spaces[newPlayer.space];
				playersArray[currentNumPlayers-1] = Crafty.e("2D, Canvas,"+newPlayer.starter+",SpriteAnimation,Tween").reel("idle",1000,[[0,0],[1,0],[2,0],[3,0]])
										.attr({x:playerSpace.x, y:playerSpace.y}).animate("idle", -1);
				playersArray[currentNumPlayers-1].name = newPlayer.name;
				// Set the players initial space on the board to pallet town
				playersArray[currentNumPlayers-1].space = 0;
				// Keep the players initial status effect
				playersArray[currentNumPlayers-1].effect = "none";
				// Idk what circle does
				//Crafty.circle(0,0,10);
				//socket.emit('player_created', playersArray[currentNumPlayers-1]);
	},

	playGame: function() {
		Crafty.enterScene("game");
		Crafty.viewport.clampToEntities = true;
		//Crafty.viewport.bounds = {min:{x:0, y:0}, max:{x:2000, y:2000}};
		//Crafty.viewport.follow(playersArray[currentPlayer]);
		//Crafty.viewport.centerOn(playersArray[0], 3000);
		//  On key press roll the dice
		// Temporary code, testing stuff.
		// On site press "R", look at top left of screen
		Crafty.e("2D, Canvas, Color")
			  .bind("KeyDown", function(e) {
					if(e.key ==  Crafty.keys.R) {
			  		Game.rollDice();
					}
			  });
	},
	rollDice: function() {
		socket.emit('roll_dice');
			// TODO: move players
			//       do space
			//       move this code
			//$("#diceBlock").html(diceNum);
			//$("#playerSpace").html(player.name + ": " + player.space);


			// This will probably be better if we define every space (with x,y coords) on the board since we'll need to
			// display the rules for each square/what each square does


			//currentY = player.y;
			//currentX = player.x;
			// Need to find determine how to move in a smaller rectangle each time
			//if (y < )
			//newY = currentY - (190*diceNum);
			//player.attr({x:325, y:newY});
			//console.log(player);
			// Go to the next player
			//Tween Callback will start next player
	},
	endTurn: function() {
		socket.emit('end_turn');
	}
};

socket.on('game_state', function(gameState){
	if(Crafty.canvas.context === null){
		Game.start();
	}
	Object.keys(gameState.playerMap).forEach(function (key) {
		if(key in playersArray){

		}else{
				Game.initPlayer(currentNumPlayers+1,gameState.playerMap[key]);
		}
	});
 });

 socket.on('player_moved', function(movedPlayer){
	 console.log("player moved!");
	 //leverage tween for movement
	 currentPlayer = movedPlayer.name;
	  player = playersArray[movedPlayer.name];
	  playerSpace = spaces[movedPlayer.space];
	 	player.tween({x: playerSpace.x, y: playerSpace.y}, 1000).bind("TweenEnd",function(eventAction){
	 		//Example of TweenEnd Event
	 		//nextPlayer(player);
	 	});
  });
