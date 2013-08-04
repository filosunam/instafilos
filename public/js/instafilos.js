$(function(){

  var imagesModel = new function(){

    var self = this;

    self.images       = ko.observableArray();
    /*self.max          = ko.observable(0);
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
    */

  };



  ko.applyBindings(imagesModel);

  socket.on('recents', function(res) {
    
    //imagesModel.max(res.data.length);
    //imagesModel.next_max_id(res.resource.next_max_id);

    var images = [];

    $.each(res, function(index, bulk){
      if( bulk.data.length > 0 ) {
        $.each(bulk.data, function(i, image){
          images.push(image);
          images.sort(function(a, b){
            return b.created_time - a.created_time;
          });
          imagesModel.images(images);
        });
      }
    });
    
    //imagesModel.init();
    $('#more').hide();

  });

  $('#more').click(function(e){
    e.preventDefault();
    $('#cloud').hide();
    $('#progress.progress').show();
    
    socket.emit('bulk', {
      /*max_id: $(this).attr('data-max-id')*/
    });
  });

});
