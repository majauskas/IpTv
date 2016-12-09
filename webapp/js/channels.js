$(document).on("pagecreate","#CHANNELS-GROUPS-PAGE", function(){

	$.ajax({
		type : 'GET',
		url : "/get-channels-groups",
		success: function(response) {
			$.each(response, function (i, obj) {obj.target = JSON.stringify(obj);});
			$("#listview-channels-groups").empty();
			$("#template-channels-groups").tmpl( response ).appendTo( "#listview-channels-groups" );		
			$("#listview-channels-groups").listview("refresh");

        },
        error: UTILITY.httpError
	});	
		
});


$(document).on("pagecreate","#CHANNELS-PAGE", function(){

	var group = $(this).attr("group");
	
	$.ajax({
		type : 'GET',
		url : "/get-channels/"+group,
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
	
	
	$("#listview-channels-groups").on("click", "li", function (event) {
		
		var group = $(this).attr("group");
		$("#CHANNELS-PAGE").attr("group", group);
		try {$("#CHANNELS-PAGE").page('destroy').page();} catch (e) {}
		$.mobile.changePage("#CHANNELS-PAGE");
		
	});
	
	
	$("#listview-channels").on("click", "li", function (event) {
		
		var data = jQuery.parseJSON($(this).attr("data"));
		socket.emit('socket-mobile-play', data.file);
		
	});
	
	
	$("#CHANNELS-GROUPS-PAGE").on("click", "#btStop", function (event) {
		socket.emit('socket-mobile-stop');		
	});	
	$("#CHANNELS-GROUPS-PAGE").on("click", "#btPause", function (event) {
		socket.emit('socket-mobile-pause');	
	});	

	$("#CHANNELS-PAGE").on("click", "#btIndietro", function (event) {
		$.mobile.changePage("#CHANNELS-GROUPS-PAGE");
	});
	

});