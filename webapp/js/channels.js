$(document).on("pagecreate","#CHANNELS-PAGE", function(){

	$.ajax({
		type : 'GET',
		url : "/get-channels",
		success: function(response) {
			$.each(response, function (i, obj) {obj.target = JSON.stringify(obj);});
			$("#listview-channels").empty();
			$("#template-channels").tmpl( response ).appendTo( "#listview-channels" );		
			$("#listview-channels").listview("refresh");

        },
        error: UTILITY.httpError
	});	
		
});

$(function() {
	
	$("#listview-channels").on("click", "li", function (event) {
		
		var data = jQuery.parseJSON($(this).attr("data"));
		socket.emit('socket-mobile-play', data.file);
		
	});
	
	
	$("#CHANNELS-PAGE").on("click", "#btStop", function (event) {
		socket.emit('socket-mobile-stop');		
	});	
	$("#CHANNELS-PAGE").on("click", "#btPause", function (event) {
		socket.emit('socket-mobile-pause');	
	});	


});