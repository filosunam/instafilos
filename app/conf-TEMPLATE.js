define(function() {

  var enviroment
    , development
    , production;

  development = {
      server: {
        port: 3000
      }
    , instagram: {
          client_id: ''
        , client_secret: ''
      }
  };

  production = development;

  if( 'production' === process.env.NODE_ENV ){
    enviroment = production;
  } else {
    enviroment = development;
  }

  return enviroment;

});