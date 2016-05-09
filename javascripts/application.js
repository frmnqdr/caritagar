var Instagram = {};
var tags;

Instagram.Config = {
  clientID: 'ClientID',
  apiHost: 'https://api.instagram.com'
};

(function(){
  var photoTemplate, resource;

  function init(){
    bindEventHandlers();
    photoTemplate = _.template($('#photo-template').html());
  }

  function toTemplate(photo){
    photo = {
      count: photo.likes.count,
      avatar: photo.user.profile_picture,
      photo: photo.images.low_resolution.url,
      url: photo.link
    };

    return photoTemplate(photo);
  }

  function toScreen(photos){
    var photos_html = '';
    $('.paginate a').attr('data-max-tag-id', photos.pagination.next_max_id)
                    .fadeIn();

    $.each(photos.data, function(index, photo){
      var tempStorages = [];
      var flag = true;
      $.each(tags, function(index, val) {
        if(photo.tags.indexOf(val) < 0)
          flag = false;
      });
      if(localStorage.getItem('datas') === null ){
        
      }else{
        tempStorages = JSON.parse(localStorage.getItem('datas'));
        $.each(tempStorages, function(index, tempStorage){
          if(tempStorage.id == photo.id)
            flag = false;
        });   
      }
      if(flag){
        var data = {};
        data.id = photo.id;
        data.url = photo.images.low_resolution.url;
        data.tags = photo.tags;
        data.username = photo.user.username;
        data.fullname = photo.user.full_name;
        try{
          data.decription = photo.caption.text;
        }catch(e){
          data.decription = "";
        }
        tempStorages.push(data);
        photos_html += toTemplate(photo);
      }
      localStorage.setItem("datas",JSON.stringify(tempStorages));
    });

    $('div#photos-wrap').append(photos_html);
  }

  function generateResource(tag){
    var config = Instagram.Config, url;

    if(typeof tag === 'undefined'){
      throw new Error("Resource requires a tag. Try searching for cats.");
    } else {
      // Make sure tag is a string, trim any trailing/leading whitespace and take only the first 
      // word, if there are multiple.
      tag = String(tag).trim().split(" ")[0];
    }

    url = config.apiHost + "/v1/tags/" + tag + "/media/recent?callback=?&client_id=" + config.clientID;
    return function(max_id){
      var next_page;
      if(typeof max_id === 'string' && max_id.trim() !== '') {
        next_page = url + "&max_id=" + max_id;
      }
      return next_page || url;
    };
  }

  function paginate(max_id){    
    $.getJSON(generateUrl(tag), toScreen);
  }

  function search(tag){
    localStorage.clear();
    tags = tag.split(' ');
    $.each(tags, function(index, val) {
      resource = generateResource(val); 
      $('.paginate a').hide();
      $('#photos-wrap *').remove();
      fetchPhotos();
    });
  }

  function fetchPhotos(max_id){
    $.getJSON(resource(max_id), toScreen);
  }

  function bindEventHandlers(){
    $('body').on('click', '.paginate a.btn', function(){
      var tagID = $(this).attr('data-max-tag-id');
      fetchPhotos(tagID);
      return false;
    });

    // Bind an event handler to the `submit` event on the form
    $('form').on('submit', function(e){

      // Stop the form from fulfilling its destinty.
      e.preventDefault();

      // Extract the value of the search input text field.
      var tag = $('input.search-tag').val().trim();

      // Invoke `search`, passing `tag` (unless tag is an empty string).
      if(tag) {
        search(tag);
      };

    });

  }

  function showPhoto(p){
    $(p).fadeIn();
  }

  // Public API
  Instagram.App = {
    search: search,
    showPhoto: showPhoto,
    init: init
  };
}());

$(function(){
  Instagram.App.init();
});

