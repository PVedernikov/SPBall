$(document).ready(function() { 
	var gameFieldSelector = "#play_field_container";
	var SPGame;
	var Ball1;
	
	var bkg_num = getRandomInt(0, 5);
	$("#play_field_container").css("background-image", "url('img/field_bkg" + bkg_num + ".jpg')");
	
	// Делаем паузу, чтобы браузер успел отрендерить игровое поле и на была известна его ширина
	setTimeout(function(){ 
		SPGame = new Game("#play_field_container");
		SPGame.AddGameOverCallback(function(msg){
			$("#game_over_window").find("h2").html("Победитель: " + $("#p" + msg + "_name").html() + "! <br/>(игрок №" + msg + ")");
			$("#game_over_window").fadeIn("slow");
			$("#pause_btn").hide();
			//alert(msg);
			//console.log(msg);
		});
		// Верхушка сетки
		SPGame.AddFixedObject("gridEdge", 7);
		var GridEdge = SPGame.GedObjectById("gridEdge");
		GridEdge.SetPosition($(gameFieldSelector).width()/2, 250);
		GridEdge.domNode.addClass("edge").css("background", "#EEE");
		// Сетка
		SPGame.AddVerticalObject("gridBody", 14, 350);
		var GridBody = SPGame.GedObjectById("gridBody");
		GridBody.SetPosition($(gameFieldSelector).width()/2 - 7, 250);
		GridBody.domNode.addClass("flat");
		// Мяч
		SPGame.AddBallObject("ball1", 40);
		Ball1 = SPGame.GedObjectById("ball1");
		//Ball1.SetSpeed(-12,10);
		Ball1.SetPosition($(gameFieldSelector).width()/4, $(gameFieldSelector).height()/2 + 20);
		Ball1.domNode.addClass("ball1");//.css("background", "purple");
		Ball1.SetRotationSpeed(-5);
		Ball1.Freeze();
		Ball1.Enable();
	}, 500);	
	
	function pauseGame(){
		//$("#play_field_container").hide();
		$("#game_pause_window").show();
		$("#pause_btn").hide();
		$("#resume_btn").show();
		SPGame.Stop();
	}
	function resumeGame(){
		//$("#play_field_container").show();
		$("#game_pause_window").hide();
		$("#resume_btn").hide();
		$("#pause_btn").show();
		SPGame.Start();
	}

	$("#p1_name").html($(".pl1 .item[class*=selected]").first().attr("title"));
	$(".pl1 .item").click(function(){
		$(".pl1 .item").removeClass("selected");
		$(this).addClass("selected");
		$("#p1_name").html($(this).attr("title"));
		return false;
	});
	
	$("#p2_name").html($(".pl2 .item[class*=selected]").first().attr("title"));
	$(".pl2 .item").click(function(){
		$(".pl2 .item").removeClass("selected");
		$(this).addClass("selected");
		$("#p2_name").html($(this).attr("title"));
		return false;
	});
	
	$(".control_select a").click(function(){
		$(this).parents(".control_select").first().children("a").removeClass("selected");
		$(this).addClass("selected");
		if($(".control_select[class*=p1]").find(".selected").first().attr("href") == "user"){
			$(".control_info[class*=p1]").html("Управление: кнопки A, W, D.");
		}else{
			$(".control_info[class*=p1]").html("Управление: CPU");
		}
		if($(".control_select[class*=p2]").find(".selected").first().attr("href") == "user"){
			$(".control_info[class*=p2]").html("Управление: кнопки &larr;, &uarr;, &rarr;.");
		}else{
			$(".control_info[class*=p2]").html("Управление: CPU");
		}
		return false;
	});

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	$("#start_btn").click(function(){
		// Игрок 1
		SPGame.AddPlayer("player1", 220, 450);
		var Player1 = SPGame.GedObjectById("player1");
		var Player1Class = $(".pl1 .item[class*=selected]").first().attr("href");
		Player1.AddCssClass(Player1Class);
		Player1.SetOnFloor();
		if(Player1Class == "eric"){
			Player1.SetSize(150, 180);
			Player1.SetSpeed(7, 6);		
		}
		if($(".control_select[class*=p1]").children("a.selected").first().attr("href") == "user"){
			var Controller1 = new PlayerManualController(Player1, "left", Ball1);
			SPGame.AddController(Controller1);		
		}else{
			var Controller1 = new PlayerCpuController(Player1, "left", Ball1);
			SPGame.AddController(Controller1);
			// Если играет комп, то отдаем право первого удара игроку
			Ball1.SetPosition((3*$(gameFieldSelector).width())/4, $(gameFieldSelector).height()/2 + 20);
		}

		// Игрок 2
		SPGame.AddPlayer("player2", $(gameFieldSelector).width() - 220, 450);
		var Player2 = SPGame.GedObjectById("player2");
		var Player2Class = $(".pl2 .item[class*=selected]").first().attr("href");
		Player2.AddCssClass(Player2Class);
		Player2.SetOnFloor();
		if(Player2Class == "eric"){
			Player2.SetSize(150, 180);
			Player2.SetSpeed(7, 6);		
		}
		if($(".control_select[class*=p2]").children("a.selected").first().attr("href") == "user"){
			var Controller2 = new PlayerManualController(Player2, "right", Ball1);
			SPGame.AddController(Controller2);		
		}else{
			var Controller2 = new PlayerCpuController(Player2, "right", Ball1);
			SPGame.AddController(Controller2);
			// Если играет комп, то отдаем право первого удара игроку
			Ball1.SetPosition((1*$(gameFieldSelector).width())/4, $(gameFieldSelector).height()/2 + 20);
		}

		$(this).hide();
		$("#game_start_window").hide();
		resumeGame();
		return false;
	});
	$("#resume_btn").click(function(){
		resumeGame();
		return false;
	});
	$("#pause_btn").click(function(){
		pauseGame();
		return false;
	});
		
	$('body').bind('keydown',function(e){
		if(e.which == 32 || e.which == 19 || e.which == 27){ // Space || Pause || Esc
			if($("#resume_btn").is(':visible')){
				resumeGame();
			}else if($("#pause_btn").is(':visible')){
				pauseGame();
			}
			return false;
		}
	});	
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// FANCYBOX
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	/*$('.fancybox').fancybox({
		helpers : {
			title : {
				type : 'inside'
			}
		}
	});*/

});

//function toDegrees (angle) { return angle * (180 / Math.PI); }
//function toRadians (angle) { return angle * (Math.PI / 180); }

// использование Math.round() даст неравномерное распределение!
function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function DebugInfo(msg){
	$("#debug_info").html(msg);
}
