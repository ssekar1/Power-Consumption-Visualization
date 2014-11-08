#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var mysql = require('mysql');

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        self.dbURL = process.env.OPENSHIFT_MYSQL_DB_URL + "?database=powerconsumption";
        self.pool = mysql.createPool(self.dbURL);

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '', 'index.css': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
        self.zcache['index.css'] = fs.readFileSync('./index.css');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };

	self.routes['/css'] = function(req, res)
	{
		res.setHeader('Content-Type', 'text/css');
		res.send(self.cache_get('index.css'));
	}

	self.routes['/data/indexEvents/:circuits'] = function(req, res) {
		
		var circuits = ["circuit1kw as c1", "circuit2kw as c2", "circuit3kw as c3", "circuit4kw as c4", "circuit5kw as c5", "circuit6kw as c6", 
		            "circuit7akw as c7a", "circuit1kw as c7b", "circuit8kw as c8", "circuit9kw as c9", "circuit10kw as c10", "circuit11kw as c11",
		            "circuit12kw as c12", "circuit13kw as c13", "circuit14kw as c14", "circuit15kw as c15", "circuit16kw as c16", "circuit17kw as c17", 
		            "circuit18kw as c18", "circuit19kw as c19", "circuit20kw as c20"];
		
		var selectedCircuits = req.params.circuits.split(",");
		var queryString = "SELECT unixTimestamp as ts, ";
		
		selectedCircuits.forEach(function(item) {
			queryString += circuits[parseInt(item, 10)] + ", ";
		});
		
		queryString = queryString.substring(0, queryString.length - 2);
		queryString += " FROM powerreadings";
				
		
		self.pool.query(queryString, function(err, rows, fields){
			if(err)
			{
				console.log(err);
				res.send(err);
			}
			
			var events = [], sum, count, start, end, ts = fields[0].name, cir = fields[1].name, firstRow = true;
			rows.forEach(function(d){
			    if(firstRow)
			    {
			        	firstRow = !firstRow;
			            sum = d[cir];
			            count = 1;
			            start = end = new Date(d[ts]);
			    }
			    else if( Math.abs((sum / count - d[cir])) < 0.01)
			    {
			            sum += d[cir];
			            count++;
			            end = new Date(d[ts]);
			    }
			    else
			    {
			            events.push({"start": start, "end": end, "circuit" : cir, "avgKW": sum / count});
			            start = end = new Date(d[ts]);
			            sum = d[cir];
			            count = 1;
			            
			    }
			});
			
			events.forEach(function(event){
				self.pool.query("INSERT INTO powerEvents SET ?", event, function(err, results){console.log(err)});
			});
			
			res.send("DONE indexing");
		});	
	};
	
	self.routes['/data/circuitsByMinute'] = function(req, res) {
			var circuits = req.params.circuits;
			
			self.pool.query('SELECT min(unixTimestamp) as start, max(unixTimestamp) as end, AVG(circuit1kw) as c1, ' +
					'AVG(circuit2kw) as c2, AVG(circuit3kw) as c3, AVG(circuit4kw) as c4, AVG(circuit5kw) as c5,' +
					'AVG(circuit6kw) as c6, AVG(circuit7Akw) as c7a, AVG(circuit7Bkw) as c7b, AVG(circuit8kw) as c8,' +
					'AVG(circuit9kw) as c9, AVG(circuit10kw) as c10, AVG(circuit11kw) as c11, AVG(circuit12kw) as c12,' +
					'AVG(circuit13kw) as c13, AVG(circuit14kw) as c14, AVG(circuit15kw) as c15, AVG(circuit16kw) as c16,' +
					'AVG(circuit17kw) as c17, AVG(circuit18kw) as c18, AVG(circuit19kw) as c19, AVG(circuit20kw) as c20' +
					' from powerreadings group by year, month, day, hour, minute', function(err, rows, fields){
				if(err)
				{
					console.log(err);
					res.send(err);
				}
				res.send(rows);
			});
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        self.app.use(express.static('/public'));
        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

