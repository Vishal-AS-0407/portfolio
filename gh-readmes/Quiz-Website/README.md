<h1 align="center">Quizo — Quiz Website</h1>

<p align="center">
  <b>A five-question web-fundamentals quiz in plain HTML, CSS and JavaScript:<br>
  instant right/wrong feedback, a running score, and an animated result ring.</b>
</p>

<p align="center">
  <img alt="HTML" src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white">
  <img alt="CSS" src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black">
  <img alt="deps" src="https://img.shields.io/badge/dependencies-none-2ea44f?style=flat-square">
</p>

---

## What it is

A built-together project (the footer credits Deepan and Vishal). It is a single-page quiz with
four states, all on one page and switched by toggling an `active` class:

1. **Home**: "Welcome to Quizo", with a Start button.
2. **Guidelines**: a popup over a blurred home screen. Exit goes back, Continue starts.
3. **Quiz**: one question at a time with four options, a "Score: n / 5" header and a
   "2 of 5 Questions" counter.
4. **Result**: a circular progress ring that counts up to your percentage, with Try Again and
   Go Home.

A separate **Contact** page has a validated form (name, email, phone, message).

| Home | Quiz | Contact |
|---|---|---|
| ![Home](https://github.com/user-attachments/assets/de5a9363-6ad3-4ce0-8db3-424c8fff500a) | ![Quiz](https://github.com/user-attachments/assets/035d02d4-bc79-4844-bb06-ca1b957ed011) | ![Contact](https://github.com/user-attachments/assets/74de74bd-705d-4b9e-8eee-f09713cf9ced) |

## How it works

- **Questions are data.** `questions` in `script.js` is an array of
  `{ numb, question, options[4], answer }`. Adding a question means adding an object, with no
  markup changes.
- **Feedback on first click.** `optionSelected` compares the clicked option's text to `answer`.
  A wrong answer turns red, and the correct option turns green as well, so the player learns the
  answer instead of only learning they were wrong. Every option is then disabled, so the score
  cannot be farmed, and Next appears.
- **The result ring is a `conic-gradient`.** A `setInterval` steps a counter from 0 to the score
  percentage, and sets the gradient's stop to `percentage × 3.6deg` on each tick. There is no
  SVG and no canvas.

## Running it

No build step. Open `Code Files/main.html` in a browser.

---

## Known issues, with fixes

### 1. Question 4's answer key is wrong

> *Where in an HTML document is the correct place to refer to an external style sheet?*

The key is `"2. In the body section"`. The correct answer is **3, the head section**: `<link>`
belongs in `<head>`, and this project's own `main.html` puts it there. As committed, a player who
knows HTML is marked wrong, and the quiz teaches them the wrong answer in green.

```js
answer: "3. In the head section ",   // trailing space matches the option text exactly
```

Question 5 ("Which keyword is used to declare a variable?" → `var`) is also contestable, since
`let` and `const` are both correct in modern JavaScript. "Which keyword declares a variable that
cannot be reassigned?" → `const` has exactly one right answer.

### 2. Two recent commits broke the site

- **`Delete Code Files/Back-Ground image.jpg`.** `main_style.css` loads the background from
  `url(Back-Ground\ image.jpg)` relative to `Code Files/`. The only remaining copy is in
  `Images/`, so the background no longer loads. Point the CSS at `../Images/Back-Ground image.jpg`.
- **`Delete Code Files/thankyou.html`.** After successful validation, the contact form navigates
  to `thankyou.html`, which is now a 404. Restore it from commit `714d6f9`, or show the
  confirmation in place.

### 3. The result ring can loop forever

```js
if (progressStartValue == progressEndValue) clearInterval(progress);
```

`progressStartValue` counts in whole numbers. With five questions every score is a multiple of
20, so the two values meet. Add a sixth question and a score of 1/6 is 16.67%. The counter steps
past it and never stops, and the label climbs past 100%. Compare with `>=` and round:

```js
let progressEndValue = Math.round((userScore / questions.length) * 100);
...
if (progressStartValue >= progressEndValue) clearInterval(progress);
```

### 4. Smaller things

- **Go Home does not reset the header score.** Try Again calls `headerScore()` and Go Home does
  not, so the next game opens showing the last game's score.
- **Options are built with `innerHTML`** and compared by `textContent`. That works because the
  questions are trusted constants, but `textContent` plus `addEventListener` would let options
  contain `<` safely, and would remove the inline `onclick` attribute.
- **The contact form does not send anything.** It validates and then navigates away. Use a form
  service, or a `mailto:` link, so a message actually reaches someone.
- **Hosting.** It is a static site, so GitHub Pages (Settings → Pages → deploy from branch) would
  give it a live link in one step, once issue 2 is fixed.
