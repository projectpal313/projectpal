// Academic Workspace stage machine
(function () {
  'use strict';

  var currentStage = 1;
  var selectedCards = new Set();

  function $(id) { return document.getElementById(id); }
  function show(id) { $(id).classList.remove('hidden'); }
  function hide(id) { $(id).classList.add('hidden'); }
  function showToast(message) {
    if (window.ProjectPal && typeof ProjectPal.showToast === 'function') {
      ProjectPal.showToast(message);
    } else {
      alert(message);
    }
  }

  function updateProgressDots() {
    var dots = document.querySelectorAll('.flex.space-x-8 .w-8');
    var labels = document.querySelectorAll('.flex.space-x-8 .hidden');
    dots.forEach(function (dot, index) {
      if (index < currentStage) {
        dot.className = 'w-8 h-8 rounded-full bg-ocean text-white flex items-center justify-center text-xs font-medium';
      } else {
        dot.className = 'w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-medium';
      }
    });
    labels.forEach(function (label, index) {
      label.className = index < currentStage ? 'hidden sm:block text-sm font-bold text-ocean' : 'hidden sm:block text-sm font-medium text-slate-600';
    });
  }

  function advanceToStage(nextStage) {
    currentStage = Math.max(currentStage, nextStage);
    for (var i = 1; i <= 5; i++) {
      var stage = $('stage-' + i);
      if (!stage) continue;
      if (i < currentStage) {
        stage.classList.remove('locked', 'active', 'hidden');
        stage.classList.add('completed');
      } else if (i === currentStage) {
        stage.classList.remove('locked', 'completed', 'hidden');
        stage.classList.add('active', 'fade-up');
      } else {
        stage.classList.remove('active', 'completed');
        stage.classList.add('locked', 'hidden');
      }
    }
    if (currentStage >= 4) { $('proceedToDefenseBtn').disabled = false; }
    updateProgressDots();
  }

  // Stage 1: Scope validation
  function checkScope() {
    var geo = $('geoScope').value.trim();
    var sample = $('targetSample').value.trim();
    var problem = $('coreProblem').value.trim();
    $('validateScopeBtn').disabled = !(geo && sample && problem);
  }
  ['geoScope', 'targetSample', 'coreProblem'].forEach(function (id) {
    $(id).addEventListener('input', checkScope);
  });

  $('validateScopeBtn').addEventListener('click', function () {
    if ($('geoScope').value.trim() && $('targetSample').value.trim() && $('coreProblem').value.trim()) {
      hide('stage1-error');
      advanceToStage(2);
    } else {
      $('stage1-error').textContent = 'All three scope fields are required.';
      show('stage1-error');
    }
  });

  // Stage 2: Literature card selection
  document.querySelectorAll('.lit-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var id = this.dataset.card;
      if (selectedCards.has(id)) {
        selectedCards.delete(id);
        this.classList.remove('selected');
      } else {
        selectedCards.add(id);
        this.classList.add('selected');
      }
      var count = selectedCards.size;
      $('litSelectionCount').textContent = count + '/2 selected';
      $('proceedToMethodologyBtn').disabled = count < 2;
    });
  });

  $('proceedToMethodologyBtn').addEventListener('click', function () {
    if (selectedCards.size < 2) {
      $('stage2-error').textContent = 'Select at least 2 literature cards to continue.';
      show('stage2-error');
    } else {
      hide('stage2-error');
      advanceToStage(3);
    }
  });

  // Stage 3: Methodology preview
  function updateMethodology() {
    var design = $('researchDesign').value;
    var sample = $('sampleSize').value.trim();
    if (design && sample) {
      $('methodologyText').textContent = 'Research Design: ' + design.charAt(0).toUpperCase() + design.slice(1) + ' | Sample: ' + sample + '.';
      $('proceedToDraftingBtn').disabled = false;
    } else {
      $('methodologyText').textContent = 'Complete the fields above to see your methodology summary.';
      $('proceedToDraftingBtn').disabled = true;
    }
  }
  $('researchDesign').addEventListener('change', updateMethodology);
  $('sampleSize').addEventListener('input', updateMethodology);

  $('proceedToDraftingBtn').addEventListener('click', function () {
    if (!$('researchDesign').value || !$('sampleSize').value.trim()) {
      $('stage3-error').textContent = 'Choose a research design and enter your sample size.';
      show('stage3-error');
    } else {
      hide('stage3-error');
      advanceToStage(4);
    }
  });

  // Stage 4: Chapter accordion
  window.toggleChapter = function (number) {
    var content = $('ch' + number + '-content');
    var icon = $('ch' + number + '-icon');
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      icon.style.transform = 'rotate(90deg)';
    } else {
      content.classList.add('hidden');
      icon.style.transform = 'rotate(0deg)';
    }
  };

  $('proceedToDefenseBtn').addEventListener('click', function () {
    advanceToStage(5);
  });

  // Stage 5: Defense readiness
  $('submitDefenseBtn').addEventListener('click', function () {
    var q1 = $('defenseQ1').value.trim();
    var q2 = $('defenseQ2').value.trim();
    var q3 = $('defenseQ3').value.trim();
    if (!q1 || !q2 || !q3) {
      showToast('Answer all three defense questions first.');
      return;
    }
    show('defenseResult');
    var badge = $('defenseBadge');
    badge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800';
    badge.textContent = 'Defense Score: Ready for Submission';
    $('defenseMessage').textContent = 'Your project is ready for export.';
    $('exportProjectBtn').disabled = false;
    showToast('Defense preparation complete!');
  });

  $('exportProjectBtn').addEventListener('click', function () {
    showToast('Export started - check your downloads.');
  });

  updateProgressDots();
})();
