/* Intro:
 *   - how large is your drone?
 *   - how do you plan to use it? (commercial/recreational)
 *   - in which states do you plan on flying?
 */
function move(relative) {
  return function(opt) {
    var $cur = $("#slides>.active");
    var $new = relative($cur, opt);
    if ($new.length > 0) {
      $cur.removeClass('active').addClass('out');
      $new.removeClass('out').addClass('active').scrollTop(0);
      var slideHandler = slides[$new.attr('id')];

      //run one-time setup
      if (!$new.is('.init')) {
          $new.find('.next').click(slides.nav.next);
          $new.find('.back').click(slides.nav.prev);
          $new.find('.row-select>div').click(function() {
            $(this).addClass('selected').siblings().removeClass('selected');
            if (slideHandler && 'select' in slideHandler) {
              slideHandler.select.apply(this);
            }
          });
        if (slideHandler && 'init' in slideHandler) {
          slideHandler.init();
        }
        $new.addClass('init');
      }
      if (slideHandler && 'active' in slideHandler) {
        slideHandler.active();
      }

      //highlight tab at top 
      $("#progress>div").removeClass('active');
      $("#progress>div[data-dest='"+$new.attr('id')+"']").addClass('active');

      //
      if ($new.is('.directions')) {
        var optional = $('#step-list>li[data-dest="'+$new.attr('id')+'"]').is('.opt');
        $new.children('.warning').remove();
        $('<div></div>')
          .addClass('warning')
          .addClass(optional ? 'green' : 'yellow')
          .html(
            'You ' + (optional ? 'do <b>not</b>' : '') + 
            ' need to complete this section, based ' + 
            'on the information you provided.'
           )
          .insertAfter($new.children('h2:first-child'));
      }

      setTimeout(function() {
        $cur.removeClass('out');
      }, 1000);
    }
  }
};
function getValue(id) {
  return $("#"+id+" .selected").attr('data-val');
}

var slides = {
  nav : { // navigation object
    next : move(function($cur, opt) { return $cur.next(); }),
    prev : move(function($cur, opt) { return $cur.prev(); }),
    to : move(function($cur, opt) { return $("#slides>#"+opt); }),
    begin : function() {
      $("#container").removeClass('intro');
      slides.nav.to('size');
    }
  },
  size : {
    init : function() {
      $("#size>.row>div").click(function() {
        slides.nav.next();
      });
    }
  },
  map : {
    obj : null,
    selectedStates: null,
    init : function() {
      var map = new AmCharts.AmMap();
      slides.map.obj = map;
      map.pathToImages = "http://www.amcharts.com/lib/3/images/";
      map.panEventsEnabled = true;
      map.backgroundColor = "#FFF";
      map.backgroundAlpha = 0;
      
      map.zoomControl.panControlEnabled = false;
      map.zoomControl.zoomControlEnabled = true;
      
      var dataProvider = {
      map: "usaLow",
          getAreasFromMap: true
      };
      map.dataProvider = dataProvider;
      map.areasSettings = {
          autoZoom: false,
          color: "#CDCDCD",
          colorSolid: "#5EB7DE",
          selectedColor: "#5EB7DE",
          outlineColor: "#666666",
          rollOverColor: "#88CAE7",
          rollOverOutlineColor: "#FFFFFF",
          selectable: true
      };
      map.addListener('clickMapObject', function (event) {
          map.selectedObject = map.dataProvider;
          event.mapObject.showAsSelected = !event.mapObject.showAsSelected;
          map.returnInitialColor(event.mapObject);
      });
      map.write("usa");
    },
    submit : function() {
      var map = slides.map.obj;
      var states = map.dataProvider.areas
        .filter(function(area) {
          return area.showAsSelected;
        })
        .map(function(area) { return area.id; });
      slides.map.selectedStates = states;
      slides.nav.next();
      /**
      * Prevent form from actually submitting.
      * We probably don't want it in real life situations.
      */
      return false;
    }
  },
  usage : {
    select : function() {
      slides.nav.next();
    }
  },
  info : {
    select : function() {
      if ($("#info .row-select>div.selected").length > 2) {
        slides.nav.next();
      }
    }
  },
  menu : {
    init : function() {
      $("#step-list>li, #progress>div").click(function() {
        slides.nav.to($(this).attr('data-dest'));
      });
      $("#progress").removeClass('hidden');
    },
    active : function() {
      var opt = {
        droneSize: getValue('size'), //small, medium, large
        states: slides.map.selectedStates, //[US-ID, ...]
        usage: getValue('usage'), //rec, com, both
        citizenStatus: getValue('citizen-status'), //full, trustee, none
        outside: getValue('outside'), //no, na, ww
        above400: getValue('above-400') //no, yes
      };

      var online = (opt.droneSize != 'small');
      var nPaper = (opt.droneSize=='large') || (opt.outside!='no') || (opt.citizenStatus=='trustee');
      var sec333 = nPaper || (opt.usage!='rec');
      var faaPil = sec333 || (opt.above400=='yes');

      $("#step-list>li").removeClass('opt');
      if (!online) $("#step-list>li:nth-child(1)").addClass('opt');
      if (!nPaper) $("#step-list>li:nth-child(2)").addClass('opt');
      if (!sec333) $("#step-list>li:nth-child(3)").addClass('opt');
      if (!faaPil) $("#step-list>li:nth-child(4)").addClass('opt');
      if (opt.citizenStatus!='none')
                   $("#step-list>li:nth-child(5)").addClass('opt');

    },
    go : function() { //called to begin process
      var $nextStep = $("#step-list>li").not('.opt').first();
      if ($nextStep.length > 0) {
        slides.nav.to($nextStep.attr('data-dest'));
      } else {
        alert('You have no required steps! You are ready to fly. If you would like to register anyway, please click a step on the left.');
      }
    }
  },
  'faa-online-1': {
    active : function() {
      var rec =(getValue('usage')=='rec');
      $("#account-type-info").html( 
        'You selected that you will use the drone <b>' + 
          (rec ? 'recreationally' : 'commercially') + 
        '</b>, so select "' + 
        (rec ? 'Model Aircraft' : 'Non-Model Aircraft') + 
        '" at the next page when it asks for your account type.'
      );
    }
  }
}
$(function() {
  $("#sidebar>.intro>.nav>div").addClass('opaque').removeClass('translucent');
});