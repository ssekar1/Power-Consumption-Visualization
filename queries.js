(function() {
	
	var mysql = require('mysql');
	var connection;

	
	
	function connect(url)
	{
		connection = mysql.createConnection(url);
	}

    module.exports.connect = connect;


}());

