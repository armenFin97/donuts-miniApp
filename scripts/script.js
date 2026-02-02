const SHIFT_PX = 95;
const BOX_HALF = 85;
const DONUT_FLY_MS = 500;
const SLIDE_MS = 1000;
const PROMOTE_MS = 2000;
const TOTAL_DONUTS = 8;
const NUMBER_DELAY_MS = 500;

let currentBox = document.querySelector('.box-wrap.box-current');
let currentBoxDonuts = currentBox ? currentBox.querySelector('.box-donuts') : document.querySelector('.box-donuts');
const donutButtons = document.querySelectorAll('.donuts-row .donut-btn');
let inAnimation = false;

function easeOut(t) {
  return 1 - (1 - t) * (1 - t);
}

function animateDonutToBox(donut) {
  if (currentBoxDonuts.children.length >= 2 || inAnimation) return;

  inAnimation = true;
  const count = currentBoxDonuts.children.length;
  const startRect = donut.getBoundingClientRect();
  const boxRect = currentBox.getBoundingClientRect();
  const endX = boxRect.left + 12 + (count === 0 ? 0 : BOX_HALF);
  const endY = boxRect.top + 9;

  donut.style.position = 'fixed';
  donut.style.left = startRect.left + 'px';
  donut.style.top = startRect.top + 'px';
  donut.style.pointerEvents = 'none';
  donut.style.zIndex = '100';
  document.body.appendChild(donut);

  const t0 = performance.now();
  function tick(now) {
    const t = Math.min((now - t0) / DONUT_FLY_MS, 1);
    const e = easeOut(t);
    donut.style.left = (startRect.left + (endX - startRect.left) * e) + 'px';
    donut.style.top = (startRect.top + (endY - startRect.top) * e) + 'px';

    if (t < 1) {
      requestAnimationFrame(tick);
      return;
    }

    donut.removeAttribute('style');
    donut.className = 'donut-btn slot-' + (count + 1);
    currentBoxDonuts.appendChild(donut);

    if (currentBoxDonuts.children.length === 2) {
      onBoxClosed();
    } else {
      inAnimation = false;
    }
  }
  requestAnimationFrame(tick);
}

function onBoxClosed() {
  const nextBox = document.querySelector('.box-wrap.box-next');
  const goneBoxes = document.querySelectorAll('.box-wrap.box-gone');
  const completedCount = goneBoxes.length + 1;

  currentBox.classList.add('is-closed');

  if (nextBox) {
    goneBoxes.forEach(function (box) {
      const order = parseInt(box.getAttribute('data-completed-order'), 10);
      const level = completedCount - order;
      box.classList.remove('shift-1', 'shift-2', 'shift-3', 'shift-4');
      box.classList.add('shift-' + level);
    });
    currentBox.classList.add('box-moved');
    nextBox.classList.remove('box-pos-0', 'box-pos-1', 'box-pos-2', 'box-pos-3', 'box-pos-4');
    nextBox.classList.add('box-pos-' + completedCount);
    setTimeout(function () {
      nextBox.classList.add('is-visible');
    }, SLIDE_MS);
  } else {
    showTaskPhase();
  }

  setTimeout(function () {
    currentBox.classList.remove('box-current', 'box-moved');
    currentBox.classList.add('box-gone');
    currentBox.setAttribute('data-completed-order', String(completedCount - 1));
    currentBox.classList.remove('box-pos-0', 'box-pos-1', 'box-pos-2', 'box-pos-3', 'box-pos-4');
    currentBox.classList.add('box-pos-' + (completedCount - 1));
    if (nextBox) {
      currentBox.classList.remove('shift-1', 'shift-2', 'shift-3', 'shift-4');
      currentBox.classList.add('shift-1');
      nextBox.classList.remove('box-next', 'is-visible');
      nextBox.classList.add('box-current');
      currentBox = nextBox;
      currentBoxDonuts = nextBox.querySelector('.box-donuts');
    }
    inAnimation = false;
  }, PROMOTE_MS);
}

function setCurrentBoxPosition() {
  const goneCount = document.querySelectorAll('.box-wrap.box-gone').length;
  currentBox.classList.remove('box-pos-0', 'box-pos-1', 'box-pos-2', 'box-pos-3', 'box-pos-4');
  currentBox.classList.add('box-pos-' + goneCount);
}

function removeDonutNumbers() {
  document.querySelectorAll('.donut-number').forEach(function (el) {
    el.remove();
  });
}

function showNumbersAboveDonuts() {
  removeDonutNumbers();
  const donuts = document.querySelectorAll('.box-donuts .donut-btn');
  donuts.forEach(function (donut, i) {
    const span = document.createElement('span');
    span.className = 'donut-number slot-' + (i % 2 === 0 ? 1 : 2);
    span.setAttribute('data-delay', String(i));
    span.textContent = i + 1;
    donut.parentNode.insertBefore(span, donut);
  });
  requestAnimationFrame(function () {
    document.querySelectorAll('.donut-number').forEach(function (el) {
      el.classList.add('is-visible');
    });
  });
}

function showTaskPhase() {
  const donutsRow = document.querySelector('.donuts-row');
  const title = document.querySelector('.title');
  const taskPhase = document.querySelector('.task-phase');
  const answerInput = document.querySelector('.answer-input');
  if (donutsRow) donutsRow.classList.add('is-hidden');
  if (title) title.classList.add('is-hidden');
  if (taskPhase) taskPhase.classList.remove('is-hidden');
  if (answerInput) answerInput.removeAttribute('disabled');
}

function onDoneClick() {
  const answerInput = document.querySelector('.answer-input');
  const doneBtn = document.querySelector('.submit-btn');
  if (!answerInput || !doneBtn) return;
  const value = parseInt(answerInput.value, 10);
  if (value === TOTAL_DONUTS) {
    answerInput.classList.remove('error');
    answerInput.classList.add('success');
    doneBtn.classList.remove('error');
    doneBtn.classList.add('success');
    removeDonutNumbers();
  } else {
    answerInput.classList.remove('success');
    answerInput.classList.add('error');
    doneBtn.classList.remove('success');
    doneBtn.classList.add('error');
    showNumbersAboveDonuts();
    setTimeout(function () {
      answerInput.classList.remove('error');
      doneBtn.classList.remove('error');
      answerInput.value = '';
      doneBtn.disabled = true;
    }, TOTAL_DONUTS * NUMBER_DELAY_MS);
  }
}

function onAnswerInput() {
  const answerInput = document.querySelector('.answer-input');
  const doneBtn = document.querySelector('.submit-btn');
  if (answerInput && doneBtn) doneBtn.disabled = !answerInput.value.trim();
}

setCurrentBoxPosition();

donutButtons.forEach(function (btn) {
  btn.addEventListener('click', function () {
    animateDonutToBox(btn);
  });
});

const answerInputEl = document.querySelector('.answer-input');
const doneBtnEl = document.querySelector('.submit-btn');
if (answerInputEl) answerInputEl.addEventListener('input', onAnswerInput);
if (doneBtnEl) doneBtnEl.addEventListener('click', onDoneClick);