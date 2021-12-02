var cloudRange=2;
var cloudSpeed = 1.15;

var cloudHolder;
var maxWidth, maxHeight;

var clouds=[];
var speeds=[];
var cloudW = 130, cloudH = 65;

function addCloud(){
	var x=Math.floor(Math.random() * (maxWidth-cloudW)) + "px";
	var y=Math.floor(Math.random() * (maxHeight-cloudH)) + "px";
	var newCloud = document.createElement('div');
	newCloud.style.backgroundImage = "url(img/cloud_" + getRandInt(0,cloudRange)+".png)";
	newCloud.style.backgroundSize = "100%";
	newCloud.style.height = cloudH+"px";
	newCloud.style.width = cloudW+"px";
	newCloud.style.position = "absolute";
	newCloud.style.top = y;
	newCloud.style.left = x;
	newCloud.className= "cloud";
	clouds.push(newCloud);
	speeds.push(cloudSpeed * (Math.random() + 0.5));
	cloudHolder.appendChild(newCloud);
}

function getRandInt(min, max){
	return Math.floor(Math.random() * (max-min+1)) + min;
}

function updateClouds(){
	var i;
	for(i=0;i<clouds.length;i++){
		var x = clouds[i].offsetLeft + speeds[i];
		if(x > maxWidth) x=-cloudW;
		if(x < 0-cloudW) x=maxWidth;
		clouds[i].style.left = x + 'px';
	}
}

function makeClouds(){
	var i, amount;
	cloudHolder = document.getElementById("top");
	maxWidth = cloudHolder.offsetWidth;
	maxHeight = cloudHolder.offsetHeight;

	amount=getRandInt(10,20);
	for (i=0; i<amount; i++) {
		addCloud();
	}

	setInterval(updateClouds, 1000/30);
}

