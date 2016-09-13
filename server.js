var express = require('express');
var request = require('request');

var app = express();

var port = process.env.PORT || 8080;


app.get('/', function(req,res) {
	res.end("Instructions: Append the url with /imagesearch followed by the query as the parameter.\n");
	
});

app.get('/imagesearch/:id', function(req,res) {
	var options = {
		url: 'https://api.imgur.com/3/gallery/search?q=cats',
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


app.listen(port, function() {
	console.log("Now listening on " + port);
});
