  $(document).ready(function() {

	getTime();
	setInterval(function() {
		getTime();
	}, 1000*10);

	

	function getTime() {
		var monthNames = [ "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre" ]; 
		var dayNames= ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"]
		
		var newDate = new Date();
		newDate.setDate(newDate.getDate());
		$('#clockDate').html(dayNames[newDate.getDay()] + " " + newDate.getDate() + ' ' + monthNames[newDate.getMonth()] + ' ' + newDate.getFullYear());
					
		var date = new Date();
		var hours = date.getHours();
		hours = ( hours < 10 ? "0" : "" ) + hours;
		var minutes = date.getMinutes();
		minutes = ( minutes < 10 ? "0" : "" ) + minutes;
	
		$("#clockTime").html(hours+":"+minutes);
	};


	
  });