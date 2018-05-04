
chrome.runtime.onMessage.addListener(function (message) {
	console.log('msg received:'+message.action);
	if (message.action === 'show-add-task-anim') {
		showStartAnim();
	} 
});

function showStartAnim(){
	var src;
	var shadow;
	src=chrome.runtime.getURL('images/down-arrow.png');

	console.log('showing animation');
	var img = document.createElement('img');
	img.src = src;
	img.style.cssText = 'position:fixed;opacity:1;z-index:999999;width:100px;height:100px;';
	document.body.appendChild(img);
	img.style.left = '70%';
	img.style.top  = '30%';
	setTimeout(function () {
		img.style.webkitTransition = 'all 2s';
		img.style.left = '90%';
		img.style.top  = '-10%';
		img.style.opacity  = .5;
		img.style.width  = 30 + 'px';
		img.style.height = 30 + 'px';
		setTimeout(function () {
			document.body.removeChild(img);
		}, 3000);
	}, 100);
}