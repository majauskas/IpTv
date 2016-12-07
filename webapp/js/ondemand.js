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
		
		var data = jQuery.parseJSON($(this).attr("data"));
		socket.emit('socket-mobile-play', data.file);
		
	});
	
	$("#ONDEMAND-PROGRAMS-PAGE").on("click", "#btIndietro", function (event) {
		$.mobile.changePage("#ONDEMAND-GROUPS-PAGE");		
	});	

});