$(document).on("pagecreate","#PROGRAM-DETAIL-PAGE", function(){

		
});

$(function() {
	
	$("#PROGRAM-DETAIL-PAGE").on("click", "#btIndietro", function (event) {
		$.mobile.changePage("#PROGRAMS-PAGE");		
	});	
	
	$("#PROGRAM-DETAIL-PAGE").on("click", "#btPlay", function (event) {
		var file = $("#PROGRAM-DETAIL-PAGE").attr("file");
		socket.emit('socket-mobile-play', file);
	});
	
	$("#PROGRAM-DETAIL-PAGE").on("click", "#btPause", function (event) {
		socket.emit('socket-mobile-pause');
	});
	
	$("#PROGRAM-DETAIL-PAGE").on("click", "#btStop", function (event) {
		socket.emit('socket-mobile-stop');
	});
	
	


});