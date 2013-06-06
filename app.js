var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require
  , baseUrl: __dirname + '/app'
});

requirejs(['conf', 'express'], function(conf, express){

  var app     = express()
    , server  = app.listen(process.env.PORT || conf.server.port)
    , io      = require('socket.io').listen(server)
    , ig      = require('instagram-node-lib')
    , _       = require('underscore');

  // set config instafilos app
  ig.set('client_id', conf.instagram.client_id);
  ig.set('client_secret', conf.instagram.client_secret);

  // configuration
  app.configure(function(){
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'instafilos cat' }));
    app.use(express.session({ cookie: { maxAge: 60000 }}));
  });

  // static files
  app.use(express.static(__dirname + '/public'));

  // template engine
  app.set("view engine", "html");
  app.set('views', __dirname + '/app/views');
  app.set('layout', 'layout');
  app.engine('html', require('hogan-express'));
  app.enable('view cache');

  app.use(function(req, res, next) {
    res.locals.url = req.protocol + "://" + req.get('host');
    next();
  });

  // routes
  app.get('/', function(req, res){
    res.render('index');
  });

  app.get('/show', function(req, res){
    res.render('show');
  });

  // socket.io
  io.sockets.on('connection', function (socket) {

    var images    = []
      , locations = [];

    // search locations around the school
    ig.locations.search({
        lat: 19.3341866760000001
      , lng: -99.186748266000001
      , complete: function(data, resource){
          // for each location ID
          data.forEach(function(location, index){
            
            getImagesFromLocation(location, index, data);

          });
        }
    });

    var getImagesFromLocation = function(location, index, data){

      ig.locations.recent({
          location_id: location.id
        , max_id: location.max_id
        , complete: function(d, r){

            // for push more images to browser
            locations.push({
                location: location
              , max_id: r.next_max_id
            });

            // for each bulk of images
            d.forEach(function(image, i){

              // push to all images
              images.push(image);
              
              if (index === data.length - 1 && i === d.length - 1) {
                
                // sort by date descending
                images  = _.sortBy(images, 'created_time').reverse();

                // push images to browser
                socket.emit('recents', {
                    data: images
                  , locations: locations
                });

                console.log('Send images:', images.length);

              }

            });
          }
      });
    };


    // send more images, push, push, push...
    socket.on('more', function(data) {

      /*
      data = data.max_ids.split(',');
      data.forEach(function(location, index){
        location = location.split(':');
        location = {
            id     : location[0]
          , max_id : location[1]
        };
        console.log(location);
        getImagesFromLocation(location, index, data);
      
      });
      */

    });

  });

});