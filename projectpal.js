// ProjectPal Shared Library
// Provides cross-page navigation, toast notifications, modal handling,
// page transitions, and utility helpers for the prototype.

(function () {
  'use strict';

  var THEME = {
    ink: '#102A43',
    ocean: '#0F766E',
    amber: '#F59E0B',
    teal: '#0D9488'
  };

  var PAGES = [
    { href: 'home.html', label: 'Home' },
    { href: 'welcome-hub.html', label: 'Start page' },
    { href: 'dashboard.html', label: 'Dashboard' },
    { href: 'profile.html', label: 'Profile' },
    { href: 'edit-profile.html', label: 'Edit Profile' },
    { href: 'projects.html', label: 'Projects' },
    { href: 'project-details.html', label: 'Project Details' },
    { href: 'team-management.html', label: 'Team Management' },
    { href: 'collaboration.html', label: 'Collaboration Area' },
    { href: 'messages.html', label: 'Messages' },
    { href: 'notifications.html', label: 'Notifications' },
    { href: 'settings.html', label: 'Settings' },
    { href: 'help-center.html', label: 'Help Center' },
    { href: 'community.html', label: 'Community' },
    { href: 'literature-review.html', label: 'Literature' },
    { href: 'research-notes.html', label: 'Research' },
    { href: 'citation-manager.html', label: 'Citations' },
    { href: 'milestone-tracker.html', label: 'Milestones' },
    { href: 'goal-tracker.html', label: 'Goals' },
    { href: 'workspace.html', label: 'Academic Workspace' },
    { href: 'workspace-video.html', label: 'Workspace Video' },
    { href: 'quikaz.html', label: 'QuikAz' },
    { href: 'about.html', label: 'About' }
  ];

  var toastTimer = null;

  function getToastEl() {
    var t = document.getElementById('ppToast');
    if (t) return t;
    t = document.createElement('div');
    t.id = 'ppToast';
    t.className = 'pp-toast-fixed hidden';
    t.setAttribute('role', 'alert');
    t.setAttribute('aria-live', 'polite');
    document.body.appendChild(t);
    return t;
  }

  function showToast(message, options) {
    options = options || {};
    var type = options.type || 'info';
    var duration = options.duration !== undefined ? options.duration : 3200;
    var toast = getToastEl();

    var bgClass = {
      info: 'bg-slate-800',
      success: 'bg-teal-600',
      error: 'bg-red-600',
      warning: 'bg-amber-600'
    }[type] || 'bg-slate-800';

    toast.className = 'pp-toast-fixed pp-toast-enter ' + bgClass;
    toast.textContent = message;
    toast.classList.remove('hidden');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.add('pp-toast-exit');
      toast.classList.remove('pp-toast-enter');
      setTimeout(function () {
        toast.classList.add('hidden');
        toast.className = 'pp-toast-fixed hidden';
        toast.textContent = '';
      }, 300);
    }, duration);
  }

  var modalStack = [];

  function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return false;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modalStack.push(modalId);
    return true;
  }

  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return false;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = '';
    if (modalStack.length > 0 && modalStack[modalStack.length - 1] === modalId) {
      modalStack.pop();
    }
    if (modalStack.length === 0) {
      document.body.style.overflow = '';
    }
    return true;
  }

  function closeTopModal() {
    if (modalStack.length > 0) {
      var top = modalStack.pop();
      closeModal(top);
      if (modalStack.length === 0) document.body.style.overflow = '';
      return true;
    }
    return false;
  }

  function createNav() {
    var wrapper = document.createElement('div');
    wrapper.className = 'pp-nav-fixed';
    wrapper.innerHTML =
      '<button id="ppSwitch" class="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-lg ring-1 ring-slate-200 hover:bg-slate-50">All pages ▾</button>' +
      '<nav id="ppMenu" class="hidden pp-nav-menu" role="menu" aria-label="Site navigation">' +
        PAGES.map(function (p) {
          return '<a href="' + p.href + '" class="block rounded-xl px-3 py-2 font-bold text-slate-700 hover:bg-teal-50">' + p.label + '</a>';
        }).join('') +
      '</nav>';
    document.body.appendChild(wrapper);

    var menu = wrapper.querySelector('#ppMenu');
    var btn = wrapper.querySelector('#ppSwitch');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });

    document.addEventListener('click', function () {
      menu.classList.add('hidden');
    });

    var links = menu.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        menu.classList.add('hidden');
      });
    }
  }

  function setupPageTransition() {
    var links = document.querySelectorAll('a[href$=".html"]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        if (this.target === '_' || this.target === '#') return;
        var href = this.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        var overlay = document.createElement('div');
        overlay.className = 'pp-page-transition';
        document.body.appendChild(overlay);
        overlay.classList.add('appear');
        setTimeout(function () {
          window.location.href = href;
        }, 400);
      });
    }
  }

  var profileCache = null;

  function getProfile() {
    if (profileCache) return profileCache;
    try {
      profileCache = JSON.parse(localStorage.getItem('projectpalProfile') || '{}');
    } catch (e) {
      profileCache = {};
    }
    return profileCache;
  }

  function setProfile(data) {
    var existing = getProfile();
    profileCache = Object.assign({}, existing, data);
    localStorage.setItem('projectpalProfile', JSON.stringify(profileCache));
  }

  function updateDOMFromProfile() {
    var profile = getProfile();
    if (profile.name) {
      var firstName = profile.name.trim().split(/\s+/)[0];
      var nameEls = document.querySelectorAll('[data-profile-name]');
      for (var i = 0; i < nameEls.length; i++) {
        nameEls[i].textContent = profile.name;
      }
      var welcomeEls = document.querySelectorAll('[data-welcome-name]');
      for (var j = 0; j < welcomeEls.length; j++) {
        welcomeEls[j].textContent = 'Good to see you, ' + firstName + '.';
      }
    }
    if (profile.topic) {
      var topicEls = document.querySelectorAll('[data-profile-topic]');
      for (var k = 0; k < topicEls.length; k++) {
        topicEls[k].textContent = profile.topic;
      }
    }
  }

  function formatCurrentDate() {
    var now = new Date();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return days[now.getDay()].toUpperCase() + ', ' + months[now.getMonth()].toUpperCase() + ' ' + now.getDate();
  }

  function updateDates() {
    var dateEls = document.querySelectorAll('[data-current-date]');
    for (var i = 0; i < dateEls.length; i++) {
      dateEls[i].textContent = formatCurrentDate();
    }
  }

  function init() {
    createNav();
    setupPageTransition();
    updateDOMFromProfile();
    updateDates();
  }

  window.addEventListener('pageshow', function () {
    var o = document.querySelectorAll('.pp-page-transition');
    for (var i = 0; i < o.length; i++) o[i].parentNode.removeChild(o[i]);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.ProjectPal = {
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal,
    closeTopModal: closeTopModal,
    getProfile: getProfile,
    setProfile: setProfile,
    formatDate: formatCurrentDate,
    THEME: THEME,
    PAGES: PAGES
  };
})();