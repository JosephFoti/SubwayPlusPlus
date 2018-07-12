// NOTE NOTE NOTE  Test case for simple scrape data

const ejs = require('ejs')
const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize')
const passport = require('passport');
const {Client} = require('pg')
const Strategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');

const app = express();

const stopFetch = require('./components/stopFetch.js');
const getFeed = require('./components/getFeed.js');
const getFavs = require('./components/getFavTimes.js');
const getService = require('./components/getService.js');


const dotenv = require('dotenv');
const result = dotenv.config();

const flash = require('connect-flash');
app.use(flash());

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000


const Op = Sequelize.Op
const sequelize = new Sequelize(process.env.DATABASE_URL,  {
// const sequelize = new Sequelize('barkspace', 'postgres', 'Giraffes94', {

	logging: true,
	ssl: true,
	dialect: 'postgres',
	protocol: 'postgres',
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

const User = sequelize.define('user', {

  username: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  favorites: Sequelize.JSON

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
var dataPull;

// Home route displaying lines and user defined favoried stops
app.get('/', (req, res) => {

  tempLogin = ''

  if (req.user) {

    tempLogin = req.user.username;

    // Sets continuous time updates for favorites
    dataPull = setInterval(function() {
      getFavs.getFavs(req);
    }, 15000);

    // Session killer after 10 minutes
    setTimeout(function() {
      clearInterval(dataPull);
    }, 600000);

    let data = JSON.parse(req.user.favorites);
    let favs = data.favorites;

    // fetches the time information for user's selected favorites
    // and pushes them to a public data file for that user
    getFavs.getFavs(req);

    getService.status(favs,tempLogin);

    return res.render('home', {
      favs: favs,
      lineNames: lineNames,
      tempLogin: tempLogin
    });

  }
  return res.render('home', {
    lineNames: lineNames,
    tempLogin: tempLogin,
    favs: false
  });
});


// Line page with designated line as parameter
app.get('/lines/:line', (req, res) => {
  var line = req.params.line;

  // references a swtch case for parsing the MTA feeds that correspond with
  // specific lines.
  var feedId = getFeed.getFeedId(line);

  if (req.user) {
    tempLogin = req.user.username
  }

  getStops(feedId, line, res);

});


// Reads JSON file with the lists of stopIds and station names.
// On completion renders the line page
var getStops = function(feedId, line, res) {

  fs.readFile(`StaticData/FullSimple.json`, 'utf-8', function(err, result) {
    let stops = JSON.parse(result);

    return res.render('line', {
      line: line,
      stops: stops[`line${line}`],
      feedId: feedId,
      tempLogin: tempLogin
    });
  });

}


app.get('/stops/:stop&:feedId&:stationName&:line', (req, res) => {

  if (req.user) {
    var username = req.user.username;
  } else {
    var username = '';
  }

  let thisLine = req.params.line.toString();
  let thisStop = req.params.stop.toString();
  let thisFeed = req.params.feedId.toString();
  let stationName = req.params.stationName.split('+').join(' ');

  // Get the stop and line from req params and use them to plug in the correct datapoint in the stops.json
  // data file. Use the data-tester to make a dictionary, use dictionary as href and call the stop.

  mta.schedule(thisStop, thisFeed).then(function(result) {

    if (Object.keys(result).length === 0) {
      console.log('no data');

      return res.render('stop', {
        errorReport: 'Alas! No times are available',
        stationName: stationName,
        stop: thisStop,
        feed: thisFeed,
        line: thisLine,
        username: username,
        tempLogin: username
      });
    }

    // Parses the MTA data into readable time estimates and collects information
    // on the train type. Arbitrarily limited to three results right now.

    let station = stopFetch.fetch(thisStop, thisFeed, result);
    station.name = stationName;

    return res.render('stop', {

      errorReport: '',
      station: station,
      stationName: stationName,
      stop: thisStop,
      feed: thisFeed,
      line: thisLine,
      username: username,
      tempLogin: username

    });
  }).catch(x => console.log(x));



});


// route for registration page
app.get('/register', (req, res) => {

  tempLogin = '';

  res.render('register', {
    tempLogin:tempLogin,
    errMsg: ''
  });

});

app.post('/register', (req, res) => {

  // A few small checks for data consistancy and error parseing
  let username = req.body.username;
  let specialCharacters = /\W|_/g

  if (specialCharacters.test(username)) {
    return res.render('register',{errMsg:'Special characters and spaces are not allowed in the username.'});
  }

  if (req.body.password !== req.body.password2) {
    return res.render('register',{errMsg:'Password confirmation did not match original'});
  }

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

app.post('/confirmation', passport.authenticate('local', { failureRedirect: '/login'}), (req, res) => {

  // Confirmation page functions as an intermediate step between new user
  // creation and login. I couldn't think of a way to do it on one page, so I
  // made it two. Unfortunately it is reletively unsafe without password
  // encryption.

  res.redirect('/');

});

app.get('/login', (req, res) => {

  let tempLogin = ''
  let errMsg = ''

  // Package for storing cookies quickly?
  var errors = req.flash();

  if (errors.error) {
    errMsg = errors.error[0];
  }

  res.render('login', {
    tempLogin:tempLogin,
    errMsg: errMsg
  });

});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Invalid username or password.'
}), (req, res) => {

  // Credetials are validated in the passport strategy defined earlier in the app.js
  res.redirect('/');

});

app.get('/logout', (req, res) => {

  tempLogin = req.user.username;

  // Delete static data jsons on logout or window close.
  if (fs.existsSync(`./public/data/${tempLogin}_favoriteStopTimes.json`)) {
    fs.unlinkSync(`./public/data/${tempLogin}_favoriteStopTimes.json`);
  }

  tempLogin = '';
  req.logout();
  res.redirect('/');

});

// Route for adding favorites to user accounts where data is stored in a JSON.
// pg database serves as permanent storage, temp jsons are made per user to store
// time data and pass it from persistant server refreshes to ajax calls from the
// client.

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
    console.log('----------------------------------- Creating new Favorite ------------------------------------');
    var favs = JSON.parse(user.dataValues.favorites);
    if (!Object.keys(favs.favorites).includes(req.body.stopId)) {
      let newFav = {};
      newFav.stopId = req.body.stopId;
      newFav.feedId = req.body.feedId;
      newFav.line = req.body.line;
      newFav.stationName = req.body.stationName;
      favs.favorites.push(newFav);
      favs = JSON.stringify(favs);
      console.log(favs);
      console.log('^ ---------- favs post-join --------- ^');

      // write to database for persistance
      user.updateAttributes({
        favorites: favs
      }).then(user => {

        // write static file for client reference
        fs.writeFile(`./public/data/${tempLogin}_favoriteStopTimes.json`, favs, (err) => {
          console.log('-------------------------------------- New Static file for user '+ tempLogin +' for new favoirte ------------------------------------------');
          if (err) {
            console.log(err);
          }
          return res.redirect('/');
        });
      });
    }
  });
});

// Get index of favorite and splice it out of array of favorites, and then modify
// the user data.

app.post('/remove',(req,res)=>{
  tempLogin = req.body.username;
  favIndex = req.body.favIndex;

  User.findOne({
    where: {
      username: {
        $iLike: req.body.username
      }
    }
  }).then(user=>{
    var oldFavorites = JSON.parse(user.dataValues.favorites);
    console.log(oldFavorites.favorites[favIndex]);
    oldFavorites.favorites.splice(favIndex,1);
    var newFavorites = oldFavorites

    user.updateAttributes({

      favorites: JSON.stringify(newFavorites)

    }).then(()=>{

      fs.writeFile(`./public/data/${tempLogin}_favoriteStopTimes.json`, JSON.stringify(newFavorites), (err) => {
        console.log('-------------------------------------- New Static file for user '+ tempLogin +' without erased favoirte ------------------------------------------');
        if (err) {
          console.log(err);
        }
        return res.redirect('/');
      });

    })
  })

});

app.get('/get-stops',(req,res)=>{

  // Full stop data for favorite selector
  let stops = fs.readFileSync(`StaticData/FullSimple.json`, 'utf-8', function(err, result) { return result });

  res.send(stops);

});

app.post('/favorite-select',(req,res)=>{

  let line = req.body.line;
  let stopInfo = req.body.stops;
  stopInfo = stopInfo.split(',');
  let stopId = stopInfo[0];
  let stopName = stopInfo[1].split('%20').join(' ');
  let username = req.user.username;
  let feedId = getFeed.getFeedId(line).toString();

  let newFav = {
    stopId: stopId,
    feedId: feedId,
    line: line,
    stationName: stopName
  }

  User.findOne({
    where: {
      username: {
        $iLike: username
      }
    }
  }).then(user=>{
    let oldFavorites = user.dataValues.favorites;
    newFavorites = JSON.parse(oldFavorites);
    newFavorites.favorites.push(newFav);
    user.updateAttributes({
      favorites: JSON.stringify(newFavorites)
    }).then(()=>{

      if (req.headers.referer.split('/').includes('profile')) {
        res.redirect(`/profile/${req.user.username}`);
      } else {
        res.redirect('/');
      }

    })

  })
})

// A post that should kill the interval that continuously pulls data for the
// homepage/favorites section
app.post('/stopData', (req, res) => {

  console.log('Clear Interval post called');
  clearInterval(dataPull);

});

app.get('/profile/:username', require('connect-ensure-login').ensureLoggedIn('/login'), (req,res)=>{

  // get favs, list them in a container to be organized.

  favorites = JSON.parse(req.user.favorites);

  res.render('profile', {tempLogin:req.user.username,lineNames:lineNames, favorites:favorites.favorites});

});

app.post('/edit',(req,res)=>{
  // Gets an array with the order of the re-arranged stops and maps a new
  // array of favorite values to sortedFavs. Then we find the user's profile in
  // postgress and update the order. NOTE need to update the static file.

  let order = req.body['order[]'];
  let favorites = JSON.parse(req.user.favorites);

  let sortedFavs = order.map((x,i)=>{
    for (favorite of favorites.favorites) {
      if (favorite.stopId === x) {
        return favorite;
      }
    }
  });

  let newData = {favorites:sortedFavs}

  User.findOne({
    where:{
      username:{
        $like:req.user.username
      }
    }
  }).then(user=>{
    user.updateAttributes({
      favorites: JSON.stringify(newData)
    }).then(x=>{
      console.log('favorite data updated to');
      console.log(x);
    })
  })

  console.log(order);
  console.log(sortedFavs);
})

// NOTE: Always check the PORT
app.listen(PORT, function(err) {
  if (err) throw err;
  console.log('Subway++ is here!');
});
