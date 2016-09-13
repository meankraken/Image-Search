var express = require('express');
var request = require('request');
var mongoose = require('mongoose');

var app = express();

var port = process.env.PORT || 8080;
var url = process.env.MONGOLAB_URI || "mongodb://localhost/MyDataBase";

var Query = require('./models/Query.js');

mongoose.connect(url);

app.get('/', function(req,res) {
	res.end("Instructions: Append the url with /imagesearch followed by the query as the parameter. You may include an offset as a query string. Append the url with /latest instead to see the latest search queries.\nExample: https://image-search-jf.herokuapp.com/imagesearch/cats?offset=5");
	
});

app.get('/imagesearch/:id', function(req,res) {
	if (req.params.id) {
		var str = req.params.id; 
	}
	else {
		res.end("Please enter a valid search term.");
	}
	var options = {
		url: 'https://api.imgur.com/3/gallery/search?q=' + str,
		method:'GET',
		headers: {
			'Authorization': 'Client-ID 5fd887b8bd083c7'
		}
	};
	
	request(options, function(error, response, body) {
		if (error) {
			console.log(error);
		}
		else {
			Query.find().sort({ _id: -1 }).exec(function(err, docs) {
				if (docs.length>=5) {
					docs[docs.length-1].remove();
				}
			});
			
			var q = new Query({ term: req.params.id });
			q.save();
			
			var json = JSON.parse(body);
			var bod = json.data;
			var arr = [];
			if (req.query.offset) {
				if (parseInt(req.query.offset)+5>bod.length) {
					res.end("Offset too large!");
				}
				else {
					for (var i=req.query.offset; i<(parseInt(req.query.offset)+5); i++) {
						var obj = { url: bod[i].link, title: bod[i].title };
						arr.push(obj);
					}
				}
				
			}
			else {
				for (var i=0; i<5; i++) {
					var obj = { url: bod[i].link, title: bod[i].title };
					arr.push(obj);
				}
			}
			
			
			res.end(JSON.stringify(arr));
		}
		
	});
	
	
});

app.get('/latest', function(req,res) {
	Query.find().exec(function(err,docs) {
		if (docs.length==0) {
			res.end("No query history.");
		}
		var arr = [];
		for (var i=0; i<docs.length; i++) {
			var obj = { term: docs[i].term };
			arr.push(obj);
		}
		res.end(JSON.stringify(arr));
		
	});
});

app.listen(port, function() {
	console.log("Now listening on " + port);
});
