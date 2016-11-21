$(function(){
	var canvas=$("#gameCanvas");
	var context=canvas.get(0).getContext("2d");
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	var playGame;
	
	var platformX;
	var platformY;
	var platformOuterRadius;
	var platformInnerRadius;
	
	var asteroids;
	var player;
	var playerOriginalX;
	var playerOriginalY;
	
	var playerSelected;
	var playerMaxAbsVelocity;
	var playerVelocityDampener;
	var powerX;
	var powerY;
	var score;
	var scoreTime;
	var scoreTimeout;
	var name;
	
	var scoreArr=[];
	var uiSave=$("#save");
	var gameTable=$(".gameTable");
	var uiTable=$("#scoreTable");
	var showstr;
	
	var ui = $("#gameUI");
	var uiIntro = $("#gameIntro");
	var uiStats = $("#gameStats");
	var uiComplete = $("#gameComplete");
	var uiPlay1 = $("#gamePlay1");
	var uiPlay2= $("#gamePlay2");
	var uiReset = $(".gameReset");
	var uiRemaining = $("#gameRemaining");
	var uiScore = $(".gameScore");
	var uiSlient=$(".gameSlient");
	var uiSound=$(".gameSound");
	var uiTime=$(".gameTime");
	var uiRule=$("#gameRule");
	var uiContext=$("#gameContext");
	var uiRuleContext=$("#gameRuleContext");
	
	var background=$("#background").get(0);
	var hit=$("#hit").get(0);
	var win=$("#win").get(0);
	var disappear=$("#disappear").get(0);
	disappear.volume=0.1;
	
	var Asteroid=function(x,y,radius,mass,friction){
		this.x=x;
		this.y=y;
		this.radius=radius;
		this.mass=mass;
		this.friction=friction;
		this.vX=0;
		this.vY=0;
		this.player=false;
	};
	
	function resetPlayer(){
		player.x=playerOriginalX;
		player.y=playerOriginalY;
		player.vX=0;
		player.vY=0;
	}
	
	function startGame(){
		uiTime.html("0");
		uiScore.html("0");
		uiStats.show();
		playGame=false;
		platformX=canvasWidth/2;
		platformY=180;
		platformOuterRadius=100;
		platformInnerRadius=75;
		asteroids=new Array();
		
		playerSelected=false;
		playerMaxAbsVelocity=30;
		playerVelocityDampener=0.3;
		powerX=-1;
		powerY=-1;
		score=0;
		scoreTime=0;
		
		var pRadius=15;
		var pMass=10;
		var pFriction=0.97;
		playerOriginalX=canvasWidth/2;
		playerOriginalY=canvasHeight-120;
		player=new Asteroid(playerOriginalX,playerOriginalY,pRadius,pMass,pFriction);
		player.player=true;
		asteroids.push(player);
		
		var outerRing=8;
		var ringCount=3;
		var ringSpacing=platformInnerRadius/(ringCount-1);
		for(var r=0;r<ringCount;r++){
			var currentRing=0;
			var angle=0;
			var ringRadius=0;
			if(r==ringCount-1){
				currentRing=1;
			}else{
				currentRing=outerRing-r*3;
				angle=360/currentRing;
				ringRadius=platformInnerRadius-(ringSpacing*r);
			}
			for(var a=0;a<currentRing;a++){
				var x=0;
				var y=0;
				if(r==ringCount-1){
					x=platformX;
					y=platformY;
				}else{
					x=platformX+ringRadius*Math.cos(angle*a*Math.PI/180);
					y=platformY+ringRadius*Math.sin(angle*a*Math.PI/180);
				}
				var radius=10;
				var mass=5;
				var friction=0.95;
				asteroids.push(new Asteroid(x,y,radius,mass,friction));
			}
			uiRemaining.html(asteroids.length-1);
		  
		}
		
		$(window).on("mousedown tap",function(e){
			if(!playerSelected&&player.x==playerOriginalX&&player.y==playerOriginalY){
				var canvasOffset=canvas.offset();
				var canvasX=Math.floor(e.pageX-canvasOffset.left);
				var canvasY=Math.floor(e.pageY-canvasOffset.top);
				if(!playGame){
					playGame=true;
					timer();
					animate();
				}
				var dX=player.x-canvasX;
				var dY=player.y-canvasY;
				var distance=Math.sqrt(dX*dX+dY*dY);
				var padding=5;
				if(distance<player.radius+padding){
					powerX=player.x;
					powerY=player.y;
					playerSelected=true;
				}
			}
		});
		
		$(window).on("mousemove swipe",function(e){
			if(playerSelected){
				var canvasOffset=canvas.offset();
				var canvasX=Math.floor(e.pageX-canvasOffset.left);
				var canvasY=Math.floor(e.pageY-canvasOffset.top);
				var dX=canvasX-player.x;
				var dY=canvasY-player.y;
				var distance=Math.sqrt(dX*dX+dY*dY);
				if(distance*playerVelocityDampener<playerMaxAbsVelocity){
					powerX=canvasX;
					powerY=canvasY;
				}else{
					var radio=playerMaxAbsVelocity/(distance*playerVelocityDampener);
					powerX=player.x+(dX*radio);
					powerY=player.y+(dY*radio);
				}

			}
		});
		
		$(window).on("mouseup",function(e){
			if(playerSelected){
				var dX=powerX-player.x;
				var dY=powerY-player.y;
				player.vX=-(dX*playerVelocityDampener);
				player.vY=-(dY*playerVelocityDampener);
				uiScore.html(++score);
			}
			playerSelected=false;
			powerX=-1;
			powerY=-1;
		});
		
		animate();
		
	};
	function init(){
		uiSound.hide();
		uiStats.hide();
		uiComplete.hide();
		uiContext.hide();
		uiTable.hide();
		uiRule.click(function(e){
			e.preventDefault();
			uiIntro.hide();
			uiContext.show();
		});
		uiPlay1.click(function(e){
			e.preventDefault();
			uiIntro.hide();
			startGame();
			background.play();
		});
		uiPlay2.click(function(e){
			e.preventDefault();
			uiIntro.hide();
			uiContext.hide();
			startGame();
			background.play();
		});
		uiReset.click(function(e){
			e.preventDefault();
			uiComplete.hide();
			uiTable.hide();
			clearTimeout(scoreTimeout);
			startGame();
			background.play();
			
		});
		uiSlient.click(function(e){
			e.preventDefault();
			background.pause();
			uiSlient.hide();
			uiSound.show();
		});
		uiSound.click(function(e){
			e.preventDefault();
			background.play();
			uiSound.hide();
			uiSlient.show();
		});
		uiSave.click(function(e){
			e.preventDefault();
			save();
		});
		gameTable.click(function(e){
			e.preventDefault();
			uiComplete.hide();
			createScoreTable();
			uiTable.show();	
		});
	};
	
	function createScoreTable(){
		showstr="";
		uiTable.find("tbody").empty();
		var rows=scoreArr.length;
		if(rows>8){
			rows=8;
		}
		for(var i=0;i<rows;i++){
			showstr+="<tr>";
			showstr+="<td>"+scoreArr[i].name+"</td>";
			showstr+="<td>"+scoreArr[i].score+"</td>";
			showstr+="<td>"+scoreArr[i].scoreTime+"s"+"</td>";
			showstr+="</tr>";
		}
		uiTable.find("tbody").prepend(showstr);

		
	}
	
	function save(){
		name=$("#name").get(0).value;
		if(name==""){
			$("#failmsg").html("姓名不能为空！").show();
			return;
		}
		$("#failmsg").hide();
		$("#save").attr("disabled","disabled");
		$("#successmsg").html("提交成功！").show();
		var scoreJson={};
		scoreJson.name=name;
		scoreJson.score=score;
		scoreJson.scoreTime=scoreTime;
		scoreArr.push(scoreJson);
		scoreArr.sort(function(a,b){
			if(a.score>b.score){
				return 1;
			}else if(a.score<b.score){
				return -1;
			}else{
				if(a.scoreTime>b.scoreTime){
					return 1;
				}else if(a.scoreTime<b.scoreTime){
					return -1;
				}else{
					return 0;
				}
				
			}
		});
	}
	
	function timer(){
		if(playGame){
			scoreTimeout=setTimeout(function(){
				uiTime.html(++scoreTime);
				timer();
			},1000);
		}
		
	}
	
	function animate(){
		context.clearRect(0,0,canvasWidth,canvasHeight);
		context.fillStyle="rgb(100,100,100)";
		context.beginPath();
		context.arc(platformX,platformY,platformOuterRadius,0,Math.PI*2,false);
		context.closePath();
		context.fill();
		if(playerSelected){
			context.strokeStyle="rgb(255,255,255)";
			context.lineWidth=3;
			context.beginPath();
			context.moveTo(player.x,player.y);
			context.lineTo(powerX,powerY);
			context.closePath();
			context.stroke();
		}
		
		context.fillStyle="rgb(255,255,255)";
		var deadAsteroids=new Array();
		var asteroidsLength=asteroids.length;
		for(var i=0;i<asteroidsLength;i++){
			var tmpAsteroid=asteroids[i];
			for(var j=i+1;j<asteroidsLength;j++){
				var tmpAsteroidB=asteroids[j];
				var dX=tmpAsteroidB.x-tmpAsteroid.x;
				var dY=tmpAsteroidB.y-tmpAsteroid.y;
				var distance=Math.sqrt(dX*dX+dY*dY);
				if(distance<(tmpAsteroid.radius+tmpAsteroidB.radius)){
					var angle=Math.atan2(dY,dX);
					var sine=Math.sin(angle);
					var cosine=Math.cos(angle);
					var x=0;
					var y=0;
					var xB=dX*cosine+dY*sine;
					var yB=dY*cosine-dX*sine;
					var vX=tmpAsteroid.vX*cosine+tmpAsteroid.vY*sine;
					var vY=tmpAsteroid.vY*cosine-tmpAsteroid.vX*sine;
					var vXb=tmpAsteroidB.vX*cosine+tmpAsteroidB.vY*sine;
					var vYb=tmpAsteroidB.vY*cosine-tmpAsteroidB.vX*sine;
					var vTotal=vX-vXb;
					vX=((tmpAsteroid.mass-tmpAsteroidB.mass)*vX+2*tmpAsteroidB.mass*vXb)/(tmpAsteroid.mass+tmpAsteroidB.mass);
					vXb=vTotal+vX;
					xB=x+(tmpAsteroid.radius+tmpAsteroidB.radius);
					tmpAsteroid.x=tmpAsteroid.x+(x*cosine-y*sine);
					tmpAsteroid.y=tmpAsteroid.y+(y*cosine+x*sine);
					tmpAsteroidB.x=tmpAsteroid.x+(xB*cosine-yB*sine);
					tmpAsteroidB.y=tmpAsteroid.y+(yB*cosine+xB*sine);
					tmpAsteroid.vX=vX*cosine-vY*sine;
					tmpAsteroid.vY=vY*cosine+vX*sine;
					tmpAsteroidB.vX=vXb*cosine-vYb*sine;
					tmpAsteroidB.vy=vYb*cosine+vXb*sine;
					
					hit.play();
				}
				
			}
			tmpAsteroid.x+=tmpAsteroid.vX;
			tmpAsteroid.y+=tmpAsteroid.vY;
			if(Math.abs(tmpAsteroid.vX)>0.1){
				tmpAsteroid.vX*=tmpAsteroid.friction;
			}else{
				tmpAsteroid.vX=0;
			}
			if(Math.abs(tmpAsteroid.vY)>0.1){
				tmpAsteroid.vY*=tmpAsteroid.friction;
			}else{
				tmpAsteroid.vY=0;
			}
			
			if(!tmpAsteroid.player){
				var dXp=tmpAsteroid.x-platformX;
				var dYp=tmpAsteroid.y-platformY;
				var distanceP=Math.sqrt(dXp*dXp+dYp*dYp);
				if(distanceP>platformOuterRadius){
					if(tmpAsteroid.radius>0){
						tmpAsteroid.radius-=2;
					}else{
						deadAsteroids.push(tmpAsteroid);
					}
					disappear.play();
				}
				
			}
			
			if(player.x!=playerOriginalX&&player.y!=playerOriginalY){
				if(player.vX==0&&player.vY==0){
					resetPlayer();
				}else if(player.x+player.radius<0){
					resetPlayer();
				}else if(player.x-player.radius>canvasWidth){
					resetPlayer();
				}else if(player.y+player.radius<0){
					resetPlayer();
				}else if(player.y-player.radius>canvasHeight){
					resetPlayer();
				}
			}
			
			context.beginPath();
			context.arc(tmpAsteroid.x,tmpAsteroid.y,tmpAsteroid.radius,0,Math.PI*2,false);
			context.closePath();
			context.fill();
		}
		
		var deadAsteroidsLength=deadAsteroids.length;
		if(deadAsteroidsLength>0){
			for(var di=0;di<deadAsteroidsLength;di++){
				var tmpDeadAsteroid=deadAsteroids[di];
				asteroids.splice(asteroids.indexOf(tmpDeadAsteroid),1);
				var remaining=asteroids.length-1;
				uiRemaining.html(remaining);
				if(remaining==0){
					playGame=false;
					$("#name").get(0).value="";
					uiStats.hide();
					$("#failmsg").hide();
					$("#successmsg").hide();
					$("#save").removeAttr("disabled");
					uiComplete.show();
					$(window).unbind("mousedown");
					$(window).unbind("mouseup");
					$(window).unbind("mousemove");
					win.play();
					background.pause();
				}
			}
		}
		
		if(playGame){
			setTimeout(animate,33);
		}
	}
	init();
});
