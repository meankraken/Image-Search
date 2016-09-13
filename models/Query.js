var mongoose = require('mongoose');

var Query = mongoose.Schema({
	term: String
	
});

module.exports = mongoose.model("Query", Query);