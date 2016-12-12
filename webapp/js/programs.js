$(document).on("pagecreate","#PROGRAMS-PAGE", function(){

	var genere = $(this).attr("genere");
	$.ajax({
		type : 'GET',
		url : "/get-programs/"+genere,
		success: function(response) {
			console.log(response);
			$.each(response, function (i, obj) {obj.target = JSON.stringify(obj);});
			$("#listview-programs").empty();
			$("#template-programs").tmpl( response ).appendTo( "#listview-programs" );		
			$("#listview-programs").listview("refresh");

        },
        error: UTILITY.httpError
	});	
	
		
});

$(function() {
	
	$("#listview-programs").on("click", "li", function (event) {
		
		var data = jQuery.parseJSON($(this).attr("data"));
		
		$("#PROGRAM-DETAIL-PAGE").attr("file", data.file);
		$('#PROGRAM-DETAIL-PAGE #title').text(data.title);
		$('#PROGRAM-DETAIL-PAGE #description').text(data.description);
		$('#PROGRAM-DETAIL-PAGE #description2').text(data.description2);
		$('#PROGRAM-DETAIL-PAGE #img').attr("src","data:image/png;base64,"+data.img_big);
		
		
		
		try {$("#PROGRAM-DETAIL-PAGE").page('destroy').page();} catch (e) {}
		$.mobile.changePage("#PROGRAM-DETAIL-PAGE");
		
//		$('#EDIT-SCHEDULER-PAGE #name').val(data.name);
//		$("#EDIT-SCHEDULER-PAGE").attr("data", $(this).attr("data"));
//		
//		try {$("#EDIT-SCHEDULER-PAGE").page('destroy').page();} catch (e) {}
//		$.mobile.changePage("#EDIT-SCHEDULER-PAGE");
		
	});
	
	
	$("#PROGRAMS-PAGE").on("click", "#btIndietro", function (event) {
		$.mobile.changePage("#GENERE-PAGE");		
	});	


});