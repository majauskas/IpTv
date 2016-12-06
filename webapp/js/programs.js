$(document).on("pagecreate","#PROGRAMS-PAGE", function(){

	$.ajax({
		type : 'GET',
//		url : "/get-channels",
		url : "/get-programs",
		success: function(response) {
			console.log(response);
			$.each(response, function (i, obj) {obj.target = JSON.stringify(obj);});
			$("#listview-programs").empty();
			$("#template-programs").tmpl( response ).appendTo( "#listview-programs" );		
			$("#listview-programs").listview("refresh");
			
//			
//			$('#listview-programs li .delete-btn').on('touchend', function(e) {
//			    e.preventDefault();
//			    var _id = $(this).parents('li').attr("id");
//			    $(this).parents('li').slideUp('fast', function() {
//				    $(this).remove();
//				    setTimeout(function() {
//						$.ajax({
//							global: false,
//							type : 'DELETE',
//							url : "/Event/"+_id,
//					        error: UTILITY.httpError
//						});
//				    }, 0);
//			    });
//			});
			
        },
        error: UTILITY.httpError
	});	
	
		
});

$(function() {
	var socket = io.connect();
	
	
	
	$("#listview-programs").on("click", "li", function (event) {
		
		var data = jQuery.parseJSON($(this).attr("data"));
//		console.log(data);
		socket.emit('socket-mobile-play', data.file);
//		$('#EDIT-SCHEDULER-PAGE #name').val(data.name);
//		$("#EDIT-SCHEDULER-PAGE").attr("data", $(this).attr("data"));
//		
//		try {$("#EDIT-SCHEDULER-PAGE").page('destroy').page();} catch (e) {}
//		$.mobile.changePage("#EDIT-SCHEDULER-PAGE");
		
	});


});