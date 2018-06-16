// NOTE NOTE NOTE  Test case for simple scrape data

const ejs = require('ejs')
const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize')
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');

const app = express();

const stopFetch = require('./components/stopFetch.js');
const getFeed = require('./components/getFeed.js');

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));



const Op = Sequelize.Op
// const sequelize = new Sequelize('barkspace', postgres_user, postgres_pass, {
const sequelize = new Sequelize('barkspace', 'postgres', 'Giraffes94', {

	// host: 'localhost',
	// port: '5432',
	dialect: 'postgres',
	operatorsAliases:{
		$and: Op.and,
		$or: Op.or,
		$eq: Op.eq,
		$regexp: Op.regexp,
		$iRegexp: Op.iRegexp,
		$like: Op.like,
		$iLike: Op.iLike
	}
})


//____________________________________CREATE A TABLE

const User = sequelize.define('user',
  {

	username: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING

  }
);


// ----------------------------------------------------------------------------- PASSPORT JS INIT


app.use(cookieParser());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

passport.use(new Strategy(

	(username, password, cb)=>{
		// NOTE User / Password confirmation for passportJS login
		// use squelize search for first data entry with username feild match
		User.findOne({
			where: {
				username: {
					$iLike : `${username}`
				}
			}
		}).then(data=>{
			if (!data) {
				return cb(null,false);
			} else if (data.password !== password) {
				return cb(null,false);
			}
			return cb(null,data);
		});
	}

));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user,cb){
	// NOTE?? gets user data from previously defined local strategy, pushes to
	// user parameter. first callback param is error throw?
	cb(null, user.id);
});

passport.deserializeUser(function(id,cb){

	User.findById(id).then(data=>{
		if(!data) {
			return cb(null,null);
		}
		cb(null,data);
	});

});


// ----------------------------------------------------------------------------- PASSPORT JS INIT



var Mta = require('mta-gtfs');
var mta = new Mta({
  key: '59226e4f5d3fa1244428c5b178a32d47', // only needed for mta.schedule() method
  feed_id: 1 // optional, default = 1
});

// Static list of posible train lines
let lineNames = ['1', '2', '3', '4', '5', '6', '7', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'J', 'L', 'M', 'N', 'Q', 'R', 'S', 'W', 'Z', 'SIR'];

// Home route displaying lines and user defined favoried stops
app.get('/', (req, res) => {


  mta.stop('A20').then(function (result) {
  console.log(result);
  });

  return res.render('home', {
    lineNames
  });
})

// switch case for assigning lines to MTA Realtime API 'feeds'


// Reads json file with the lists of stopIds, on completion renders the line page
var getStops = function(feedId, line, res) {
  console.log(`getting stops for ${feedId}`);
  fs.readFile(`StaticData/FullSimple.json`, 'utf-8', function(err, result) {
    let stops = JSON.parse(result);
    console.log(`readFile complete`);
    console.log(stops[`line${line}`]);
    return res.render('line', {
      line: line,
      stops: stops[`line${line}`],
      feedId: feedId
    });
  })

}


// route for registration page
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req,res) => {
  User.create({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  }).then(x=>{
    res.redirect(`/confirmation/${req.body.username}&${req.body.password}`);
  })
});

app.get('/confirmation/:username&:password', (req,res)=>{
  res.send('welcome')
})

// route to call Line page w/ stops
app.get('/lines/:line', (req, res) => {
  var line = req.params.line;
  // references a swtch case for parsing feeds that correspond do specific lines
  var feedId = getFeed.getFeedId(line);
  getStops(feedId, line, res);


});

app.get('/stops/:stop&:feedId', (req, res) => {
  // let lineInt = (parseInt(req.params.line[4]) - 1);
  console.log(req.params.feedId);
  console.log(req.params.stop);

  var thisStop = req.params.stop.toString();
  var thisFeed = req.params.feedId.toString();

  // Get the stop and line from req params and use them to plug in the correct datapoint in the stops.json
  // data file. Use the data-tester to make a dictionary, use dictionary as href and call the stop.

  mta.schedule(thisStop, thisFeed).then(function(result) {

    if (Object.keys(result).length === 0) {
      console.log('no data');
      return res.render('stopError', {
        errorReport: 'Alas! No times are available',
        stop: thisStop
      });
    }

    // Parseing agent for times and Northbound/Southbound differentiation

    let station = stopFetch.fetch(thisStop, thisFeed, result);

    return res.render('stop', {
      errorReport: '',
      station: station,
      stop: thisStop
    });
  }).catch(x => console.log(x));



  // console.log(`clicked ${req.params.stop}, found id ${thisStop}`);


})

app.listen(8080, function(err) {
  if (err) throw err;
  console.log('server');
});


// getTime v1 ------------------- /
// app.get('/stops/:stop&:line',(req,res)=>{
//   let lineInt = (parseInt(req.params.line[4]) - 1);
//   console.log(req.params.line);
//   console.log(lineInt);
//   var thisStop;
//   for (let stop of lineParse.lines[lineInt]) {
//     console.log(`${stop[1]['stop_name']} and ${req.params.stop}`);
//     if (stop[1]['stop_name'] == req.params.stop) {
//       thisStop = stop[1]['stop_id'];
//       break;
//     }
//   }
//   let test = setInterval(function(){
//     if(thisStop) {
//       mta.schedule(thisStop).then(function (result) {
//         console.log(result);
//         clearInterval(test);
//       })
//     }
//   },500);
//
//
//   console.log(`clicked ${req.params.stop}, found id ${thisStop}`);
//
//
// })
// -------------------------------------- /
