var resources = [];
var objectives = [];
var survivors = [];
var harvestables = [];
var craftables = [];

var elementHeight = 25;
var padding = 60;

var tick = 10;

var totalActions = 3;
var maxActions = 3;
var actionsRemaining = 0;

var survivorCount = 1;

var style;
var startColor, midColor, dayColor, nightColor, sunsetColor;

function init(){
	//alert(0);
	drawSea();
	style = getComputedStyle(document.documentElement);
	startColor = style.getPropertyValue("--middle");
	midColor = style.getPropertyValue("--top");
	dayColor = style.getPropertyValue("--day");
	nightColor = style.getPropertyValue("--night");
	sunsetColor = style.getPropertyValue("--sunset");

	sky = document.getElementById("top");
	stars =document.getElementById("stars");

	loadDataFromCookie();
	updateTimeOfDay();
	setInterval(function(){
		updateTimeOfDay();
	}, 10);
}

var waveWidth = 50;
var waveHeight = 15;
var waveDist = 25;

var waveCount = 20;
var waveOscCount = 20;

var waveSpeed = 0.003;

var c,w,h;
var ctx;

var waveColors = ["#00ADDD", "#0088cc", "#0099cc", "#0077bb"];
var colLen;

function drawSea(){
	c = document.getElementById("sea");
	w = c.parentNode.offsetWidth;
	h = c.parentNode.offsetHeight;
	c.width = w;
	c.height = h;
	waveOscCount = w/waveWidth+1;
	waveCount = h/waveDist+1;
	
	ctx = c.getContext("2d");
	
	ctx.lineWidth = 5;
	colLen = waveColors.length;

	wave_t=0;

	setInterval(function(){
		updateSea();
	}, tick)
}

var doResize;
function resize(){
	clearTimeout(doResize);
  	doResize = setTimeout(function(){
  		//alert(13);
		w = c.parentNode.offsetWidth;
		h = c.parentNode.offsetHeight;
		c.width = w;
		c.height = h;
		waveOscCount = w/waveWidth+1;
		waveCount = h/waveDist+1;
		maxWidth = cloudHolder.offsetWidth;
		maxHeight = cloudHolder.offsetHeight;
  	}, 100);
}

var wave_t;
var wdir=1;

function updateSea(){
	wave_t+=waveSpeed*wdir;
	if(wave_t>3)
		wdir=-1;
	if(wave_t<-3)
		wdir=1;

	//console.log(wave_t);
	for(var i=0; i<waveCount; i++){
		ctx.beginPath();
		var off = Math.pow(-1,i)*0.25*wave_t;
		//var off=Math.pow(-1,i)*0.25;
		ctx.moveTo(0, (i)*waveDist);
		for(var j=0; j<waveOscCount; j++){ 
			ctx.quadraticCurveTo((off+j)*waveWidth+waveWidth/2, (i)*waveDist+waveHeight, (off+j+1)*waveWidth, (i)*waveDist);
		}
		ctx.lineTo(w, (i+2)*waveDist);
		ctx.lineTo(0, (i+2)*waveDist);
		ctx.fillStyle=waveColors[i%colLen];
		ctx.fill();
	}
}

function showResources(){
	var i;
	var resPanel = document.getElementById("resource-panel");
	var resUI = document.getElementById("resources");
	var str = "<table>";
	var lineCount=0;
	for(i=0;i<resources.length;i++){
		if(resources[i].amount != 0){
			str+="<tr><td>";
			str+=resources[i].name;
			str+="</td><td>";
			if(resources[i].amount<0)
				str+="<div class='urgent'>"+resources[i].amount+"</div>";
			else
				str+=resources[i].amount;
			str+="</td></tr>";
			lineCount++;
		}
	}
	str+="</table>";

	resPanel.style.height = lineCount * elementHeight + padding + "px";
	resUI.innerHTML = str;
}

function showObjectives(){
	var i, j;
	var objPanel = document.getElementById("objective-panel");
	var objUI = document.getElementById("objectives");
	var table = document.createElement('table');
	var lineCount=0;
	for(i=0;i<objectives.length;i++){
		if(objectives[i].unlocked && !objectives[i].completed){
			var row = table.insertRow();
			
			var head=document.createElement('th');
			head.colspan = 2;
			var a = document.createElement('a');
			a.href="#";
			a.className = "objective-title";
			a.innerHTML = objectives[i].title;
			a.id = objectives[i].id;
			a.onclick = function(){
				complete(this.id);
			};
			head.appendChild(a);
			row.appendChild(head);

			var satisfiedReqs=0;

			for(j=0; j<objectives[i].requirements.length; j++){
				var resID = objectives[i].requirements[j].resID;
				var resClass = "";
				if(resources[resID].amount >= objectives[i].requirements[j].amount) {
					resClass="resource-positive";
					satisfiedReqs++;
				}else {
					resClass="resource-negative";
				}
				row = table.insertRow();
				var cell = row.insertCell();
				cell.innerHTML=resources[resID].name;
				cell.className = resClass;

				cell = row.insertCell();
				cell.innerHTML=objectives[i].requirements[j].amount;
				cell.className = resClass;
				lineCount++;
			}

			if(satisfiedReqs>=objectives[i].requirements.length){
				objectives[i].requirements.canComplete = true;
				head.classList.add('pulses');
				a.innerHTML+="!";
			}

			lineCount++;
		}
	}
	

	objPanel.style.height = lineCount * elementHeight + padding + "px";
	objUI.innerHTML = "";
	objUI.appendChild(table);
}

function showSurvivors(){
	var i;
	var survUI = document.getElementById("survivors");
	survUI.innerHTML = "";
	var str = "";
	actionsRemaining = 0;
	var survCount = 0;
	for(i=0; i<survivors.length; i++){
		if(survivors[i].unlocked){
			survCount++;
			var classStr = "survivor-";
			if(survivors[i].busy){
				classStr+="busy";
			}else{
				classStr+="idle";
			}
			actionsRemaining+=survivors[i].actions;
			var newSurv = document.createElement('div');
			newSurv.id = survivors[i].name;
			newSurv.className = "survivor";
			newSurv.innerHTML="<div style='background-image: url("+survivors[i].image+");' class='"+classStr+"'></div>";
			newSurv.innerHTML+="<h5>"+survivors[i].name+"<br>"+survivors[i].actions+"/"+maxActions+"</h5>";
			if(!survivors[i].busy || survivors[i].actions==0)
				survUI.appendChild(newSurv);
		}
	}

	totalActions = survCount * maxActions;
	
	if(actionsRemaining==0){
		advanceDays();
	}

	document.getElementById("actions").innerHTML = "Actions remaining: "+actionsRemaining;	
}

var tod_t = 0;
var tod_incr = 0.003;

var sky, stars;

function updateTimeOfDay(){
	//alert("Updating sky");
	var desiredT = 1-actionsRemaining/totalActions;
	if(tod_t+tod_incr<desiredT){
		tod_t += tod_incr;
	}else if(tod_t-tod_incr>desiredT){
		tod_t -= tod_incr;
	}else {
		//console.log("skip");
		return;
	}
	tod_t = clamp(tod_t,0,1);
	var lerpColor1 = lerp(hexToRgb(startColor), hexToRgb(nightColor), tod_t);
	var lerpColor1Str = "RGB("+parseInt(lerpColor1[0]) + "," + parseInt(lerpColor1[1]) + "," + parseInt(lerpColor1[2]) + ")";

	var lerpColor2 = lerp(hexToRgb(midColor), hexToRgb(nightColor), tod_t);
	var lerpColor2Str = "RGB("+parseInt(lerpColor2[0]) + "," + parseInt(lerpColor2[1]) + "," + parseInt(lerpColor2[2]) + ")";

	var lerpColor3 = lerp(hexToRgb(dayColor), hexToRgb(sunsetColor), tod_t);
	var lerpColor3Str = "RGB("+parseInt(lerpColor3[0]) + "," + parseInt(lerpColor3[1]) + "," + parseInt(lerpColor3[2]) + ")";

	//console.log(t + " ::: " + desiredT);
	sky.style.backgroundImage = "linear-gradient(180deg, "+lerpColor1Str +" 0%," + lerpColor2Str + " " + tod_t*100 + "%," + lerpColor3Str + " 100%)";
	stars.style.opacity = Math.pow(tod_t, 3);
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function showCraftables(){
	var i,j;
	var craftPanel = document.getElementById("crafting-panel");
	var crafts = document.getElementById("crafting");
	crafts.innerHTML = "";
	var lineCount = 0;

	var table = document.createElement('table');
	for(i=0; i<craftables.length; i++){
		if(craftables[i].unlocked){
			var row = table.insertRow();
			var cell = row.insertCell();
			cell.innerHTML = craftables[i].name + " ["+craftables[i].crafted+"]";
			cell = row.insertCell();
			cell.align = "right";
			var div = document.createElement('div');
			var a = document.createElement('a');
			a.href="#";
			a.innerHTML = "+";
			a.className = "craft";
			a.id = i;
			a.onclick = function(){
				tryCraft(this.id);
			}
			div.appendChild(a);
			cell.appendChild(div);
			row = table.insertRow();
			cell = row.insertCell();
			cell.innerHTML = "[";
			cell.className = "materials";
			var reqsMet = 0;
			var reqCount = craftables[i].requirements.length;

			for(j=0; j<reqCount; j++){
				var req = craftables[i].requirements[j];

				if(resources[req.resID].amount >= req.amount){
						cell.innerHTML += "<span class='resource-positive'>"+resources[req.resID].name+": "+req.amount+"</span>";
						reqsMet++;
					}
				else {
					cell.innerHTML += resources[req.resID].name + ": " + req.amount;
				}

				if(j!=reqCount-1)
					cell.innerHTML += ", ";
			}
			cell.innerHTML += "]";
			if(reqsMet==reqCount) {
				div.classList.add("pulses");
				//console.log(reqsMet + " " + reqCount);
			}
			
			lineCount+=2;
		}
	}
	craftPanel.style.height = lineCount * elementHeight + padding + "px";
	crafts.appendChild(table);
}

function tryCraft(index){
	var craftable = craftables[index];
	var len = craftable.requirements.length;
	var reqMet = 0;
	for(var i=0; i<len; i++){
		if(craftable.requirements[i].amount <= resources[craftable.requirements[i].resID].amount){
			reqMet++;
		}
	}
	if(reqMet==len){
		craftable.crafted++;
		for(var i=0; i<len; i++)
		{
			consume(craftable.requirements[i].resID, craftable.requirements[i].amount);
		}
	}
	showAll();
	//console.log(craftable.name);
}

function hexToRgb(hex) {
	var newHex = hex.substr(2);
    var aRgbHex = newHex.match(/.{1,2}/g);
	var aRgb = [
    parseInt(aRgbHex[0], 16),
    parseInt(aRgbHex[1], 16),
    parseInt(aRgbHex[2], 16)
	];
	return aRgb;
}

var survCount=1;

function advanceDays(){
	//console.log("MORNING!");
	var len = survivors.length;
	for(var i=0; i<len; i++){
		survivors[i].busy = false;
		survivors[i].actions = maxActions;
	}
	survCount = 0;
	for(var i=0; i<len; i++){
		if(survivors[i].unlocked)
			survCount++;
	}
	var parent = document.getElementById("resource-panel");
	var len = craftables.length;
	for(var i=0; i<len; i++){
		if(craftables[i].unlocked && craftables[i].crafted>0){
			resources[craftables[i].resID].amount += craftables[i].amount*craftables[i].crafted;
			showFloatyText(parent, "+" + craftables[i].amount+" "+resources[craftables[i].resID].name,"resource-positive", 1000,0.75, 0.12, 3);
		}
	}

	resources[0].amount-=survCount;
	if(resources[0].amount<=-10)
		showMenu("loss");
	showResources();
	showSurvivors();
}

function complete(id) {
	//console.log("Doing objective "+id);
	var objective = objectives[id];
	var reqsMet=0;
	var len = objective.requirements.length
	for(var i=0; i<len; i++){
		if(resources[objective.requirements[i].resID].amount >= objective.requirements[i].amount)
			reqsMet++;
	}
	if(reqsMet==len){
		for(var i=0;i<len; i++){
			consume(objective.requirements[i].resID, objective.requirements[i].amount);
		}
		objectives[id].completed = true;
		switch(id){
			case "0":
			craftables[0].unlocked = true;
			objectives[1].unlocked = true;
			//console.log("Shelter built.");
			break;

			case "1":
			survivors[1].unlocked = true;
			//craftables[1].unlocked = true;
			objectives[2].unlocked = true;
			objectives[3].unlocked = true;
			break;

			case "2":
			survivors[2].unlocked = true;
			break;

			case "3":
			survivors[3].unlocked = true;
			survivors[4].unlocked = true;
			craftables[1].unlocked = true;
			objectives[4].unlocked = true;
			break;

			case "4":
			showMenu("victory");
			break;
		}
	showAll();		
	}
}

function consume(resID, amount){
	//alert(resources[resID] +", "+amount);
	resources[resID].amount-=amount;
}

function harvest(obj) {
	var i=0;
	var h=-1;
	while(i<harvestables.length){
		if(harvestables[i].name == obj.id && !harvestables[i].occupied){
			h=i;
			break;
		}
		i++;
	}
	if(h==-1) {
		console.log("Harvestable not found! ["+obj.id+"]");
		return;
	}

	i=0;
	while(i<survivors.length) {
		if(!survivors[i].busy && survivors[i].unlocked){
			showSurvivors();
			survivors[i].busy = true;
			harvestables[h].occupied = true;
			
			var avatar = document.getElementById(survivors[i].name);
			avatar.childNodes[0].classList.add('wiggles');
			var oldObj = avatar.parentNode;
			var travelTime = 1000;
			travel(oldObj, obj, avatar, travelTime);
			
			setTimeout(function(){
				var survID = i;
				avatar.childNodes[0].className = 'survivor-busy';
				avatar.childNodes[0].classList.add('spins');
				var bar = newProgressBar();
				avatar.appendChild(bar);
				var t=0;
				var incr=tick/harvestables[h].time;

				var myInterval = setInterval(function(){
					bar.childNodes[0].style.width = t*90+"%";
					avatar.childNodes[0].style.opacity = 1-Math.pow(t,6);
					t+=incr;
				}, tick);

				setTimeout(function(){
					completeAction(survID, h, avatar);
					clearInterval(myInterval);
				}, harvestables[h].time);
			}, travelTime);
			break;
		}
		i++;
	}
}

function newProgressBar(){
	var bar = document.createElement('div');
	bar.className = 'pbar';
	var barVal = document.createElement('div');
	barVal.className = 'pbar-value';
	bar.appendChild(barVal);

	return bar;
}

function completeAction(survID, hIndex, oldAvatar){
	resources[harvestables[hIndex].resID].amount+=harvestables[hIndex].reward;
	showResources();
	showCraftables();
	showObjectives();
	//console.log(survID);
	survivors[survID].busy = false;
	survivors[survID].actions--;
	if(survivors[survID].actions<=0){
		survivors[survID].busy = true;
	}
	harvestables[hIndex].occupied = false;
	oldAvatar.parentNode.removeChild(oldAvatar);
	showSurvivors();

	showFloatyText(
		document.getElementById(harvestables[hIndex].name)
		, "+" + harvestables[hIndex].reward+" "+resources[harvestables[hIndex].resID].name
		,"resource-positive",1000,0.75, 0.12, 3);
	console.log(survivors[survID].name+" harvested "+resources[harvestables[hIndex].resID].name+"x"+harvestables[hIndex].reward);
}

function travel(startLoc, endLoc, char, time){
	var holder = document.getElementById("island");
	var A = [startLoc.offsetLeft + startLoc.offsetWidth/2 - char.offsetWidth/2, startLoc.offsetTop - startLoc.offsetHeight/2];
	var B = [endLoc.offsetLeft + endLoc.offsetWidth/2 - char.offsetWidth/2, endLoc.offsetTop + endLoc.offsetHeight/2 - char.offsetHeight/2];
	
	var incr = tick/time;
	//console.log(incr);
	var t=0;
	//console.log(t);

	char.style.visibility = "hidden";
	holder.appendChild(char);
	char.style.position = "absolute";

	var myInterval = setInterval(function(){
		t+=incr;
		var nt = t;
		var X = lerp(A, B, nt);
		char.style.left = X[0] + "px";
		char.style.top = X[1] + "px";
		char.style.visibility = "visible";
	}, tick);

	setTimeout(function(){
		clearInterval(myInterval);
	}, time);
}

function lerp(a, b, t) {
    var len = a.length;
    if(b.length != len) return;

    var x = [];
    for(var i = 0; i < len; i++)
        x.push(a[i] + t * (b[i] - a[i]));
    return x;
}

function showFloatyText(parent, str, strClass, time, speed, wobbleSpeed, wobbleAmount) {
	var text = document.createElement('p');
	text.innerHTML = str;
	text.style.position = "absolute";
	text.className = strClass;
	var y;
	parent.appendChild(text);

	y=0;
	var myInterval = setInterval(function(){
		text.style.bottom = parent.offsetHeight/2 - text.offsetHeight/2 + y + "px";
		text.style.opacity = 1-y/(time*speed/tick);
		//alert(text.style.opacity);
		text.style.left = parent.offsetWidth/2 - text.offsetWidth/2 + Math.sin(y * wobbleSpeed) * wobbleAmount + "px";
		y+=speed;
		
	}, tick);

	setTimeout(function(){
		clearInterval(myInterval);
		parent.removeChild(text);
	}, time)
}

function request(name){
	if(window.XMLHttpRequest){
		xhttp = new XMLHttpRequest();
	}else {
		xhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhttp.open("POST", name, true);
	xhttp.send();
	return xhttp;
}

function newGame(parent){
	var xml = request("start.json");
	xml.onreadystatechange = function(){
		if(this.readyState==0 || (this.readyState == 4 && this.status==200)){
			var data = JSON.parse(xml.responseText);
			loadData(data);
			if(parent) showFloatyText(parent.parentNode.parentNode, "Restarted!", 'notification', 2000, 0.1, 0.1, 0.1);
		}
	};
}

function showAll(){
	showSurvivors();
	showResources();
	showCraftables();
	showObjectives();
}

function saveDataToCookie(){
	var str = stringifyData();
	console.log(str);
	var date = new Date();
	date.setDate(date.getDate()+7);
	document.cookie = "save="+str+";expires="+date.toUTCString()+";SameSite=Lax";
}

function loadDataFromCookie(){
	var data = ""+getCookie("save");
	//alert(data);
	if(data.length<=20)
		newGame();
	else{
		data=JSON.parse(data);
		loadData(data);
	}
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function loadDataFromString(){
	var td = document.getElementById("text-data");
	console.log(td.value);
	loadData(JSON.parse(td.value));
}

function loadData(data){
	resources = data[0];
	objectives = data[1];
	survivors = data[2];
	harvestables = data[3];
	craftables = data[4];
	showAll();
	tod_t=1-actionsRemaining/totalActions+0.01;
}

function saveDataToFile(parent){
	var str = stringifyData();
	
	var blob = new Blob([str],{type:"text/plain;charset=utf-8"});
	saveAs(blob, "save.txt");
}

function copyDataString(){
	var dd = document.getElementById("data-display");
	dd.select();
	document.execCommand('copy');
}

function stringifyData(){
	str="["
	str+=JSON.stringify(resources)+",";
	str+=JSON.stringify(objectives)+",";
	str+=JSON.stringify(survivors)+",";
	str+=JSON.stringify(harvestables)+",";
	str+=JSON.stringify(craftables);
	str+="]"
	return str;
}

/*function loadData(parent){
	showFloatyText(parent.parentNode.parentNode, "Loaded from data!", 'notification', 2000, 0.1, 0.1, 0.1);
}*/

var vis1=false, vis2=false;

function toggleMenu(id){
	if(id=='text-save'){
		if(vis1)
			closeMenu('text-save');
		else{
			document.getElementById('data-display').innerHTML= stringifyData();
			showMenu('text-save');
		}
		if(vis2)
			closeMenu('text-load');
	}else if(id=='text-load'){
		if(vis2)
			closeMenu('text-load');
		else
			showMenu('text-load');
		if(vis1)
			closeMenu('text-save');
	}
	console.log(vis1 +", "+vis2);
}

function showMenu(id){
	var div = document.getElementById(id);
	div.classList.remove("popup-reverse");
	div.classList.remove("popup");
	void div.offsetWidth;
	div.classList.add("popup");
	div.style.visibility = "visible";
	if(id=='text-save')
		vis1=true;
	if(id=='text-load')
		vis2=true;
}

function closeMenu(id){
	var div = document.getElementById(id);
	div.classList.remove("popup");
	div.classList.remove("popup-reverse");
	void div.offsetWidth;
	div.classList.add("popup-reverse");
	//div.style.visibility = "hidden";
	if(id=='text-save')
		vis1=false;
	if(id=='text-load')
		vis2=false;
}


