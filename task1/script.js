var ICONS = { phone: '📱', glasses: '👓', bag: '👜', cup: '☕', crumbs: '🍰' };
var MIRAS = { name: 'Miras', color: 'blue', time: '21:20', aitu: true, things: ['phone'] };

function toMin(t) {
  var p = t.split(':');
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}

function makeCard(g, room) {
  var classes = ['guest', g.color, g.aitu ? 'aitu' : 'not-aitu'].concat(g.things).join(' ');
  var $card = $('<div>').addClass(classes).attr({
    'data-name': g.name,
    'data-color': g.color,
    'data-time': g.time,
    'data-min': toMin(g.time),
    'data-aitu': String(g.aitu),
    'data-things': g.things.join(','),
    'data-room': room.id,
    'data-floor': room.floor
  });
  var $avatar = $('<img class="avatar">')
    .attr('alt', g.name)
    .attr('src', 'https://api.dicebear.com/9.x/open-peeps/svg?seed=' + encodeURIComponent(g.seed || g.name));
  var $ring = $('<div class="ring">').append($avatar);
  if (g.aitu) {
    $ring.append($('<span class="badge">').text('🎓'));
  }
  var $things = $('<div class="things">');
  $.each(g.things, function (i, t) {
    $things.append($('<span class="thing">').text(ICONS[t]));
  });
  return $card.append($ring, $('<div class="name">').text(g.name), $('<div class="time">').text('◷ ' + g.time), $things);
}

function buildParty() {
  $('#house *').stop(true);
  var $house = $('#house').empty();
  $.each([2, 1], function (i, floor) {
    var $rooms = $('<div class="rooms">');
    $.each(party, function (j, room) {
      if (room.floor !== floor) return;
      var $guests = $('<div class="guests">');
      $.each(room.guests, function (k, g) {
        $guests.append(makeCard(g, room));
      });
      $rooms.append(
        $('<div class="room">')
          .attr({ 'data-room': room.id, 'data-name': room.name, 'data-floor': room.floor })
          .append($('<h3>').text(room.name), $guests)
      );
    });
    $house.append(
      $('<div class="floor">').attr('data-floor', floor).append($('<div class="floor-label">').text('FLOOR ' + floor), $rooms)
    );
  });
}

var cases = [
  { n: 1, kind: 'guests', label: 'In the hall', title: 'Who is in the hall?',
    run: function () {
      return $('.room[data-room="hall"] .guest');
    } },
  { n: 2, kind: 'guests', label: 'Yellow or purple', title: 'Who is dressed in yellow or purple?',
    run: function () {
      return $('.guest[data-color="yellow"]').add('.guest[data-color="purple"]');
    } },
  { n: 3, kind: 'guests', label: 'AITU upstairs', title: 'Which AITU students are upstairs?',
    run: function () {
      return $('.floor[data-floor="2"] .guest.aitu');
    } },
  { n: 4, kind: 'guests', label: 'Glasses or bag', title: 'Who has glasses or a bag?',
    run: function () {
      return $('.guest.glasses').add('.guest.bag');
    } },
  { n: 5, kind: 'guests', label: 'Nothing at all', title: 'Who came with nothing at all?',
    run: function () {
      return $('.guest:not(.phone):not(.glasses):not(.bag):not(.cup):not(.crumbs)');
    } },
  { n: 6, kind: 'guests', label: 'Phone, no bag', title: 'Who has a phone but no bag?',
    run: function () {
      return $('.guest.phone:not(.bag)');
    } },
  { n: 7, kind: 'guests', label: '20:30 – 21:00', title: 'Who arrived between 20:30 and 21:00, both times included?',
    run: function () {
      return $('.guest').filter(function () {
        var m = $(this).data('min');
        return m >= 20 * 60 + 30 && m <= 21 * 60;
      });
    } },
  { n: 8, kind: 'guests', label: 'After 21:00, not AITU', title: 'Who arrived after 21:00 and is not an AITU student?',
    run: function () {
      return $('.guest.not-aitu').filter(function () {
        return $(this).data('min') > 21 * 60;
      });
    } },
  { n: 9, kind: 'guests', label: 'Next to Askar', title: 'Who stands right next to Askar?',
    run: function () {
      return $('.guest[data-name="Askar"]').prev().add('.guest[data-name="Askar"] + .guest');
    } },
  { n: 10, kind: 'guests', label: 'Last in room', title: 'Who stands last in each room?',
    run: function () {
      return $('.guests .guest:last-child');
    } },
  { n: 11, kind: 'guests', label: 'Third in room', title: 'Who stands third in each room?',
    run: function () {
      return $('.guests .guest:nth-child(3)');
    } },
  { n: 12, kind: 'guests', label: 'After Timur', title: 'Who stands after Timur in his room?',
    run: function () {
      return $('.guest[data-name="Timur"]').nextAll();
    } },
  { n: 13, kind: 'guests', label: 'Before black', title: 'Who stands right before someone in black?',
    run: function () {
      return $('.guest.black').prev();
    } },
  { n: 14, kind: 'rooms', label: 'Aruzhan’s room', title: 'In which room is Aruzhan?',
    run: function () {
      return $('.guest[data-name="Aruzhan"]').closest('.room');
    } },
  { n: 15, kind: 'rooms', label: 'Fewer than 6', title: 'Which rooms have fewer than 6 guests?',
    run: function () {
      return $('.room').filter(function () {
        return $(this).find('.guest').length < 6;
      });
    } },
  { n: 16, kind: 'rooms', label: 'Cup, no glasses', title: 'In which rooms does somebody have a cup, but nobody wears glasses?',
    run: function () {
      return $('.room:has(.guest.cup):not(:has(.guest.glasses))');
    } },
  { n: 17, kind: 'guests', label: 'First to arrive', title: 'Who came first to each room?',
    run: function () {
      return $('.room').map(function () {
        return $(this).find('.guest').get().sort(function (a, b) {
          return $(a).data('min') - $(b).data('min');
        })[0];
      });
    } },
  { n: 18, kind: 'change', label: 'Miras comes', title: 'Miras, an AITU student in blue, comes at 21:20 with his phone and joins Askar and Inkar, standing between them.',
    note: ' (new guest, faded in between Askar and Inkar)',
    run: function () {
      var roomId = $('.guest[data-name="Askar"]').attr('data-room');
      var room = $.grep(party, function (r) {
        return r.id === roomId;
      })[0];
      return makeCard(MIRAS, room).hide().insertAfter('.guest[data-name="Askar"]').fadeIn(900);
    } },
  { n: 19, kind: 'change', label: 'Natasha leaves', title: 'Natasha says goodbye and goes home.',
    note: ' (card faded out and removed from the page)',
    run: function () {
      return $('.guest[data-name="Natasha"]').fadeOut(900, function () {
        $(this).remove();
      });
    } },
  { n: 20, kind: 'guests', label: 'Who took the cake?', title: 'Who took the cake? The thief was downstairs, came after 21:00 but before the cake disappeared, has crumbs but no cup, and stood right next to an AITU student.',
    run: function () {
      return $('.floor[data-floor="1"] .guest.crumbs:not(.cup)')
        .filter(function () {
          var m = $(this).data('min');
          return m > 21 * 60 && m < 21 * 60 + 30;
        })
        .filter(function () {
          return $(this).prev().add($(this).next()).is('.aitu');
        });
    } }
];

function jump($found) {
  $found.filter('.room').children('h3')
    .add($found.filter('.guest'))
    .animate({ top: -16 }, 160)
    .animate({ top: 0 }, 160);
}

function showResult(c, $found) {
  var names = $found.map(function () {
    return $(this).attr('data-name');
  }).get();
  var n = names.length;
  var noun = c.kind === 'rooms' ? (n === 1 ? 'room' : 'rooms') : (n === 1 ? 'guest' : 'guests');
  $('#result').empty().append(
    $('<strong>').text('Case ' + c.n + ' · ' + c.title),
    $('<br>'),
    $('<span>').text('Found ' + n + ' ' + noun + (n ? ': ' + names.join(', ') : '') + (c.note || ''))
  );
}

function runCase(c) {
  buildParty();
  var $found = c.run();
  showResult(c, $found);
  $found.addClass('found');
  if (c.kind !== 'change') jump($found);
}

$(function () {
  $.each(cases, function (i, c) {
    $('#cases').append(
      $('<button type="button" class="case">').attr({ 'data-case': c.n, title: c.title }).text(c.n + '. ' + c.label)
    );
  });
  buildParty();
  $('#cases').on('click', 'button.case', function () {
    $('#cases button').removeClass('active');
    $(this).addClass('active');
    runCase(cases[$(this).data('case') - 1]);
  });
});