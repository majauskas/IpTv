

var mongoose = require('mongoose');
var os = require('os');

//var url = "mongodb://ajauskas.homenet.org/home-system";
var url = "mongodb://192.168.7.94/test";
//var url = "mongodb://192.168.0.2/test";
//console.log("hostname",os.hostname().toLowerCase());
//if(os.hostname().toLowerCase() === "raspberrypi"){
//	url = "mongodb://192.168.0.2/home-system-tv";
//}
mongoose.connect(url);

mongoose.connection.on("connected", function(ref) {
  console.log("Connected to " + url);
});
mongoose.connection.on("error", function(err) {
  console.error('Failed to connect to DB on startup ', err);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection to DB disconnected');
});

//If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
});
var Schema = mongoose.Schema;




//-----------CHANNELS---------------------------------------------
var ChannelsSchema = new Schema({
  id: Number,
  name: String,
  number: Number,
  service: Number,
  imgBase64: String,
  file: String
},{toJSON:{virtuals: true}});

module.exports.CHANNELS = mongoose.model('CHANNELS', ChannelsSchema);



//-----------PROGRAMS---------------------------------------------
var ProgramsSchema = new Schema({
  channel: Number,
  name: String,
  file: String,
  number: Number,
  service: Number,
  channellogo: String,
  id: Number,
  pid: Number,
  starttime: String,
  startDate: Date,
  dur: Number,
  title: String,
  normalizedtitle: String,
  desc: String,
  genre: String,
  subgenre: String,
  prima: {type : Boolean, 'default': false},
  img_small: String,
  img_big: String,
  img_small_url: String,
  img_big_url: String,
  description: String,
  description2: String,
  uscita: String,
  nazione: String,
  audio: String,
  age: String,
  regia: String,
  cast: String
},{toJSON:{virtuals: true}});

module.exports.PROGRAMS = mongoose.model('PROGRAMS', ProgramsSchema);


//-----------ONDEMAND---------------------------------------------
var OndemandSchema = new Schema({
  name: String,
  logo: String,
  title: String,
  group: String,
  file: String
},{toJSON:{virtuals: true}});

module.exports.ONDEMAND = mongoose.model('ONDEMAND', OndemandSchema);


//-----------LUCKY_LIVE---------------------------------------------
var LuckyLiveSchema = new Schema({
  name: String,
  logo: String,
  title: String,
  group: String,
  file: String,
  imgBase64: String
},{toJSON:{virtuals: true}});

module.exports.LUCKY_LIVE = mongoose.model('LUCKY_LIVE', LuckyLiveSchema);

