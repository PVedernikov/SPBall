var lArrPressed = false;
var rArrPressed = false;
var uArrPressed = false;
var lnArrPressed = false;
var rnArrPressed = false;
var unArrPressed = false;
var aKeyPressed = false;
var dKeyPressed = false;
var wKeyPressed = false;

var maxPlayerBallHits = 3;
var maxGameScore = 15;
var goalAfterPause = 3000;

$(document).ready(function() { 
	$('body').bind('keydown',function(e){
		//DebugInfo(e.which);
		if(e.which === 37){ lArrPressed = true; return false;}
		if(e.which === 39){ rArrPressed = true; return false;}
		if(e.which === 38){ uArrPressed = true; return false;}
		if(e.which === 100){ lnArrPressed = true; return false;}
		if(e.which === 102){ rnArrPressed = true; return false;}
		if(e.which === 104){ unArrPressed = true; return false;}
		if(e.which === 65){ aKeyPressed = true; return false;}
		if(e.which === 68){ dKeyPressed = true; return false;}
		if(e.which === 87){ wKeyPressed = true; return false;}
	}).bind('keyup',function(e){
		//DebugInfo(e.which);
		if(e.which === 37){ lArrPressed = false; return false;}
		if(e.which === 39){ rArrPressed = false; return false;}
		if(e.which === 38){ uArrPressed = false; return false;}
		if(e.which === 100){ lnArrPressed = false; return false;}
		if(e.which === 102){ rnArrPressed = false; return false;}
		if(e.which === 104){ unArrPressed = false; return false;}
		if(e.which === 65){ aKeyPressed = false; return false;}
		if(e.which === 68){ dKeyPressed = false; return false;}
		if(e.which === 87){ wKeyPressed = false; return false;}
	});
});
	
	// Наследование классов
	function Extend(Child, Parent){
		var F = function () { };
		F.prototype = Parent.prototype;
		var f = new F();
		
		for (var prop in Child.prototype) f[prop] = Child.prototype[prop];
		Child.prototype = f;
		Child.prototype.super = Parent.prototype;
	}

	//var gameFieldSelector = "#play_field_container";
	var framePeriod = 40;
	//var floorLevel = 20;
	var floorLevel = 17;

	function Game(gFieldSelector){
		this.gameFieldSelector = gFieldSelector;
		this.gameOverCallback = null;
		this.intervalId = null;
		this.objects = [];
		this.fixedObjects = [];
		this.players = [];
		this.controllers = [];
		this.goals = [0, 0];
		this.playerHits = [0, 0];
		
		this.AddGameOverCallback = function(fn){
			this.gameOverCallback = fn;
		}
		this.AddObject = function(object){
			object.SetGameFieldSelector(this.gameFieldSelector);
			this.objects.push(object);
		}
		this.AddController = function(obj){
			if(obj.side == "left"){
				obj.SetBorders(0, $(this.gameFieldSelector).width()/2);
			}
			if(obj.side == "right"){
				obj.SetBorders($(this.gameFieldSelector).width()/2, $(this.gameFieldSelector).width());
			}
			this.controllers.push(obj);
		}		
		this.AddPlayer = function(playerId, x, y){
			var p = new Player(playerId);
			p.SetGameFieldSelector(this.gameFieldSelector);
			p.SetPosition(x, y);
			this.fixedObjects.push(p.head);
			this.fixedObjects.push(p.body);
			this.players.push(p);
			//p.SetOnFloor();
		}		
		this.AddBallObject = function(objectId, objectRadius){
			var obj = new ObjectBall(objectId, objectRadius);
			obj.SetGameFieldSelector(this.gameFieldSelector);
			
			this.objects.push(obj);
		}
		this.AddFixedObject = function(objectId, objectRadius){
			var obj = new FieldObject(objectId, objectRadius);
			obj.SetGameFieldSelector(this.gameFieldSelector);
			this.fixedObjects.push(obj);
			//this.objects.unshift(obj); // Важно фиксированные элементы добавлять в начало массива
		}		
		this.AddVerticalObject = function(objectId, width, height){
			var obj = new VerticalObject(objectId, width, height);
			obj.SetGameFieldSelector(this.gameFieldSelector);
			this.fixedObjects.push(obj);
			//this.objects.unshift(obj); // Важно фиксированные элементы добавлять в начало массива
		}		
		
		this.GedObjectById = function(objectId){
			for (i = 0; i < this.objects.length; i++) { 
				if(this.objects[i].domNodeSelector == objectId){
					return this.objects[i];
				}
			}
			for (i = 0; i < this.fixedObjects.length; i++) { 
				if(this.fixedObjects[i].domNodeSelector == objectId){
					return this.fixedObjects[i];
				}
			}
			for (i = 0; i < this.players.length; i++) { 
				if(this.players[i].playerId == objectId){
					return this.players[i];
				}
			}			
			return null;
		}
		
		this.Start = function(){
			var _this = this;
			this.intervalId = setInterval(function() {
				_this.NextFrame();
			}, framePeriod);
		}
		this.Stop = function(){
			clearInterval(this.intervalId);
		}
		this.NextFrame = function(){
			if($(this.gameFieldSelector).children(".left_score").length <= 0){
				$(this.gameFieldSelector).append("<div class='left_score score'>0</div>");
			}
			if($(this.gameFieldSelector).children(".right_score").length <= 0){
				$(this.gameFieldSelector).append("<div class='right_score score'>0</div>");
			}
			if($(this.gameFieldSelector).children(".left_hits").length <= 0){
				$(this.gameFieldSelector).append("<div class='left_hits hits'>0</div>");
			}
			if($(this.gameFieldSelector).children(".right_hits").length <= 0){
				$(this.gameFieldSelector).append("<div class='right_hits hits'>0</div>");
			}
			
			var _this_objects = this.objects;
			for (i = 0; i < this.fixedObjects.length; i++) { 
				for (j = 0; j < this.objects.length; j++) { 
					this.fixedObjects[i].ReflectBallObject(this.objects[j]);
				}
			}
			
			var goals_tmp = [0, 0];
			var _this = this;
			for (i = 0; i < this.objects.length; i++) { 
				//DebugInfo("! " + this.objects[i].frozen);
				
				this.objects[i].floorHits.forEach(function(x) {
					if(x >= 0 && x < $(_this.gameFieldSelector).width()/2){
						goals_tmp[1] += 1;
					}
					if(x > $(_this.gameFieldSelector).width()/2 && x <= $(_this.gameFieldSelector).width()){
						goals_tmp[0]++;
					}
				});
				this.objects[i].floorHits = [];
				
				if(this.objects[i].frozen && goals_tmp[0] > 0){
					var ball = this.objects[i];
					this.playerHits = [0, 0];
					this.controllers.forEach(function(entry) {
						entry.player.SetBallHits(0);
					});
					setTimeout(function(){
						ball.SetPosition(1*($(_this.gameFieldSelector).width()/4), $(_this.gameFieldSelector).height()/2 + 20);
						setTimeout(function(){ ball.Enable(); }, 100);
					}, goalAfterPause);
				}
				if(this.objects[i].frozen && goals_tmp[1] > 0){
					var ball = this.objects[i];
					this.playerHits = [0, 0];
					this.controllers.forEach(function(entry) {
						entry.player.SetBallHits(0);
					});
					setTimeout(function(){
						ball.SetPosition(3*($(_this.gameFieldSelector).width()/4), $(_this.gameFieldSelector).height()/2 + 20);
						setTimeout(function(){ ball.Enable(); }, 100);
					}, goalAfterPause);
				}
				
				for (j = i+1; j < this.objects.length; j++) { 
					this.objects[i].ResolveObjectCollision(this.objects[j]);
				}
			}
			this.goals = [this.goals[0] + goals_tmp[0], this.goals[1] + goals_tmp[1]];
			$(this.gameFieldSelector).children(".left_score").html(this.goals[0]);
			$(this.gameFieldSelector).children(".right_score").html(this.goals[1]);
			
			this.objects.forEach(function(entry) {
				entry.Move();
			});

			var playerHits_tmp = [0, 0];
			this.controllers.forEach(function(entry) {
				entry.Move();
				if(entry.side == "left"){
					playerHits_tmp[0] += entry.player.GetBallHits();
				}
				if(entry.side == "right"){
					playerHits_tmp[1] += entry.player.GetBallHits();
				}
				entry.player.SetBallHits(0);
			});
			if(playerHits_tmp[0] > 0){ playerHits_tmp[1] = 0; this.playerHits[1] = 0; }
			if(playerHits_tmp[1] > 0){ playerHits_tmp[0] = 0; this.playerHits[0] = 0; }
			this.playerHits = [this.playerHits[0] + playerHits_tmp[0], this.playerHits[1] + playerHits_tmp[1]];
			
			//$(this.gameFieldSelector).children(".left_hits").html(this.playerHits[0]);
			//$(this.gameFieldSelector).children(".right_hits").html(this.playerHits[1]);
			ShowHits(".left_hits", this.playerHits[0]);
			ShowHits(".right_hits", this.playerHits[1]);
			
			if(this.playerHits[0] > maxPlayerBallHits){
				this.objects.forEach(function(entry){
					entry.Freeze();
					setTimeout(function(){
						entry.SetPosition(3*($(_this.gameFieldSelector).width()/4), $(_this.gameFieldSelector).height()/2 + 20);
						setTimeout(function(){ entry.Enable(); }, 100);

						//_this.playerHits = [0, 0];
						//_this.controllers.forEach(function(cntrl) {
						//	cntrl.player.SetBallHits(0);
						//});
					}, goalAfterPause);	
				});
				this.playerHits = [0, 0];
				this.controllers.forEach(function(entry) {
					entry.player.SetBallHits(0);
				});
				this.goals[1]++;
			}
			if(this.playerHits[1] > maxPlayerBallHits){
				this.objects.forEach(function(entry){
					entry.Freeze();
					setTimeout(function(){
						entry.SetPosition(1*($(_this.gameFieldSelector).width()/4), $(_this.gameFieldSelector).height()/2 + 20);
						setTimeout(function(){ entry.Enable(); }, 100);
						//_this.playerHits = [0, 0];
						//_this.controllers.forEach(function(cntrl) {
						//	cntrl.player.SetBallHits(0);
						//});
					}, goalAfterPause);	
				});
				this.playerHits = [0, 0];
				this.controllers.forEach(function(entry) {
					entry.player.SetBallHits(0);
				});
				this.goals[0]++;
			}
			
			if(this.goals[0] >= maxGameScore ){
				if(this.gameOverCallback){
					this.gameOverCallback( "1" );
				}
				this.Stop();
			}
			if(this.goals[1] >= maxGameScore ){
				if(this.gameOverCallback){
					this.gameOverCallback( "2" );
				}
				this.Stop();
			}

		}
	}

	// Управление игроками
	function PlayerManualController(obj, side, ballObj){
		this.player = obj;
		this.side = side;
		this.leftBorder = 0;
		this.rightBorder = 450;
		this.ball = ballObj;
		this.playerFaces = ["none", "sad", "glad", "talking", "angry", "surprised", "scared", "fighting"];
	}
	PlayerManualController.prototype = {
		constructor: PlayerManualController,
		AddPlayer: function(obj, side){ this.player = obj; this.side = side; },
		SetBorders: function(left, right){ this.leftBorder = left; this.rightBorder = right; },

		UnsetFase: function(){
			this.playerFaces.forEach(function(entry) {
				this.player.RemoveCssClass(entry);
			});
		},
		HasFase: function(){
			var _this = this;
			var result = false;
			this.playerFaces.forEach(function(entry) {
				if(_this.player.HasCssClass(entry)){
					result = true;
				}
			});
			return result;
		},		
		ProcessFace: function(){
			this.player.LookAtTheBall(this.ball);
			var difVector = [this.ball.fieldPosition[0] - this.player.position[0], this.ball.fieldPosition[1] - this.player.position[1]];
			var difVectorLength = Math.sqrt(difVector[0]*difVector[0] + difVector[1]*difVector[1]);	
			var plr = this.player;
			if(plr.jumping){
				//this.UnsetFase();
				plr.AddCssClass("fighting");
				setTimeout(function(){ plr.RemoveCssClass("fighting"); }, 200);
			}else if( this.ball.fieldPosition[1] >=  this.player.position[1] 
			&& this.ball.fieldPosition[0] >= this.leftBorder 
			&& this.ball.fieldPosition[0] <= this.rightBorder 
			&& !this.HasFase()){
				plr.AddCssClass("talking");
				setTimeout(function(){ 
					plr.RemoveCssClass("talking"); 
					plr.AddCssClass("sad");
					setTimeout(function(){ 
						plr.RemoveCssClass("sad"); 
						plr.AddCssClass("angry");
						setTimeout(function(){ 
							plr.RemoveCssClass("angry"); 
						}, 700);
					}, 300);
				}, 400);			
			}else if(difVectorLength < 350 && !this.HasFase()){
				plr.AddCssClass("surprised");
				setTimeout(function(){ 
					plr.RemoveCssClass("surprised"); 
					plr.AddCssClass("scared");
					setTimeout(function(){ 
						plr.RemoveCssClass("scared"); 
						plr.AddCssClass("sad");
						setTimeout(function(){ 
							plr.RemoveCssClass("sad"); 
						}, 400);
					}, 500);
				}, 400);
			}else if(!this.HasFase()){
				var pos1 = this.ball.GetNextMovePosition();
				if((this.ball.fieldPosition[0] <= this.leftBorder || this.ball.fieldPosition[0] >= this.rightBorder)
				&& (pos1[0] >= this.leftBorder && pos1[0] <= this.rightBorder )
				){
					plr.AddCssClass("angry");
					setTimeout(function(){ 
						plr.RemoveCssClass("angry"); 
						plr.AddCssClass("talking");
						setTimeout(function(){ 
							plr.RemoveCssClass("talking"); 
							plr.AddCssClass("sad");
							setTimeout(function(){ 
								plr.RemoveCssClass("sad"); 
							}, 500);							
						}, 600);
					}, 400);
				}
				if(this.ball.fieldPosition[0] < this.leftBorder || this.ball.fieldPosition[0] > this.rightBorder){
					plr.AddCssClass("talking");
					setTimeout(function(){ 
						plr.RemoveCssClass("talking"); 
						plr.AddCssClass("none");
						setTimeout(function(){ 
							plr.RemoveCssClass("none"); 						
							plr.AddCssClass("glad");
							setTimeout(function(){ 
								plr.RemoveCssClass("glad"); 
								plr.AddCssClass("none");
								setTimeout(function(){ 
									plr.RemoveCssClass("none"); 
								}, 2000);
							}, 400);
						}, 500);
					}, 300);
				}
								
			}
			//else if(!this.HasFase()){
			//	var faceIndex = Math.round(Math.random()*this.playerFaces.length-1);
			//	plr.AddCssClass(this.playerFaces[faceIndex]);
			//	DebugInfo(faceIndex + " " + this.playerFaces[faceIndex]);
			//}
		},
		Move: function(){
			this.ProcessFace();
			
			if(!this.player.jumping){ this.player.SetOnFloor(); }
			if(this.side == "left"){
				if(aKeyPressed){ 
					if(this.player.position[0] - this.player.size[0]/2 > this.leftBorder){
						this.player.MoveLeft();
					}
				}
				if(dKeyPressed){ 
					if(this.player.position[0] + this.player.size[0]/2 < this.rightBorder){
						this.player.MoveRight(); 
					}
				}
				if(wKeyPressed){ this.player.Jump(); }
			}
			if(this.side == "right"){
				if(lArrPressed){ 
					if(this.player.position[0] - this.player.size[0]/2 > this.leftBorder){
						this.player.MoveLeft(); 
					}
				}
				if(rArrPressed){
					if(this.player.position[0] + this.player.size[0]/2 < this.rightBorder){
						this.player.MoveRight(); 
					}
				}
				if(uArrPressed){ this.player.Jump(); }

				if(lnArrPressed){
					if(this.player.position[0] - this.player.size[0]/2 > this.leftBorder){
						this.player.MoveLeft(); 
					}
				}
				if(rnArrPressed){
					if(this.player.position[0] + this.player.size[0]/2 < this.rightBorder){
						this.player.MoveRight(); 
					}
				}
				if(unArrPressed){ this.player.Jump(); }
			}
			//DebugInfo(playerId + " jumping: " + player.jumping);
		}		
	}

	function PlayerCpuController(obj, side, ballObj){
		PlayerManualController.call(this, obj, side, ballObj);
	}
	PlayerCpuController.prototype = {
		constructor: PlayerCpuController,
		Move: function(){
			this.ProcessFace();
			if(!this.player.jumping){ this.player.SetOnFloor(); }
			//if(!this.ball.enabled){ return false; }
			var difVector = [this.ball.fieldPosition[0] - this.player.position[0], this.ball.fieldPosition[1] - this.player.position[1]];
			var difVectorLength = Math.sqrt(difVector[0]*difVector[0] + difVector[1]*difVector[1]);			

			if(this.ball.fieldPosition[0] < this.leftBorder || this.ball.fieldPosition[0] > this.rightBorder || !this.ball.enabled){
				if(this.player.position[0] >= (this.leftBorder + this.rightBorder)/2 + 35){
					this.player.MoveLeft();
				}
				if(this.player.position[0] <= (this.leftBorder + this.rightBorder)/2 + 35){
					this.player.MoveRight();
				}
				//return;
			}
			
			
			if(this.ball.fieldPosition[1] < -200 
			|| this.ball.fieldPosition[1] > this.player.position[1] - this.player.size[0]/2
			|| !this.ball.enabled){
				return;
			}
			var randVal = 20 + Math.random()*50;
			if(this.side == "left") randVal *= -1;
			
			if(this.ball.fieldPosition[0] < this.player.position[0] + randVal 
			&& Math.abs(this.ball.fieldPosition[0] - this.player.position[0]) > 20
			&& this.player.position[0] - this.player.size[0]/2 > this.leftBorder
			&& this.ball.fieldPosition[0] >= this.leftBorder && this.ball.fieldPosition[0] <= this.rightBorder){
				this.player.MoveLeft();
			}
			
			if(this.ball.fieldPosition[0] > this.player.position[0] - randVal 
			&& Math.abs(this.ball.fieldPosition[0] - this.player.position[0]) > 20
			&& this.player.position[0] + this.player.size[0]/2 < this.rightBorder
			&& this.ball.fieldPosition[0] >= this.leftBorder && this.ball.fieldPosition[0] <= this.rightBorder){
				this.player.MoveRight();
			}

			if(difVectorLength < 180){
				this.player.Jump();
			}
		}
	}
	Extend(PlayerCpuController, PlayerManualController);
	
	
	function Player(playerId){
		this.playerId = playerId;
		this.head = null;
		this.body = null;
		this.image = null;
		this.position = [0, 0];
		this.size = [130, 180];
		this.speed = [10.5, 8];
		this.eyeLeftPosition = [0,0];
		this.eyeRightPosition = [0,0];
		this.jumping = false;
		
		this.SetSpeed = function(x, y){ this.speed = [x, y]; }
		this.MoveLeft = function(){ this.SetPosition(this.position[0] - this.speed[0], this.position[1]); }
		this.MoveRight = function(){ this.SetPosition(this.position[0] + this.speed[0], this.position[1]); }
		this.GetBallHits = function(){ return this.head.ballHits; }
		this.SetBallHits = function(x){ this.head.ballHits = x; }
		this.Jump = function(){
			if(this.jumping) return;
			this.jumping = true;
			var v = -this.speed[1];
			var a = 0.2;
			var _this = this;
			this.SetPosition(this.position[0], this.position[1] - 10);
			
			$({t0: 0.5}).animate({t0: 12}, {
				duration: 400,
				step: function(now) {
					var t = now;
					v += a*t;
					
					_this.SetPosition(_this.position[0], _this.position[1] + v*t + (a*t*t)/2);
					
					if(_this.IsOnTheFloor()){
						v = 0;
						a = 0;
						_this.SetOnFloor();
						this.jumping = false;
						_this.RemoveCssClass("fighting");
						_this.AddCssClass("glad");
						setTimeout(function(){ _this.RemoveCssClass("glad"); }, 800);
					}
				},
				complete: function(){
					_this.SetOnFloor();
					_this.jumping = false;
					_this.RemoveCssClass("fighting");
					_this.AddCssClass("glad");
					setTimeout(function(){ _this.RemoveCssClass("glad"); }, 800);
				}
			});
			//this.jumping = false;
		}
		this.SetOnFloor = function(){
			this.SetPosition(this.position[0], $(this.head.gameFieldSelector).height() - this.body.domNode.height() - floorLevel + 10);
		}
		this.IsOnTheFloor = function(){
			if(this.position[1] >= $(this.head.gameFieldSelector).height() - this.body.domNode.height() - floorLevel + 10 ){
				return true;
			}
			return false;
		}
		this.SetGameFieldSelector = function(gameFieldSelector){
			this.body = new VerticalObject(playerId + "Body", this.size[0] - 30, this.size[1] - 50);
			this.body.SetGameFieldSelector(gameFieldSelector);
			this.head = new FieldObject(playerId + "Head", this.size[0]/2);
			this.head.SetGameFieldSelector(gameFieldSelector);
			this.image = new VerticalObject(playerId + "Image", this.size[0], this.size[1]);
			this.image.SetGameFieldSelector(gameFieldSelector);
			this.image.domNode.append("<div class='body_bkg'><div class='eyebrows'></div><div class='eye eye_L'></div><div class='eye eye_R'></div><div class='mouth'></div><div class='hands hand_L'></div><div class='hands hand_R'></div></div>");
			this.SetOnFloor();
		}
		this.AddCssClass = function(className){
			this.image.domNode.addClass(className);
		}
		this.RemoveCssClass = function(className){
			this.image.domNode.removeClass(className);
		}
		this.HasCssClass = function(className){
			return this.image.domNode.hasClass(className);
		}
		
		this.SetSize = function(x, y){ 
			this.size = [x, y];
			this.body.SetSize(this.size[0] - 30, this.size[1] - this.size[0]/2);
			this.head.SetRadius(this.size[0]/2);
			this.image.SetSize(this.size[0], this.size[1]);
		}
		
		this.SetPosition = function(x, y){
			this.position = [x, y];
			//if(this.head == null || this.body == null) return;
			this.head.SetPosition(x, y);
			this.body.SetPosition(x-this.body.width/2, y);
			this.image.SetPosition(x-this.head.radius, y-this.head.radius);
		}
		
		this.LookAtTheBall = function(object){
			if(object == null) return;
			var eye_L = this.image.domNode.children(".body_bkg").first().children(".eye_L").first();
			var eye_R = this.image.domNode.children(".body_bkg").first().children(".eye_R").first();
			if(this.eyeLeftPosition[0] == 0 && this.eyeLeftPosition[1] == 0){
				var pos = eye_L.position();
				this.eyeLeftPosition = [pos.left, pos.top];
			}
			if(this.eyeRightPosition[0] == 0 && this.eyeRightPosition[1] == 0){
				var pos = eye_R.position();
				this.eyeRightPosition = [pos.left, pos.top];
			}
			
			var difVector = [object.fieldPosition[0] - this.position[0], object.fieldPosition[1] - this.position[1]];
			var difVectorLength = Math.sqrt(difVector[0]*difVector[0] + difVector[1]*difVector[1]);
			var normalDifVector = [difVector[0]/difVectorLength, difVector[1]/difVectorLength];

			eye_L.stop().animate({
				left: this.eyeLeftPosition[0] + normalDifVector[0]*7,
				//top: this.eyeLeftPosition[1] + normalDifVector[1]*7 
				top: this.eyeLeftPosition[1] + normalDifVector[1]*10
			}, framePeriod/2);
			eye_R.stop().animate({
				left: this.eyeRightPosition[0] + normalDifVector[0]*7,
				//top: this.eyeRightPosition[1] + normalDifVector[1]*7 
				top: this.eyeRightPosition[1] + normalDifVector[1]*10
			}, framePeriod/2);
			
			/*
			eye_L.css({
					"left": this.eyeLeftPosition[0] + normalDifVector[0]*5 + "px",
					"top": this.eyeLeftPosition[1] + normalDifVector[1]*5 + "px"
			});
			eye_R.css({
					"left": this.eyeRightPosition[0] + normalDifVector[0]*5 + "px",
					"top": this.eyeRightPosition[1] + normalDifVector[1]*6 + "px"
			});
			*/
		}
	}
	
	// Круглые неподвижные объекты
	function FieldObject(dNodeSelector, rad){
		this.domNodeSelector = dNodeSelector;
		this.domNode = false;
		this.radius = rad;
		this.fieldPosition = [0,0];
		this.gameFieldSelector = "";
		this.ballHits = 0;
		this.enabled = true;
	}
	FieldObject.prototype = {
		constructor:	FieldObject,
		SetGameFieldSelector:	function(x){ 
			this.gameFieldSelector = x; 
			if($("#" + this.domNodeSelector).length <= 0){
				$(this.gameFieldSelector).append("<div id='" + this.domNodeSelector + "'></div>");
			}
			this.domNode = $("#"+this.domNodeSelector);
			this.domNode.css({	"width": (this.radius*2) + "px", 
								"height": (this.radius*2) + "px",
								"position": "absolute"
								});
			
			//this.domNode.addClass("ball").css("background", "grey");
		},
		
		SetRadius: function(x){ 
			this.radius = x; 
			this.domNode.css({	"width": (this.radius*2) + "px", 
								"height": (this.radius*2) + "px"
								});
		},		
		// Перемещение объекта в определенную точку
		SetPosition:	function(x, y){
			//if(this.domNode == false) return false;
			this.fieldPosition = [x, y];
			//--------------------------------------------------
			// Анимируем перемещение в новую точку
			//--------------------------------------------------
			/*this.domNode.stop().animate({
				left: x - this.radius,
				top: y - this.radius,
			}, framePeriod/2, function() { 
				// Animation complete.
			});*/
			this.domNode.css({"left": (x - this.radius) + "px", "top": (y - this.radius) + "px"});
			
		},
		Freeze: function(){ this.enabled = false; },
		Unfreeze: function(){ this.enabled = true; },
		
		// Отразить объект
		ReflectBallObject: function(object){
			if(!object.enabled) return;
			
			var difVector_now = [this.fieldPosition[0] - object.fieldPosition[0], this.fieldPosition[1] - object.fieldPosition[1]];
			var distance2_now = Math.sqrt(difVector_now[0]*difVector_now[0] + difVector_now[1]*difVector_now[1]);

			pos1 = this.fieldPosition;
			pos2 = object.GetNextMovePosition();
			//var difVector2 = [pos1[0] - pos2[0], pos1[1] - pos2[1]];
			//var distance2_2 = difVector2[0]*difVector2[0] + difVector2[1]*difVector2[1];
			var difVector_next = [pos1[0] - pos2[0], pos1[1] - pos2[1]];
			var distance2_next = Math.sqrt(difVector_next[0]*difVector_next[0] + difVector_next[1]*difVector_next[1]);
			
			// Если объекты разлетаются в стороны, то ничего не делаем
			if(distance2_next > distance2_now) return;
			// Если объекты уже внутри друг друга, то ничего не делаем, чтобы дать им возможность расцепиться
			//if(distance2_now < this.radius + object.radius) return;
			
			if(distance2_next <= this.radius + object.radius){
				this.ballHits += 1;

				var n = difVector_now;
				var v = object.speed;
				var _v = [-v[0], -v[1]];
				var nLen = Math.sqrt(n[0]*n[0] + n[1]*n[1]);
				var _vLen = Math.sqrt(_v[0]*_v[0] + _v[1]*_v[1]);
				n = [n[0]/nLen, n[1]/nLen];
				
				if(object.frozen){
					var addSpeed = Math.random()
					var speedAbs = (1 + addSpeed/3)*22;
					object.SetSpeed(-n[0]*speedAbs, -Math.abs(n[1]*speedAbs));
					object.Unfreeze();
					return;
				}
				
				//2n*<a,n>-a
				var n_v_scalar = n[0]*_v[0] + n[1]*_v[1];
				var u = [2*n[0]*n_v_scalar - v[0], 2*n[1]*n_v_scalar - v[1]];
				var uLen = Math.sqrt(u[0]*u[0] + u[1]*u[1]);
				u = [(u[0]*_vLen)/uLen, (u[1]*_vLen)/uLen];
				
				var speedAfter = u;
				object.SetSpeed(speedAfter[0], speedAfter[1]);
			}
			return false;
		}		
	}
	
	// Вертикальные прямоугольные объекты
	function VerticalObject(dNodeSelector, width, height){
		FieldObject.call(this, dNodeSelector, 0);
		this.width	= width;
		this.height	= height;
	}
	VerticalObject.prototype = {
		constructor:	VerticalObject,
		SetGameFieldSelector:	function(x){ 
			this.gameFieldSelector = x; 
			if($("#" + this.domNodeSelector).length <= 0){
				$(this.gameFieldSelector).append("<div id='" + this.domNodeSelector + "'></div>");
			}
			this.domNode = $("#"+this.domNodeSelector);
			this.domNode.css({	"width": this.width + "px", 
								"height": this.height + "px",
								"position": "absolute"
								});
			//this.domNode.addClass("flat").css("background", "brown");
		},
		SetSize: function(x, y){ 
			this.width	= x;
			this.height	= y;
			
			this.domNode.css({	"width": this.width + "px", 
								"height": this.height + "px",
								"position": "absolute"
								});			
		},
		ReflectBallObject: function(object){
			pos2 = object.GetNextMovePosition();
			var left = this.fieldPosition[0];
			var top = this.fieldPosition[1];
			var right = this.fieldPosition[0] + this.width;
			var bottom = this.fieldPosition[1] + this.height;
			
			if((pos2[0] + object.radius >= left && pos2[0] - object.radius <= left && pos2[1] >= top &&  pos2[1] <= bottom )
			|| (pos2[0] + object.radius >= right && pos2[0] - object.radius <= right && pos2[1] >= top &&  pos2[1] <= bottom )){
				if(object.fieldPosition[0] < left + this.width/2 ){
					object.SetSpeed(-1*Math.abs(object.speed[0]), object.speed[1]);
				}else if(object.fieldPosition[0] > right - this.width/2 ){
					object.SetSpeed(Math.abs(object.speed[0]), object.speed[1]);
				}
			}

		}
	}
	Extend(VerticalObject, FieldObject);
	
	// Мяч
	function ObjectBall(dNodeSelector, rad){
		FieldObject.call(this, dNodeSelector, rad);
		this.gravityA = [0, 0.6];
		this.domNode = false;
		this.mass = 1;
		this.rotationSpeed = 0;
		this.rotationAngle = 0;
		this.speed = [0,0];
		this.fieldPosition = [0,0];
		this.floorHits = [];
		this.frozen = false;
	}
	ObjectBall.prototype = {
		constructor:	ObjectBall,
		Enable: function(){
			this.enabled = true; 
			this.domNode.css("opacity", "1");
			$("#" + $("#" + this.domNodeSelector).attr("id") + "_shadow").css("opacity", "0.5");			
		},
		Disable: function(){this.enabled = false; },
		Freeze:	function(){ this.frozen = true; this.enabled = false; this.speed = [0,0];},
		Unfreeze:	function(){ this.frozen = false; this.enabled = true;},
		SetGravityA:	function(x, y){ this.gravityA = [x, y]; },
		SetSpeed: 	function(x, y){ this.speed = [x, y]; },
		SetRotationSpeed:	function(x){ this.rotationSpeed = x; },
		SetRotationAngle:	function(x){ this.rotationAngle = x; },
		AddHit:	function(x){ this.floorHits.push(x); },
		// Перемещение объекта в определенную точку
		SetPosition:	function(x, y){
			if(this.domNode == false) return false;
			this.fieldPosition = [x, y];
			//--------------------------------------------------
			// Анимируем перемещение в новую точку
			//--------------------------------------------------
			//this.domNode.css({"left": (x - this.radius) + "px", "top": (y - this.radius) + "px"});
			this.domNode.stop().animate({
				left: x - this.radius,
				top: y - this.radius,
			}, framePeriod/2, function() { 
				// Animation complete.
			});		
			
			//--------------------------------------------------
			// Анимируем поворот объекта при полете
			//--------------------------------------------------
			var oldAngle = this.rotationAngle;
			var newAngle = this.rotationAngle + this.rotationSpeed;
			var _this_domNode = this.domNode;
			$({deg: oldAngle}).animate({deg: newAngle}, {
				duration: framePeriod,
				step: function(now) {
					// in the step-callback (that is fired each step of the animation), you can use the `now` paramter which contains the current animation-position (`0` up to `angle`)
					_this_domNode.css({'-webkit-transform' : 'rotate('+ now +'deg)', '-moz-transform' : 'rotate('+ now +'deg)', '-ms-transform' : 'rotate('+ now +'deg)', 'transform' : 'rotate('+ now +'deg)'});
					//DebugInfo(now);
				}
			});
			this.rotationAngle += this.rotationSpeed;
			if(this.rotationAngle > 360) this.rotationAngle -= 360;
			if(this.rotationAngle < 0) this.rotationAngle += 360;
		
			/*
			this.rotationAngle += this.rotationSpeed;
			this.domNode.css({'-webkit-transform' : 'rotate('+ this.rotationAngle +'deg)', '-moz-transform' : 'rotate('+ this.rotationAngle +'deg)', '-ms-transform' : 'rotate('+ this.rotationAngle +'deg)', 'transform' : 'rotate('+ this.rotationAngle +'deg)'});
			if(this.rotationAngle > 360) this.rotationAngle -= 360;
			if(this.rotationAngle < 0) this.rotationAngle += 360;
			DebugInfo(this.rotationAngle);
			*/
			
			//--------------------------------------------------
			// Анимируем перемещение тени объекта
			//--------------------------------------------------
			var objectShadowIdSelector = $("#" + this.domNodeSelector).attr("id") + "_shadow";
			// Проверяем, есть ли у объекта тень
			if($("#" + objectShadowIdSelector).length <= 0){
				// Если тени нет, добавляем ее
				$(this.gameFieldSelector).append("<div id='" + objectShadowIdSelector + "' class='shadow'></div>");
				$("#" + objectShadowIdSelector).width(this.radius*2).height(10).css("left", (x - this.radius) + "px").css("top", ($(this.gameFieldSelector).height() - floorLevel/2) + "px");
			} 
			
			$("#" + objectShadowIdSelector).stop().animate({
				left: x - this.radius,
				top: $(this.gameFieldSelector).height() - floorLevel,
			}, framePeriod, function() {
				// Animation complete.
			});
			//--------------------------------------------------
		},
		
		// Вычислить новые координаты объекта и переместить его туда
		Move: function(){
			if(this.frozen){
				if(!this.domNode.hasClass("busy") && !this.enabled){
					this.domNode.addClass("busy");
					this.domNode.css("opacity", "0.7");
					var _dNode = this.domNode;
					this.domNode.stop().animate({
						opacity: 0
					}, goalAfterPause, function() { 
						// Animation complete.
						//_dNode.removeClass("busy");
					});	
					var objectShadowIdSelector = $("#" + this.domNodeSelector).attr("id") + "_shadow";
					$("#" + objectShadowIdSelector).stop().animate({
						opacity: 0
					}, goalAfterPause, function() {
						// Animation complete.
					});
				}
				//if(this.enabled){
				//	this.domNode.css("opacity", "1");
				//	$("#" + $("#" + this.domNodeSelector).attr("id") + "_shadow").css("opacity", "0.5");
				//}
				//this.SetPosition(this.fieldPosition[0], this.fieldPosition[1])
				return; 
			}else{
				this.domNode.removeClass("busy");
				this.domNode.css("opacity", "1");
				$("#" + $("#" + this.domNodeSelector).attr("id") + "_shadow").css("opacity", "0.5");
			}
			
			var x0 = this.fieldPosition;
			var t = framePeriod/30;
			var v0 = this.speed;
			var a = this.gravityA;

			this.SetSpeed(this.speed[0] + a[0]*t, this.speed[1] + a[1]*t);
			
			
			newX = x0[0] + v0[0] * t + (a[0]*t*t)/2;
			newY = x0[1] + v0[1] * t + (a[1]*t*t)/2;
			
			this.SetPosition(newX, newY)
			this.CheckAndResolveFieldCollision();
		},

		GetNextMovePosition: function(){
			var x0 = this.fieldPosition;
			var t = framePeriod/30;
			var v0 = this.speed;
			var a = this.gravityA;
			newX = x0[0] + v0[0] * t + (a[0]*t*t)/2;
			newY = x0[1] + v0[1] * t + (a[1]*t*t)/2;
			return [newX, newY];
		},
		
		// Проверка столкновений c игровым полем
		CheckAndResolveFieldCollision: function(){
			if(this.fieldPosition[0] - this.radius < 0 && this.speed[0] < 0){
				this.SetSpeed(-1 * this.speed[0], this.speed[1]);
				//this.rotationSpeed *= -1;
			}
			
			if(this.fieldPosition[0] + this.radius > $(this.gameFieldSelector).width() && this.speed[0] > 0){
				this.SetSpeed(-1 * this.speed[0], this.speed[1]);
				//this.rotationSpeed *= -1;
			}
			//if(this.fieldPosition[1] - this.radius < 0 || this.fieldPosition[1] + this.radius + floorLevel > $(gameFieldSelector).height()){
			if(this.fieldPosition[1] + this.radius + floorLevel > $(this.gameFieldSelector).height() && this.speed[1] > 0){
				this.SetSpeed(this.speed[0], -1 * this.speed[1]);
				this.floorHits.push(this.fieldPosition[0]);
				this.Freeze();
				//this.rotationSpeed *= -1;
			}
		},
		
		// Проверка столкновеня c другим объектом
		CheckObjectCollision: function(object){
			var difVector = [this.fieldPosition[0] - object.fieldPosition[0], this.fieldPosition[1] - object.fieldPosition[1]];
			var distance2 = difVector[0]*difVector[0] + difVector[1]*difVector[1];
			if(distance2 <= (this.radius + object.radius)*(this.radius + object.radius)){ return true; }
			return false;
		},
		
		ResolveObjectCollision: function(object){
			var difVector_now = [this.fieldPosition[0] - object.fieldPosition[0], this.fieldPosition[1] - object.fieldPosition[1]];
			var distance2_now = difVector_now[0]*difVector_now[0] + difVector_now[1]*difVector_now[1];

			pos1 = this.GetNextMovePosition();
			pos2 = object.GetNextMovePosition();
			//var difVector2 = [pos1[0] - pos2[0], pos1[1] - pos2[1]];
			//var distance2_2 = difVector2[0]*difVector2[0] + difVector2[1]*difVector2[1];
			var difVector_next = [pos1[0] - pos2[0], pos1[1] - pos2[1]];
			var distance2_next = difVector_next[0]*difVector_next[0] + difVector_next[1]*difVector_next[1];
			
			// Если объекты разлетаются в стороны, то ничего не делаем
			if(distance2_next > distance2_now) return;
			// Если объекты уже внутри друг друга, то ничего не делаем, чтобы дать им возможность расцепиться
			if(distance2_now < (this.radius + object.radius)*(this.radius + object.radius)) return;
			
			if(distance2_next <= (this.radius + object.radius)*(this.radius + object.radius)){
				//var bkg = object.domNode.css("background");
				//object.domNode.css("background",this.domNode.css("background"));
				//this.domNode.css("background", bkg);
				
				
				//DebugInfo(newSpeed[0] + " " + newSpeed[1] + " " + Math.sin(toRadians(30)));
				//v'1 = (2*m2*v2+(m1-m2)*v1)/(m1+m2) 
				//v'2 = (2*m1*v1+(m2-m1)*v2)/(m1+m2)
				
				var a1 = this.speed[0];
				var b1 = this.speed[1];
				var m1 = this.mass;
				var a2 = object.speed[0];
				var b2 = object.speed[1];	
				var m2 = object.mass;
				
				//v' = (v1 (m1 - m2) + v2 (2 m2)) / (m1 + m2)
				//v1 = v1i (m1 - m2) / (m1 + m2) + v2i (2 m2) / (m1 + m2) 
				//v2 = v1i (2 m1) / (m1 + m2) + v2i (m2 - m1) / (m2 + m1)
				var Aa1 = (a1*(m1-m2) + a2*(2*m2)) / (m1 + m2);
				var Bb1 = (b1*(m1-m2) + b2*(2*m2)) / (m1 + m2);
				var Aa2 = (a2*(m2-m1) + a1*(2*m1)) / (m1 + m2);
				var Bb2 = (b2*(m2-m1) + b1*(2*m1)) / (m1 + m2);
				/*
				var Aa1 = ( 2*m2*a2 + (m1-m2)*a1 )/(m1 + m2);
				var Bb1 = ( 2*m2*b2 + (m1-m2)*b1 )/(m1 + m2);
				var Aa2 = ( 2*m1*a1 + (m2-m1)*a2 )/(m1 + m2);
				var Bb2 = ( 2*m1*b1 + (m2-m1)*b2 )/(m1 + m2);
				*/
				this.SetSpeed(Aa1, Bb1);
				object.SetSpeed(Aa2, Bb2);
				
				/*var sin90 = 1;
				var varMatr90 = new RotateMatrix(-90);
				var normalVector = varMatr90.MulVector(difVector_now);
				//var normalVector = distance2_next;
				var hypoLen = Math.sqrt(normalVector[0]*normalVector[0] + normalVector[1]*normalVector[1]);
				var cosA = normalVector[0]/hypoLen;
				var sinA = normalVector[1]/hypoLen;
				var rotateMatrix1 = new Matrix([[cosA, sinA], [-sinA, cosA]]);
				var rotateBackMatrix = new Matrix([[cosA, -sinA], [sinA, cosA]]);
				
				var speedTmp1 = rotateMatrix1.MulVector([this.speed[0], this.speed[1]]);
				speedTmp1[1] *= -1;
				//speedTmp1[0] *= -1;
				var newSpeed = rotateBackMatrix.MulVector(speedTmp1);
				//var oldSpeed = this.speed;
				this.SetSpeed(newSpeed[0], newSpeed[1]);
				*/
				//var speedTmp2 = rotateMatrix1.MulVector([object.speed[0], object.speed[1]]);
				//speedTmp2[1] *= -1;
				//speedTmp2[0] *= -1;
				//var newSpeed2 = rotateBackMatrix.MulVector(speedTmp2);
				//var newSpeed2 = [oldSpeed[0] + newSpeed[0] - object.speed[0], oldSpeed[1] + newSpeed[1] - object.speed[1]];
				//object.SetSpeed(newSpeed2[0], newSpeed2[1]);
			}
			return false;
		}
		
	}	// Class Object.prototype
	Extend(ObjectBall, FieldObject);
	
	function ShowHits(hitsSelector, num){
		if($(hitsSelector).hasClass("busy")) return;
		if(num > maxPlayerBallHits){
			var html_tmp = $(hitsSelector).first().html();
			//$(hitsSelector).first().html("&#215;");
			$(hitsSelector).first().html("&#10006;");
			
			$(hitsSelector).addClass("busy").addClass("no_hits_left");
			setTimeout(function(){
				$(hitsSelector).removeClass("busy").removeClass("no_hits_left");
				$(hitsSelector).first().html(html_tmp);
			}, goalAfterPause);
			return;
		}
		$(hitsSelector).html("");
		for (i = 0; i < maxPlayerBallHits - num; i++) { 
			$(hitsSelector).append("<div class='ball_hit'></div>");
		}
	}
	
	/*
	function Matrix(arr){
		this.arr = arr;
		this.MulVector = function(vect){
			DebugInfo(this.arr[0][0] + " " + vect[0]);
			return [vect[0]*this.arr[0][0] + vect[1]*this.arr[1][0], vect[0]*this.arr[0][1] + vect[1]*this.arr[1][1]]
		}
	}	
	function RotateMatrix(angle){
		this.arr = [	
					[Math.cos(toRadians(angle)), Math.sin(toRadians(angle))], 
					[-Math.sin(toRadians(angle)), Math.cos(toRadians(angle))]
				];
				
		this.MulVector = function(vect){
			return [vect[0]*this.arr[0][0] + vect[1]*this.arr[1][0], vect[0]*this.arr[0][1] + vect[1]*this.arr[1][1]]
		}
	}	
	function toDegrees (angle) { return angle * (180 / Math.PI); }
	function toRadians (angle) { return angle * (Math.PI / 180); }	
	*/
	
