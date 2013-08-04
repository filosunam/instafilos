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

  // compile css
  app.use(require('less-middleware')({
    src: __dirname + '/public',
    yuicompress: true
  }));

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

  // socket.io
  io.sockets.on('connection', function (socket) {

    var bulk = [];
    
    // search locations around the school
    socket.on('bulk', function(data){    

      ig.locations.search({
          lat: 19.3341866760000001
        , lng: -99.186748266000001
        , complete: function(data){
            data.forEach(function(location){
              getImagesFromLocation(location, data);
            });
          }
      });

    });

    var getImagesFromLocation = function(location, data){
      var options = { 
          location_id: location.id
        , max_id: data.max
        , count: 25
        , complete: function(data, resource){
            bulk.push({
                data: data
              , resource: resource
            });
            socket.emit('recents', bulk);
          }
      };

      // pagination
      if(data.max_id) {
        options.max_id = data.max_id;
      }

      // send images
      return ig.locations.recent(options);
    };

  });

});