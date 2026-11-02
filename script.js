var ICONS = { phone: '📱', glasses: '👓', bag: '👜', cup: '☕', crumbs: '🍰' };
var NAMES = { phone: 'a phone', glasses: 'glasses', bag: 'a bag', cup: 'a cup', crumbs: 'cake crumbs' };
var MIRAS = { name: 'Miras', color: 'blue', time: '21:20', aitu: true, things: ['phone'] };
var sorted = {};
var $card = null;
var $openGuest = null;

function toMin(t) {
  var p = t.split(':');
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}

function makeCard(g, room, pos) {
  var classes = ['guest', g.color, g.aitu ? 'aitu' : 'not-aitu'].concat(g.things).join(' ');
  var $c = $('<div>').addClass(classes).attr({
    'data-name': g.name,
    'data-color': g.color,
    'data-time': g.time,
    'data-min': toMin(g.time),
    'data-aitu': String(g.aitu),
    'data-things': g.things.join(','),
    'data-room': room.id,
    'data-floor': room.floor,
    'data-pos': pos
  });
  var $avatar = $('<img class="avatar">')
    .attr('alt', g.name)
    .attr('src', 'https://api.dicebear.com/9.x/open-peeps/svg?seed=' + encodeURIComponent(g.name));
  var $ring = $('<div class="ring">').append($avatar);
  if (g.aitu) {
    $ring.append($('<span class="badge">').text('🎓'));
  }
  var $things = $('<div class="things">');
  $.each(g.things, function (i, t) {
    $things.append($('<span class="thing">').text(ICONS[t]));
  });
  return $c.append($ring, $('<div class="name">').text(g.name), $('<div class="time">').text('◷ ' + g.time), $things);
}

function killCard() {
  if ($card) {
    $card.stop(true).remove();
  }
  $card = null;
  $openGuest = null;
}

function buildParty() {
  killCard();
  $('.fly').stop(true).remove();
  $('#house *').stop(true);
  sorted = {};
  var $house = $('#house').empty();
  $.each([2, 1], function (i, floor) {
    var $rooms = $('<div class="rooms">');
    $.each(party, function (j, room) {
      if (room.floor !== floor) return;
      var $guests = $('<div class="guests">');
      $.each(room.guests, function (k, g) {
        $guests.append(makeCard(g, room, k));
      });
      $rooms.append(
        $('<div class="room">')
          .attr({ 'data-room': room.id, 'data-name': room.name, 'data-floor': room.floor })
          .append(
            $('<h3>').text(room.name),
            $('<button type="button" class="sort">').text('Sort by time'),
            $guests
          )
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
      var $askar = $('.guest[data-name="Askar"]');
      var roomId = $askar.attr('data-room');
      var room = $.grep(party, function (r) {
        return r.id === roomId;
      })[0];
      var pos = parseFloat($askar.attr('data-pos')) + 0.5;
      return makeCard(MIRAS, room, pos).hide().insertAfter($askar).fadeIn(900);
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

function spotlight($found, kind) {
  var $keep = kind === 'rooms' ? $found.find('.guest') : $found;
  $('#house .guest').not($keep).fadeTo(300, 0.2);
}

function clearSpotlight() {
  $('#house .guest').stop(true, true).fadeTo(300, 1);
  $('#house .found').removeClass('found');
  $('#cases button').removeClass('active');
  $('#result').text('Cleared. All guests are bright again.');
}

function runCase(c) {
  buildParty();
  var $found = c.run();
  showResult(c, $found);
  $found.addClass('found');
  if (c.kind !== 'change') {
    jump($found);
    spotlight($found, c.kind);
  }
}

function thingsText(arr) {
  if (!arr.length) return 'Came with nothing';
  var t = $.map(arr, function (x) {
    return NAMES[x];
  });
  var last = t.pop();
  return 'Has ' + (t.length ? t.join(', ') + ' and ' + last : last);
}

function closeCard() {
  if (!$card) return;
  var $c = $card;
  var o = $openGuest.find('.avatar').offset();
  $card = null;
  $openGuest = null;
  $c.stop(true).animate({ left: o.left, top: o.top, width: 64, height: 64, opacity: 0 }, 250, function () {
    $c.remove();
  });
}

function openCard($g) {
  closeCard();
  var things = $g.attr('data-things') ? $g.attr('data-things').split(',') : [];
  var roomId = $g.attr('data-room');
  var $c = $('<div class="info">').attr('data-name', $g.attr('data-name')).append(
    $('<h4>').text($g.attr('data-name')),
    $('<p>').text('Came at ' + $g.attr('data-time')),
    $('<p>').text($g.attr('data-aitu') === 'true' ? 'AITU student' : 'Not an AITU student'),
    $('<p>').text('Wears ' + $g.attr('data-color')),
    $('<p>').text(thingsText(things))
  );
  $.each(party, function (i, r) {
    if (r.id !== roomId) {
      $c.append($('<button type="button" class="move">').attr('data-to', r.id).text('Move to the ' + r.name.toLowerCase()));
    }
  });
  var w = 240;
  $c.css({ width: w, height: 'auto', left: -9999, top: 0 }).appendTo('body');
  var h = $c.outerHeight();
  var o = $g.find('.avatar').offset();
  var tx = Math.max(8, Math.min(o.left + 32 - w / 2, $(window).width() - w - 8));
  $c.css({ left: o.left, top: o.top, width: 64, height: 64, opacity: 0.3 })
    .animate({ left: tx, top: o.top + 70, width: w, height: h, opacity: 1 }, 300);
  $card = $c;
  $openGuest = $g;
}

function applyOrder(id) {
  var $box = $('.room[data-room="' + id + '"] .guests');
  var $cards = $box.children('.guest').not('.moving');
  var before = {};
  $cards.each(function () {
    var $c = $(this).stop(true, true);
    before[$c.attr('data-name')] = $c.offset();
  });
  var list = $cards.get().sort(function (a, b) {
    var A = $(a), B = $(b);
    var byPos = parseFloat(A.attr('data-pos')) - parseFloat(B.attr('data-pos'));
    if (sorted[id]) {
      return (parseInt(A.attr('data-min'), 10) - parseInt(B.attr('data-min'), 10)) || byPos;
    }
    return byPos;
  });
  $.each(list, function () {
    $box.append(this);
  });
  $cards.each(function () {
    var $c = $(this).css({ left: 0, top: 0 });
    var b = before[$c.attr('data-name')];
    var a = $c.offset();
    $c.css({ left: b.left - a.left, top: b.top - a.top }).animate({ left: 0, top: 0 }, 500);
  });
}

function moveGuest(name, toId) {
  var $g = $('#house .guest[data-name="' + name + '"]').not('.moving');
  if (!$g.length || $g.attr('data-room') === toId) return;
  var fromId = $g.attr('data-room');
  var fromRoom = $.grep(party, function (r) {
    return r.id === fromId;
  })[0];
  var toRoom = $.grep(party, function (r) {
    return r.id === toId;
  })[0];
  var idx = -1;
  $.each(fromRoom.guests, function (i, x) {
    if (x.name === name) idx = i;
  });
  var g = idx >= 0 ? fromRoom.guests.splice(idx, 1)[0] : {
    name: name,
    color: $g.attr('data-color'),
    time: $g.attr('data-time'),
    aitu: $g.attr('data-aitu') === 'true',
    things: $g.attr('data-things') ? $g.attr('data-things').split(',') : []
  };
  toRoom.guests.push(g);
  closeCard();
  var from = $g.offset();
  var w = $g.outerWidth();
  var $new = makeCard(g, toRoom, toRoom.guests.length - 1)
    .addClass('moving')
    .css('opacity', $g.css('opacity'))
    .appendTo($('.room[data-room="' + toId + '"] .guests'));
  var to = $new.offset();
  $new.css({ visibility: 'hidden', width: 0, marginRight: -8 });
  var $fly = $g.clone().addClass('fly').css({ position: 'absolute', left: from.left, top: from.top, width: w, margin: 0 }).appendTo('body');
  $g.addClass('moving').css('visibility', 'hidden').animate({ width: 0, marginRight: -8 }, 600, function () {
    $(this).remove();
  });
  $new.animate({ width: w, marginRight: 0 }, 600);
  $fly.animate({ left: to.left, top: to.top }, 700, function () {
    $fly.remove();
    $new.css('visibility', 'visible').removeClass('moving');
    if (sorted[toId]) applyOrder(toId);
  });
}

$(function () {
  $.each(cases, function (i, c) {
    $('#cases').append(
      $('<button type="button" class="case">').attr({ 'data-case': c.n, title: c.title }).text(c.n + '. ' + c.label)
    );
  });
  buildParty();
  $('#clear').on('click', clearSpotlight);
  $('#cases').on('click', 'button.case', function () {
    $('#cases button').removeClass('active');
    $(this).addClass('active');
    runCase(cases[$(this).data('case') - 1]);
  });
  $('#house').on('click', '.guest', function () {
    if ($openGuest && $openGuest[0] === this) return;
    openCard($(this));
  });
  $('#house').on('click', '.sort', function () {
    var id = $(this).closest('.room').attr('data-room');
    sorted[id] = !sorted[id];
    applyOrder(id);
  });
  $(document).on('keydown', function (e) {
    if (e.which === 27) closeCard();
  });
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.info, .guest').length) closeCard();
  });
  $(document).on('click', '.info .move', function () {
    moveGuest($(this).closest('.info').attr('data-name'), $(this).attr('data-to'));
  });
});