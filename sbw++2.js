// NOTE NOTE NOTE  Test case for simple scrape data

const ejs = require('ejs')
const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize')
const passport = require('passport');
const {
  Client
} = require('pg')
const Strategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');

const app = express();

const stopFetch = require('./components/stopFetch.js');
const getFeed = require('./components/getFeed.js');

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'));



const Op = Sequelize.Op
// const sequelize = new Sequelize('barkspace', postgres_user, postgres_pass, {
const sequelize = new Sequelize('subwayplusplus', 'postgres', 'Giraffes94', {

  // host: 'localhost',
  // port: '5432',
  dialect: 'postgres',
  operatorsAliases: {
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

const User = sequelize.define('user', {

  username: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  favorites: Sequelize.STRING

});

sequelize.sync()



// ----------------------------------------------------------------------------- PASSPORT JS INIT


app.use(cookieParser());
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

passport.use(new Strategy(

  (username, password, cb) => {
    // NOTE User / Password confirmation for passportJS login
    // use squelize search for first data entry with username feild match
    User.findOne({
      where: {
        username: {
          $iLike: `${username}`
        }
      }
    }).then(data => {
      if (!data) {
        return cb(null, false);
      } else if (data.password !== password) {
        return cb(null, false);
      }
      return cb(null, data);
    });
  }

));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  // NOTE?? gets user data from previously defined local strategy, pushes to
  // user parameter. first callback param is error throw?
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {

  User.findById(id).then(data => {
    if (!data) {
      return cb(null, null);
    }
    cb(null, data);
  });

});


// ----------------------------------------------------------------------------- PASSPORT JS INIT


// mta.stop('A20').then(function (result) {
// console.log(result);
// });

var Mta = require('mta-gtfs');
var mta = new Mta({
  key: '59226e4f5d3fa1244428c5b178a32d47', // only needed for mta.schedule() method
  feed_id: 1 // optional, default = 1
});

// Static list of posible train lines
let lineNames = ['1', '2', '3', '4', '5', '6', '7', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'J', 'L', 'M', 'N', 'Q', 'R', 'S', 'W', 'Z', 'SIR'];
var tempLogin = '';

// Home route displaying lines and user defined favoried stops
app.get('/', (req, res) => {

  if (req.user) {

    tempLogin = req.user.username;
    let data = JSON.parse(req.user.favorites);
		console.log('--------------------------------------------------------------------------------');
		console.log('data.favorites');

		console.log(data.favorites);
		console.log('--------------------------------------------------------------------------------');
		let favs = data.favorites
    if (favs.length !== 0) {
      for (var i = 0; i < favs.length; i++) {
				console.log(`favorite ${i} is about to be fetched`);
        mta.schedule(favs[i].stopId, favs[i].feedId).then(function(result) {
					console.log(i);
          if (Object.keys(result).length === 0) {
            console.log('error on favs[' + i + ']');
            favs[i].errorReport = 'Alas! No times are available';
          }

          // Parseing agent for times and Northbound/Southbound differentiation
					console.log('------------------------------------- run stopFetch -------------------------------------------');
					console.log(favs[i].stopId);
          favs[i].station = stopFetch.fetch(favs[i].stopId, favs[i].stopId, result);
          console.log(favs[i]);
          console.log(`favorite ${i} has data`);
        }).catch(x => console.log(x));


      }
    }
    console.log('return some favorites!');
    console.log(favs);
    return res.render('home', {
      favs: favs,
      lineNames: lineNames,
      tempLogin: tempLogin
    });

  }
  return res.render('home', {
    lineNames: lineNames,
    tempLogin: tempLogin,
    favs: false,
  });
})

// switch case for assigning lines to MTA Realtime API 'feeds'


// Reads json file with the lists of stopIds, on completion renders the line page
var getStops = function(feedId, line, res) {

  // console.log(`getting stops for ${feedId}`);
  fs.readFile(`StaticData/FullSimple.json`, 'utf-8', function(err, result) {
    let stops = JSON.parse(result);
    // console.log(`readFile complete`);
    // console.log(stops[`line${line}`]);
    return res.render('line', {
      line: line,
      stops: stops[`line${line}`],
      feedId: feedId,
      tempLogin: tempLogin
    });
  })

}


// route to call Line page w/ stops
app.get('/lines/:line', (req, res) => {
  var line = req.params.line;

  // references a swtch case for parsing feeds that correspond do specific lines
  var feedId = getFeed.getFeedId(line);

  if (req.user) {
    tempLogin = req.user.username
  }

  getStops(feedId, line, res);


});

app.get('/stops/:stop&:feedId&:stationName', (req, res) => {
  // let lineInt = (parseInt(req.params.line[4]) - 1);
  // console.log(req.params.feedId);
  // console.log(req.params.stop);

  var thisStop = req.params.stop.toString();
  var thisFeed = req.params.feedId.toString();
  var stationName = req.params.stationName.split('+').join(' ');

  // Get the stop and line from req params and use them to plug in the correct datapoint in the stops.json
  // data file. Use the data-tester to make a dictionary, use dictionary as href and call the stop.

  mta.schedule(thisStop, thisFeed).then(function(result) {

    if (Object.keys(result).length === 0) {
      console.log('no data');
      return res.render('stopError', {
        errorReport: 'Alas! No times are available',
        stop: thisStop,
        tempLogin: username
      });
    }

    // Parseing agent for times and Northbound/Southbound differentiation

    let station = stopFetch.fetch(thisStop, thisFeed, result);
    station.name = stationName;

    if (req.user) {
      var username = req.user.username;
    } else {
      var username = '';
    }
    return res.render('stop', {
      errorReport: '',
      station: station,
      stop: thisStop,
      feed: thisFeed,
      username: username,
      tempLogin: username
    });
  }).catch(x => console.log(x));



});


// route for registration page
app.get('/register', (req, res) => {
  res.render('register', {
    tempLogin
  });
});

app.post('/register', (req, res) => {
  User.create({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    favorites: '{ "favorites": [] }'

  }).then(x => {
    res.redirect(`/confirmation/${req.body.username}&${req.body.password}`);
  })
});

app.get('/confirmation/:username&:password', (req, res) => {
  res.render('confirmation', {
    username: req.params.username,
    password: req.params.password,
    tempLogin: tempLogin
  });
});

app.post('/confirmation', passport.authenticate('local', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.render('login', {
    tempLogin
  });
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  tempLogin = '';
  req.logout();
  res.redirect('/');
});

app.post('/favorite', (req, res) => {

  if (!req.user) {
    return res.redirect('/login');
  }

  User.findOne({
    where: {
      username: {
        $iLike: `${req.body.username}`
      }
    }
  }).then(user => {
    console.log('----------------------------------- favs ------------------------------------');
    console.log(user.dataValues.favorites);
    var favs = JSON.parse(user.dataValues.favorites);
    if (!Object.keys(favs.favorites).includes(req.body.stopId)) {
      let newFav = {};
      newFav.stopId = req.body.stopId;
      newFav.feedId = req.body.feedId;
      newFav.stationName = req.body.stationName
      favs.favorites.push(newFav);
      console.log(favs);
      console.log('^ ---------- favs pre-join --------- ^');
      favs = JSON.stringify(favs);
      console.log(favs);
      console.log('^ ---------- favs post-join --------- ^');
      user.updateAttributes({
        favorites: favs
      }).then(user => {
        return res.redirect('/');
      });
    }
  });
})

app.listen(8080, function(err) {
  if (err) throw err;
  console.log('server');
});
