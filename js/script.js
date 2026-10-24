// Mobile menu
      var toggle = document.getElementById('menuToggle');
      var nav = document.getElementById('mainNav');
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') nav.classList.remove('open');
      });

      // ---- Counselling form → WhatsApp ----
      document.getElementById('sendBtn').addEventListener('click', function () {
        var name = document.getElementById('cName').value.trim();
        var phone = document.getElementById('cPhone').value.trim();
        var dest = document.getElementById('cDest').value;
        var msg = document.getElementById('cMsg').value.trim();
        var err = document.getElementById('sendError');
        if (!name) { err.style.display = 'block'; return; }
        err.style.display = 'none';
        var text = 'Hello EduVenture, I want to book a free counselling session.\n' +
          'Name: ' + name + '\n' +
          (phone ? 'My WhatsApp: ' + phone + '\n' : '') +
          'Interested in: ' + dest +
          (msg ? '\nDetails: ' + msg : '');
        window.open('https://wa.me/923006561444?text=' + encodeURIComponent(text), '_blank');
      });

      // ---- Destination directory → glide the moving cards to that country and highlight it ----
      var destTrack = document.querySelector('.dest-track');
      var destCarousel = document.querySelector('.dest-carousel');
      var destSet = destTrack ? destTrack.querySelector('.dest-set') : null;
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var hlTimer = null, resumeTimer = null, resumeInnerTimer = null;

      function trackTx() {
        var m = getComputedStyle(destTrack).transform;
        if (!m || m === 'none') return 0;
        var p = m.match(/matrix\(([^)]+)\)/);
        if (p) return parseFloat(p[1].split(',')[4]) || 0;
        var p3 = m.match(/matrix3d\(([^)]+)\)/);
        if (p3) return parseFloat(p3[1].split(',')[12]) || 0;
        return 0;
      }

      function showDestCard(key) {
        var card = document.getElementById('dest-' + key);
        if (!card || !destTrack || !destCarousel || !destSet) return;
        clearTimeout(hlTimer); clearTimeout(resumeTimer); clearTimeout(resumeInnerTimer);
        var prev = document.querySelectorAll('.dest.hl');
        for (var i = 0; i < prev.length; i++) prev[i].classList.remove('hl');

        destCarousel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });

        if (reduceMotion) {
          // Carousel is a plain horizontal scroller in reduced-motion mode
          card.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
          card.classList.add('hl');
          hlTimer = setTimeout(function () { card.classList.remove('hl'); }, 2800);
          return;
        }

        var setW = destSet.offsetWidth;
        if (!setW) return;
        // Freeze the auto-scroll exactly where it is, then glide to the card
        var frozen = trackTx();
        destTrack.style.transition = 'none';
        destTrack.style.animation = 'none';
        destTrack.style.transform = 'translateX(' + frozen + 'px)';
        void destTrack.offsetWidth;
        var delta = card.getBoundingClientRect().left - destCarousel.getBoundingClientRect().left - 4;
        var target = frozen - delta;
        while (target > 0) target -= setW;
        while (target <= -setW) target += setW;
        destTrack.style.transition = 'transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1)';
        destTrack.style.transform = 'translateX(' + target + 'px)';
        card.classList.add('hl');
        hlTimer = setTimeout(function () { card.classList.remove('hl'); }, 2800);

        // After a pause, ease back to a loop-equivalent position and restart the auto-scroll
        resumeTimer = setTimeout(function () {
          var now = trackTx();
          var equiv = Math.round(now / setW) * setW;
          destTrack.style.transition = 'transform 0.6s ease';
          destTrack.style.transform = 'translateX(' + equiv + 'px)';
          resumeInnerTimer = setTimeout(function () {
            destTrack.style.transition = '';
            destTrack.style.transform = '';
            destTrack.style.animation = '';
          }, 650);
        }, 4600);
      }

      var dirLinks = document.querySelectorAll('.dir-link');
      for (var j = 0; j < dirLinks.length; j++) {
        dirLinks[j].addEventListener('click', function () {
          showDestCard(this.getAttribute('data-dest'));
        });
      }
