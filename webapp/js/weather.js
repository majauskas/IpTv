  $(document).ready(function() {

		//Setup the plugin, see readme for more examples
		var weather = $("#weather").flatWeatherPlugin({
		  location: "Gallarate", //city and region *required 
		  country: "Italia",         //country *required 
		  //optional:
		  api: "openweathermap", //default: openweathermap (openweathermap or yahoo)
		  apikey: "fcf9c61ad7b6a9e4ab008d562b736d3f",   //optional api key for openweather
		  view : "simple", //default: full (partial, full, simple, today or forecast)
		  displayCityNameOnly : true, //default: false (true/false) if you want to display only city name
		  forecast: 0, //default: 5 (0 -5) how many days you want forecast
		  render: true, //default: true (true/false) if you want plugin to generate markup
		  loadingAnimation: true //default: true (true/false) if you want plugin to show loading animation
		  //units : "metric" or "imperial" default: "auto"
		});

		setInterval(function() {
			weather.flatWeatherPlugin('fetchWeather').then(
					function(data){
						weather.flatWeatherPlugin('render', data);
					},function(data){
						weather.flatWeatherPlugin('error', data);
					}
			);
	 	}, 1000*60*120);
	
  });