$(document).ready(function () {
	let lang = GetCookie('spball_lang');
	if (!lang || (lang !== "en" && lang !== "ru")) {
		lang = "en";
	}

	ChangeLanguage(lang);

	var gameFieldSelector = "#play_field_container";
	var SPGame;
	var Ball1;

	var bkg_num = getRandomInt(0, 5);
	$("#play_field_container").css("background-image", "url('img/field_bkg" + bkg_num + ".jpg')");
	
	// Делаем паузу, чтобы браузер успел отрендерить игровое поле и на была известна его ширина
	setTimeout(function(){ 
		SPGame = new Game("#play_field_container");
		SPGame.AddGameOverCallback(function (msg) {
			$("#game_over_window").find("h2").html(`${Captions[lang].winner}: ${$(`#p${msg}_name`).html()}! <br/>(${Captions[lang].player} ${Captions[lang].n}${msg})`);
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
		if($(".control_select[class*=p1]").find(".selected").first().attr("href") == "#user"){
			$(".control_info[class*=p1]").html(Captions[lang].control1);
		}else{
			$(".control_info[class*=p1]").html(Captions[lang].controlCpu);
		}
		if($(".control_select[class*=p2]").find(".selected").first().attr("href") == "#user"){
			$(".control_info[class*=p2]").html(Captions[lang].control2);
		}else{
			$(".control_info[class*=p2]").html(Captions[lang].controlCpu);
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

	$(".game_lang").click(function(){
		lang = $(this).attr("rel");
		ChangeLanguage(lang);
	});
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

const Captions = {
	"en": {
		"title": "Volleyball",
		"start_btn": "Play",
		"pause_btn": "Pause",
		"resume_btn": "Resume",
		"restart_btn": "New Game",
		"stan_marsh": "Stan Marsh",
		"stan": "Stan",
		"kyle_broflovski": "Kyle Broflovski",
		"kyle": "Kyle",
		"kenny": "Kenny",
		"kenny_mccormick": "Kenny McCormick",
		"eric": "Eric",
		"eric_cartman": "Eric Cartman",
		"wendy": "Wendy",
		"wendy_testaburger": "Wendy Testaburger",
		"control1": "Controls: buttons A, W, D.",
		"control2": "Controls: buttons &larr;, &uarr;, &rarr;.",
		"controlCpu": "Controls: CPU",
		"user": "User",
		"cpu": "CPU",
		"rules": "<b>Game rules:</b> The first player to score 15 goals wins. A player must not touch the ball more than three times in a row. Players are controlled using the keyboard (unless the computer is playing).",
		"disclaimer": "This game is a fan-made project and is not affiliated with or endorsed by the creators of &laquo;<a href=\"http://southpark.cc.com/\">South Park</a>&raquo;. All characters and settings are the property of their respective owners.",
		"winner": "Winner",
		"player": "Player",
		"n": "#",
	},
	"ru": {
		"title": "Волейбол",
		"pause_btn": "Пауза",
		"resume_btn": "Продолжить",
		"start_btn": "Начать игру",
		"restart_btn": "Новая игра",
		"stan_marsh": "Стен Марш",
		"stan": "Стен",
		"kyle_broflovski": "Кайл Брофловски",
		"kyle": "Кайл",
		"kenny_mccormick": "Kenny МакКормик",
		"kenny": "Кенни",
		"eric_cartman": "Эрик Картман",
		"eric": "Эрик",
		"wendy": "Венди",
		"wendy_testaburger": "Венди Тестабургер",
		"control1": "Управление: кнопки A, W, D.",
		"control2": "Управление: кнопки &larr;, &uarr;, &rarr;.",
		"controlCpu": "Управление: CPU",
		"user": "Игрок",
		"cpu": "Компьютер",
		"rules": "<b>Правила игры:</b> побеждает тот игрок, который первым забьет 15 голов. При этом игорк не должен касаться мяча больше трех раз подряд. Управление игроками осуществляется с помощью клавиатуры (если в качестве игрока не выступает компьютер).",
		"disclaimer": "Эта игра является фанатским проектом и не связана с создателями мультсериала &laquo;<a href=\"http://southpark.cc.com/\">South Park</a>&raquo;. Все персонажи и игровые локации являются собственностью их правообладателей.",
		"winner": "Победитель",
        "player": "Игрок",
        "n": "№",
	}
}

function ChangeLanguage(lang) {
	SetCookie('spball_lang', lang, 7);
	$(".game_lang").removeClass("selected");
    $(".game_lang[rel='" + lang + "']").addClass("selected");
	$(".game_title").html(Captions[lang].title);
	$("#start_btn").html(Captions[lang].start_btn);
	$("#pause_btn").html(Captions[lang].pause_btn);
	$("#resume_btn").html(Captions[lang].resume_btn);
	$("#restart_btn").html(Captions[lang].restart_btn);
	$("#new_game_btn").html(Captions[lang].restart_btn);
	$("a[href = 'stan']").attr("title", Captions[lang].stan_marsh);
	$("a[href = 'kyle']").attr("title", Captions[lang].kyle_broflovski);
	$("a[href = 'kenny']").attr("title", Captions[lang].kenny_mccormick);	
	$("a[href = 'eric']").attr("title", Captions[lang].eric_cartman);
	$("a[href = 'wendy']").attr("title", Captions[lang].wendy_testaburger);
	$("a[href = 'stan'] .body_bkg").attr("title", Captions[lang].stan_marsh);
	$("a[href = 'kyle'] .body_bkg").attr("title", Captions[lang].kyle_broflovski);
	$("a[href = 'kenny'] .body_bkg").attr("title", Captions[lang].kenny_mccormick);
	$("a[href = 'eric'] .body_bkg").attr("title", Captions[lang].eric_cartman);
	$("a[href = 'wendy'] .body_bkg").attr("title", Captions[lang].wendy_testaburger);
	$(".game_rules").html(Captions[lang].rules);
	$("a[href='#user']").attr("title", Captions[lang].user);
	$("a[href='#cpu']").attr("title", Captions[lang].cpu);
	$(".game_disclamer").html(Captions[lang].disclaimer);
	$("#p1_name").html($(".player_select.pl1 .selected").first().attr("title"));
	$("#p2_name").html($(".player_select.pl2 .selected").first().attr("title"));

	if ($(".control_select[class*=p1]").find(".selected").first().attr("href") == "#user") {
		$(".control_info[class*=p1]").html(Captions[lang].control1);
	} else {
		$(".control_info[class*=p1]").html(Captions[lang].controlCpu);
	}
	if ($(".control_select[class*=p2]").find(".selected").first().attr("href") == "#user") {
		$(".control_info[class*=p2]").html(Captions[lang].control2);
	} else {
		$(".control_info[class*=p2]").html(Captions[lang].controlCpu);
	}
}

function SetCookie(cname, cvalue, exdays) {
	const d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	let expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function GetCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}