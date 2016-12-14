$(document).on("pagecreate","#GENERE-PAGE", function(){

		$.ajax({
			type : 'GET',
			url : "/get-genere",
			success: function(response) {
				
				$("#listview-genere").empty();
				$("#template-genere").tmpl( response ).appendTo( "#listview-genere" );		
				$("#listview-genere").listview("refresh");
				
	        },
	        error: UTILITY.httpError
		});	
	

	
		
});

$(function() {
	
	
	$("#listview-genere").on("click", "li", function (event) {
		
		var genere = $(this).attr("genere");
		$("#PROGRAMS-PAGE").attr("genere", genere);
		try {$("#PROGRAMS-PAGE").page('destroy').page();} catch (e) {}
		$.mobile.changePage("#PROGRAMS-PAGE");
		
	});


});