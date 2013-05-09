var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require
  , baseUrl: __dirname + '/app'
});

requirejs(['conf', 'express'], function(conf, express){

  var app     = express()
    , server  = app.listen(process.env.PORT || conf.server.port)
    , io      = require('socket.io').listen(server)
    , ig      = require('instagram-node-lib');

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

    // send images
    ig.locations.recent({ 
        location_id: 1167187
      , count: 100
      , complete: function(data, resource){
          socket.emit('recents', {
              data: data
            , resource: resource
          });
        }
    });

    // send more images, push, push, push...
    socket.on('more', function(data) {
      ig.locations.recent({
        location_id: 1167187
      , count: 100
      , max_id: data.max_id
      , complete: function(data, resource){
          socket.emit('recents', {
              data: data
            , resource: resource
          });
          console.log('Send data:', data.length);
        }
      });
    });

  });

});