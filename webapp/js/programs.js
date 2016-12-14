$(document).on("pagecreate","#PROGRAMS-PAGE", function(){

	var genere = $(this).attr("genere");
	$.ajax({
		type : 'GET',
		url : "/get-programs/"+genere,
		success: function(response) {
//			console.log(response);
//			$.each(response, function (i, obj) {obj.target = JSON.stringify(obj);});
			$("#listview-programs").empty();
			$("#template-programs").tmpl( response ).appendTo( "#listview-programs" );		
			$("#listview-programs").listview("refresh");

        },
        error: UTILITY.httpError
	});	
	
		
});

$(function() {
	
	$("#listview-programs").on("click", "li", function (event) {
		
//		var data = jQuery.parseJSON($(this).attr("data"));
		
		$("#PROGRAM-DETAIL-PAGE").attr("file", $(this).attr("file"));
		$('#PROGRAM-DETAIL-PAGE #title').text($(this).attr("title"));
		$('#PROGRAM-DETAIL-PAGE #description').text($(this).attr("description"));
//		$('#PROGRAM-DETAIL-PAGE #description2').text(data.description2);
//		$('#PROGRAM-DETAIL-PAGE #img').attr("src","data:image/png;base64,"+data.img_big);
		$('#PROGRAM-DETAIL-PAGE #img').attr("src",$(this).attr("img_big_url"));
		$('#PROGRAM-DETAIL-PAGE #trailer').attr("trailer_url",$(this).attr("trailer_url"));
		
		
		try {$("#PROGRAM-DETAIL-PAGE").page('destroy').page();} catch (e) {}
		$.mobile.changePage("#PROGRAM-DETAIL-PAGE");
		
	});
	
	
	$("#PROGRAMS-PAGE").on("click", "#btIndietro", function (event) {
		$.mobile.changePage("#GENERE-PAGE");		
	});	
	
	
	$("#PROGRAM-DETAIL-PAGE").on("click", "#trailer", function (event) {
		var file = $(this).attr("trailer_url");
		console.log(file);
		socket.emit('socket-youtube-play', file);
		
	});


});