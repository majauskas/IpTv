

module.exports.sleep = function (milliseconds) {

	var waitTill = new Date(new Date().getTime() + milliseconds);
	while(waitTill > new Date()){}
	
}



