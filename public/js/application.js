$(function(){

  var imagesModel = new function(){

    var self = this;

    self.images       = ko.observableArray();
    self.max          = ko.observable(0);
    this.value        = ko.observable(0);
    self.next_max_id  = ko.observable();
    self.percent      = ko.dependentObservable(function(){
      var p = ( (self.value() * 100) / self.max() ).toFixed(0);

      if(p == 100) {
        $('.progress').hide();
        $('.btn-center').show();
      }

      return p;
    });
    self.init = function() {
      var i         = 0
        , busy      = false
        , processor = setInterval(function() {

            if (!busy) {
                busy = true;

                self.value(i);

                if (i++ == self.max()) {
                  clearInterval(processor);
                }

                busy = false;
            }

          }, 1);
    };

  };

  ko.applyBindings(imagesModel);

  socket.on('recents', function(res) {

    imagesModel.max(res.data.length);
    imagesModel.next_max_id(res.resource.next_max_id);
    console.log(res);

    $.each(res.data, function(index, value){
      imagesModel.images.push( value );
    });

    imagesModel.init();

    // cloud
    $('#cloud img')
    .sort(function() { return 0.5 - Math.random(); })
    .each(function(index) {
      if( this.complete && index < 20) {
        
        var cloud   = $('#cloud')
          , cloud_w = cloud.width()
          , cloud_h = cloud.height()
          , image_w = $(this).width()
          , image_h = $(this).height();

        var posx = ( Math.random() * (cloud_w - image_w ) + 1 ).toFixed();
        var posy = ( Math.random() * (cloud_h - image_h ) + 1 ).toFixed();

        $(this).css({
          'left'    : posx +'px',
          'top'     : posy +'px',
          'display' : 'none'
        }).fadeIn(Math.floor(Math.random() * 1500));

      }
    });

  });

  $('#more').click(function(e){
    e.preventDefault();
    $('.progress').show();
    socket.emit('more', { 
      max_id: $(this).attr('data-max-id')
    });
  });

});
