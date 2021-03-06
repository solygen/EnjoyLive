'use strict';

var cache = new LastFMCache();

/* Create a LastFM object: keys defined in config.js */
var lastfm = new LastFM({
    apiKey        : apiKey,
    apiSecret : apiSecret,
    cache         : cache
});

var events, node, contentnode = $(document.body).find('.row');

var util = {
    toIso: function (date) {
        var dd = date.getDate(),
            mm = date.getMonth() + 1,
            yyyy = date.getFullYear();
        //leading zero
        dd = dd < 10 ? '0' + dd : dd;
        mm = mm < 10 ? '0' + mm : mm;
        return yyyy + '-' + mm + '-' + dd;
    },

    getEventObject: function (event) {
        if (event.artists.artist) {
            $(node.find('p')[0]).append(
                util.toIso(new Date(event.startDate))
                + ': '
                + '<a href = "' + event.url + '">'
                + [].concat(event.artists.artist).join(', ')
                + '</a>'
                + '<br>');

            return {
                eventid: event.id,
                artists: event.artists,
                venueid: event.venue.id,
                venuelabel: event.venue.name + event.venue.location.postalcode + event.venue.location.city,
                venuecity: event.venue.location.city,
                date: event.startDate,
                day: event.startDate, //mapping wochentag
                attendance: event.attendance,
                attendees: '' //event.getAttendees
            }
        }
        return {};
    },

    getNode: function () {
        //return $('<div class="span4"><h2>Heading</h2><p></p><p><a class="btn" href="#">View details &raquo;</a></p></div>')
        return $('<div class="span4"><h2>Heading</h2><p></p></div>')
    },

    getDefaultVenues: function () {
        return {
            cologne: ['8778655',    //Underground
                      '8787338',    //E-Werk
                      '8778353',    //Live Music Hall
                      '8852183',    //Sonic Ballroom
                      '8780273',    //MTC
                      '8850228'],   //Essigfabrik
            siegen: ['8781504',     //Vortex
                     '8781389',     //BlueBox
                     '8870288',     //LYZ
                     '8825365',     //VEB
                     '8782593',     //meyer
                     '8829101',     //Kultkaff
                     '9088822',     //Burger King
                     '8917754',     //Shamrock
                     '8804055'],    //Casablanca
            olpe: ['8782682',       //OT
                   '8918880',       //Mythos
                   '8915189',       //Villa
                   '9068483',       //Pub
                   '8999095',       //Biggepavilion
                   '8915220',       //Stadthalle
                   '8915442',       //Marktplatz
                   '8916590',       //OT Grevenbrück
                   '8782130',       //Stadtschänke
                   '9005541',       //Old Mill
                   '8929879',       //KOT Wenden
                   '8819113',       //Noisebox
                   '8865281',       //Stadthalle Attendorn
                   '8918826',       //Blaues Haus
                   '8785391'],      //Alte Druckerei
            bochum: ['8779889',     //Matrix
                     '8795925']     //Bahnhof Langendreer
        }
    }
};

//api wrapper
var wrapper = {
    getEvents: function (venue) {
        return lastfm.venue.getEvents({ venue: venue});
    }
};

//main
var render = function (venues) {
  //render
  contentnode.empty();
  _.each(venues, function (id) {
      wrapper.getEvents(id)
          .done(function(data) {
              //any events for this venue?
              if (data.events['@attr']) {
                  //ensure array
                  var event = [].concat(data.events.event)
                  //output node
                  node = util.getNode();
                  node.find('h2')
                    .html('<i class="icon-bullseye">' + '&nbsp;' + data.events['@attr'].venue + '</i>');
                  events = _.map(event, util.getEventObject); //also add artist to node
                  //dom append and draw
                  contentnode.append(node);
              }
          });
  })
}


var navigate = function () {
    if (location.hash.substr(0, 1) === '#' && location.hash.length > 1) {
        //hash to numeric
        var isNumber = location.hash.substr(1).replace(/[0-9,]/g, '') === '';
        //render
        if (isNumber) {
            render(location.hash.substr(1).split(','));
        }
        else if (util.getDefaultVenues()[location.hash.substr(1)]) {
            location.hash = '#' + util.getDefaultVenues()[location.hash.substr(1)];
        }
        else {
          render();
        }
    } else {
        //use default locations instead
        location.hash = '#' + (_.flatten(util.getDefaultVenues()).join(','))
    }
};
window.onhashchange = navigate;
navigate();
