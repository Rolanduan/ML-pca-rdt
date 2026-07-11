const modes = {
  break: {
    label: '破十法任务',
    generate: () => {
      const ones = rand(1, 8);
      const sub = rand(ones + 1, 9);
      const total = 10 + ones;
      return {
        question: `${total} - ${sub} = ?`,
        answer: total - sub,
        filled: total,
        take: sub,
        steps: [`把 ${total} 破成 10 和 ${ones}。`, `先算 10 - ${sub} = ${10 - sub}。`, `再算 ${10 - sub} + ${ones} = ${total - sub}。`],
        hint: `先盯住一个完整的 10，用 10 减 ${sub}。`,
      };
    },
  },
  make: {
    label: '凑十法任务',
    generate: () => {
      const a = rand(6, 9);
      const need = 10 - a;
      const b = rand(need, 8);
      return {
        question: `${a} + ${b} = ?`,
        answer: a + b,
        filled: a,
        take: 0,
        steps: [`${a} 离 10 还差 ${need}。`, `把 ${b} 分成 ${need} 和 ${b - need}。`, `${a} + ${need} = 10，10 + ${b - need} = ${a + b}。`],
        hint: `先从 ${b} 里拿 ${need} 个，帮 ${a} 凑成 10。`,
      };
    },
  },
  judge: {
    label: '评十法任务',
    generate: () => {
      const a = rand(6, 12);
      const b = rand(4, 9);
      const near = Math.abs(10 - a) <= Math.abs(10 - b) ? a : b;
      const diff = Math.abs(10 - near);
      return {
        question: `${a} + ${b}，先评一评谁更靠近 10？答案是多少？`,
        answer: a + b,
        filled: Math.min(a, 10),
        take: 0,
        steps: [`比较：${a} 离 10 差 ${Math.abs(10 - a)}，${b} 离 10 差 ${Math.abs(10 - b)}。`, `${near} 更靠近 10，先把它变成 10。`, `调整后再算，最后 ${a} + ${b} = ${a + b}。`],
        hint: `${near} 只差 ${diff} 就到 10，先处理它最省力。`,
      };
    },
  },
  borrow: {
    label: '借十法任务',
    generate: () => {
      const tens = rand(2, 5);
      const ones = rand(0, 6);
      const sub = rand(ones + 1, 9);
      const total = tens * 10 + ones;
      return {
        question: `${total} - ${sub} = ?`,
        answer: total - sub,
        filled: 10 + ones,
        take: sub,
        steps: [`个位 ${ones} 不够减 ${sub}，向十位借 1 个十。`, `个位变成 ${10 + ones}，先算 ${10 + ones} - ${sub} = ${10 + ones - sub}。`, `十位剩 ${tens - 1} 个十，所以答案是 ${(tens - 1) * 10 + (10 + ones - sub)}。`],
        hint: `借来的 1 个十等于 10 个一，个位就有 ${10 + ones} 个一。`,
      };
    },
  },
};

let currentMode = 'break';
let currentProblem = modes[currentMode].generate();
let score = 0;

const modeLabel = document.querySelector('#modeLabel');
const question = document.querySelector('#question');
const visual = document.querySelector('#visual');
const steps = document.querySelector('#steps');
const feedback = document.querySelector('#feedback');
const answer = document.querySelector('#answer');
const scoreEl = document.querySelector('#score');

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function render() {
  modeLabel.textContent = modes[currentMode].label;
  question.textContent = currentProblem.question;
  steps.innerHTML = currentProblem.steps.map((step, index) => `<div class="step"><strong>第 ${index + 1} 步：</strong>${step}</div>`).join('');
  visual.innerHTML = '';
  const cells = Math.max(10, currentProblem.filled);
  for (let i = 1; i <= cells; i += 1) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i <= currentProblem.filled) dot.classList.add('filled');
    if (currentProblem.take && i <= currentProblem.take) dot.classList.add('take');
    dot.textContent = i <= currentProblem.filled ? '●' : '';
    visual.appendChild(dot);
  }
  answer.value = '';
  feedback.className = 'feedback';
  feedback.textContent = '跟着提示一步一步来吧！';
}

function nextProblem() {
  currentProblem = modes[currentMode].generate();
  render();
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelector('.tab.is-active').classList.remove('is-active');
    tab.classList.add('is-active');
    currentMode = tab.dataset.mode;
    nextProblem();
  });
});

document.querySelector('#answerForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const value = Number(answer.value);
  if (value === currentProblem.answer) {
    score += 1;
    scoreEl.textContent = score;
    feedback.className = 'feedback good';
    feedback.textContent = `太棒了！答案就是 ${currentProblem.answer}，你得到一颗星。`;
  } else {
    feedback.className = 'feedback try';
    feedback.textContent = '再想一想：先找到 10，再完成最后一步。';
  }
});

document.querySelector('#hintBtn').addEventListener('click', () => {
  feedback.className = 'feedback try';
  feedback.textContent = currentProblem.hint;
});

document.querySelector('#nextBtn').addEventListener('click', nextProblem);

render();
