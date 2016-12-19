$(document).on("pagecreate","#ONDEMAND-GROUPS-PAGE", function(){

	$.ajax({
		type : 'GET',
		url : "/get-ondemand-groups",
		success: function(response) {
			$("#listview-ondemand-groups").empty();
			$("#template-ondemand-groups").tmpl( response ).appendTo( "#listview-ondemand-groups" );		
			$("#listview-ondemand-groups").listview("refresh");
        },
        error: UTILITY.httpError
	});	
});



$(document).on("pagecreate","#ONDEMAND-PROGRAMS-PAGE", function(){

	var genere = $(this).attr("genere");
	$.ajax({
		type : 'GET',
		url : "/get-ondemand-programs/"+genere,
		success: function(response) {
			$.each(response, function (i, obj) {obj.target = JSON.stringify(obj);});
			$("#listview-ondemand-programs").empty();
			$("#template-ondemand-programs").tmpl( response ).appendTo( "#listview-ondemand-programs" );		
			$("#listview-ondemand-programs").listview("refresh");

        },
        error: UTILITY.httpError
	});	
	
		
});




$(function() {
	
	
	$("#listview-ondemand-groups").on("click", "li", function (event) {
		
		var genere = $(this).attr("genere");
		
		$("#ONDEMAND-PROGRAMS-PAGE").attr("genere", genere);
		try {$("#ONDEMAND-PROGRAMS-PAGE").page('destroy').page();} catch (e) {}
		$.mobile.changePage("#ONDEMAND-PROGRAMS-PAGE");
		
	});
	
	
	
	
	
	$("#listview-ondemand-programs").on("click", "li", function (event) {
		
		var description = $(this).attr("description");
		if(!description) description = "";
		$("#ONDEMAND-DETAIL-PAGE").attr("file", $(this).attr("file"));
		$('#ONDEMAND-DETAIL-PAGE #title').text($(this).attr("name"));
		$('#ONDEMAND-DETAIL-PAGE #description').text(description);
		$('#ONDEMAND-DETAIL-PAGE #img').attr("src",$(this).attr("thumbnail_url"));
//		$('#ONDEMAND-DETAIL-PAGE #img').attr("src",$(this).attr("img_big_url"));
		$('#ONDEMAND-DETAIL-PAGE #trailer').attr("trailer_url",$(this).attr("trailer_url"));
		
		try {$("#ONDEMAND-DETAIL-PAGE").page('destroy').page();} catch (e) {}
		$.mobile.changePage("#ONDEMAND-DETAIL-PAGE");
		
		
	});
	
	$("#ONDEMAND-DETAIL-PAGE").on("click", "#trailer", function (event) {
		var file = $(this).attr("trailer_url");
		socket.emit('socket-youtube-play', file);
	});
	
	$("#ONDEMAND-DETAIL-PAGE").on("click", "#btPlay", function (event) {
		var file = $("#ONDEMAND-DETAIL-PAGE").attr("file");
		console.log(file);
		socket.emit('socket-mobile-play', file);
	});
	
	$("#ONDEMAND-DETAIL-PAGE").on("click", "#btPause", function (event) {
		socket.emit('socket-mobile-pause');
	});
	
	$("#ONDEMAND-DETAIL-PAGE").on("click", "#btStop", function (event) {
		socket.emit('socket-mobile-stop');
	});
	
	
	$("#ONDEMAND-PROGRAMS-PAGE").on("click", "#btIndietro", function (event) {
		$.mobile.changePage("#ONDEMAND-GROUPS-PAGE");		
	});	
	$("#ONDEMAND-DETAIL-PAGE").on("click", "#btIndietro", function (event) {
		$.mobile.changePage("#ONDEMAND-PROGRAMS-PAGE");		
	});	

});