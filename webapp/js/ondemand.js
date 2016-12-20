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

$(document).on("pagecreate","#ONDEMAND-SUBGROUPS-PAGE", function(){
	var genere = $(this).attr("genere");
	$.ajax({
		type : 'GET',
		url : "/get-ondemand-subgroups/"+genere,
		success: function(response) {
			$("#listview-ondemand-subgroups").empty();
			$("#template-ondemand-subgroups").tmpl( response ).appendTo( "#listview-ondemand-subgroups" );		
			$("#listview-ondemand-subgroups").listview("refresh");
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

$(document).on("pagecreate","#ONDEMAND-SUBGROUPS-PROGRAMS-PAGE", function(){
	var genere = $("#ONDEMAND-SUBGROUPS-PAGE").attr("genere");
//	var genere = $(this).attr("genere");
	var group = $(this).attr("group");
	console.log(genere,group);
	$.ajax({
		type : 'GET',
		url : "/get-ondemand-programs/"+genere+"/"+group,
		success: function(response) {
			$.each(response, function (i, obj) {obj.target = JSON.stringify(obj);});
			$("#listview-ondemand-subgroups-programs").empty();
			$("#template-ondemand-subgroups-programs").tmpl( response ).appendTo( "#listview-ondemand-subgroups-programs" );		
			$("#listview-ondemand-subgroups-programs").listview("refresh");

        },
        error: UTILITY.httpError
	});	
	
		
});





$(function() {
	
	
	$("#listview-ondemand-groups").on("click", "li", function (event) {
		
		var genere = $(this).attr("genere");
		if(genere=="SERIE TV - ITA"){
			$("#ONDEMAND-SUBGROUPS-PAGE").attr("genere", genere);
			try {$("#ONDEMAND-SUBGROUPS-PAGE").page('destroy').page();} catch (e) {}
			$.mobile.changePage("#ONDEMAND-SUBGROUPS-PAGE");
		}else{
			$("#ONDEMAND-PROGRAMS-PAGE").attr("genere", genere);
			try {$("#ONDEMAND-PROGRAMS-PAGE").page('destroy').page();} catch (e) {}
			$.mobile.changePage("#ONDEMAND-PROGRAMS-PAGE");
		}
		
	});
	
	$("#listview-ondemand-subgroups").on("click", "li", function (event) {
		
		var group = $(this).attr("group");
		$("#ONDEMAND-SUBGROUPS-PROGRAMS-PAGE").attr("group", group);
		try {$("#ONDEMAND-SUBGROUPS-PROGRAMS-PAGE").page('destroy').page();} catch (e) {}
		$.mobile.changePage("#ONDEMAND-SUBGROUPS-PROGRAMS-PAGE");
		
	});	
	
	
	
	$("#listview-ondemand-programs").on("click", "li", function (event) {
		
		var description = $(this).attr("description");
		if(!description) description = "";
		$("#ONDEMAND-DETAIL-PAGE").attr("file", $(this).attr("file"));
		$('#ONDEMAND-DETAIL-PAGE #title').text($(this).attr("name"));
		$('#ONDEMAND-DETAIL-PAGE #description').text(description);
		$('#ONDEMAND-DETAIL-PAGE #img').attr("src",$(this).attr("thumbnail_url"));
		$('#ONDEMAND-DETAIL-PAGE #trailer').attr("trailer_url",$(this).attr("trailer_url"));
		
		try {$("#ONDEMAND-DETAIL-PAGE").page('destroy').page();} catch (e) {}
		$.mobile.changePage("#ONDEMAND-DETAIL-PAGE");
		
		
	});

	
	$("#listview-ondemand-subgroups-programs").on("click", "li", function (event) {
		
		var file = $(this).attr("file");
		socket.emit('socket-mobile-play', file);
		
		
	});
	
	
	$("#ONDEMAND-DETAIL-PAGE").on("click", "#trailer", function (event) {
		var file = $(this).attr("trailer_url");
		socket.emit('socket-mobile-play', file);
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