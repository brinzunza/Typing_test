/*
Typing Test Game Logic:

1. Word Generation and Display:
   - A set of words is randomly selected from a predefined list.
   - Each word is formatted into HTML with each letter wrapped in a <span> element.
   - Words are displayed in the #words div.

2. Game State Management:
   - The current word and letter are tracked using 'current' class.
   - Correctness is managed by adding 'correct' or 'incorrect' classes to letters.

3. Input Handling:
   - Keyup events are listened to on the #game element.
   - Different handlers for letter input, space (next word), and backspace.

4. Letter Input Logic:
   - If the typed letter matches the expected letter, add 'correct' class.
   - If it doesn't match, add 'incorrect' class.
   - Move 'current' class to the next letter.

5. Word Navigation:
   - Space key moves to the next word, marking remaining letters as incorrect.
   - Backspace allows moving back through letters and words.

6. Visual Feedback:
   - A cursor element moves to indicate the current typing position.
   - Words move up as the user types to keep the current word visible.

7. Timer and Scoring:
   - A 30-second timer starts on the first keystroke.
   - At the end, WPM and accuracy is calculated based on correctly typed words.

Key Functions:
- newGame(): Sets up a new game session.
- handleLetterInput(): Processes each letter typed.
- handleBackspaceInput(): Manages backspace functionality.
- handleSpaceInput(): Handles moving to the next word.
- getWpmAndAccuracy(): Calculates the final Words Per Minute score along with typing accuracy.
- gameOver(): Ends the game and displays the result.

The game extensively uses DOM manipulation and CSS classes to provide 
real-time feedback and track the user's progress through the text.
*/

//global variables
const words = "the be to of and a in that have I it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us".split(" ");
const wordsCount = words.length;
const gameTime = 30000;
window.timer = null;
window.gameStart = null;

let totalKeystrokes = 0;


//add and remove classes
function addClass(element,name) {
  element.className += ' '+name;
}
function removeClass(element,name) {
  element.className = element.className.replace(name,'');
}


//random word generator and formatter
function randomWord() {
  const randomIndex = Math.ceil(Math.random() * wordsCount);
  return words[randomIndex - 1];
}
function formatWord(word) {
  return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}


//Game initializer and resetter
function newGame() {
  if (window.timer) {
    clearInterval(window.timer);
  };
  document.getElementById('words').innerHTML = '';
  for (let i = 0; i < 200; i++) {
    document.getElementById('words').innerHTML += formatWord(randomWord());
  }
  addClass(document.querySelector('.word'), 'current');
  addClass(document.querySelector('.letter'), 'current');
  document.getElementById('info').innerHTML = (gameTime / 1000) + '';
  window.timer = null;
  window.gameStart = null;
  totalKeystrokes = 0;
}

// calculate user speed (wpm) and accuracy (%)
function getWpmAndAccuracy() {
  const words = [...document.querySelectorAll('.word')];
  const lastTypedWord = document.querySelector('.word.current');
  const lastTypedWordIndex = words.indexOf(lastTypedWord);
  const typedWords = words.slice(0, lastTypedWordIndex);
  const correctLetters = typedWords.reduce((count, word) => {
    return count + [...word.children].filter(letter => letter.className.includes('correct')).length;
  }, 0);
  const incorrectLetters = typedWords.reduce((count, word) => {
    return count + [...word.children].filter(letter => letter.className.includes('incorrect')).length;
  }, 0);
  const wpm = correctLetters / 5 / (gameTime / 60000); // Assuming average word length of 5 characters
  const accuracy = (correctLetters / (correctLetters + incorrectLetters)) * 100;
  return { wpm, accuracy };
}

//End of the test
function gameOver() {
  clearInterval(window.timer);
  addClass(document.getElementById('game'), 'over');
  const { wpm, accuracy } = getWpmAndAccuracy();
  document.getElementById('info').innerHTML = `WPM: ${wpm.toFixed(2)} | Accuracy: ${accuracy.toFixed(2)}%<br>${wpm < 40 ? '<p style="font-size: 12px;">you are slow</p>' : wpm < 60 ? '<p style="font-size: 12px;">you are average</p>' : wpm < 80 ? '<p style="font-size: 12px;">you are fast</p>' : '<p style="font-size: 12px;">you are very fast</p>'}`;
}

//typing detection (when a key is pressed and released)
document.getElementById('game').addEventListener('keyup', event => {
  const key = event.key;
  const gameElement = document.getElementById('game');
  const currentWord = gameElement.querySelector('.word.current');
  const currentLetter = gameElement.querySelector('.letter.current');

  if (!currentWord || !gameElement) {
    console.error('Required elements not found');
    return;
  }

  if (gameElement.classList.contains('over')) {
    return;
  }

  const expected = currentLetter?.innerHTML || ' ';
  const isLetter = key.length === 1 && key !== ' ';
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';
  const isFirstLetter = currentLetter === currentWord.firstChild;

  console.log({key,expected});

  if (isLetter || isSpace) totalKeystrokes++;

  //timer setup
  if (!window.timer && isLetter) {
    window.gameStart = (new Date()).getTime();
    window.timer = setInterval(() => {
      const currentTime = (new Date()).getTime();
      const msPassed = currentTime - window.gameStart;
      const sLeft = Math.round((gameTime / 1000) - (msPassed / 1000));
      if (sLeft <= 0) {
        gameOver();
        return;
      }
      document.getElementById('info').innerHTML = sLeft + '';
    }, 1000);
  }

  if (isLetter) {
    handleLetterInput(currentWord, currentLetter, key, expected);
  } else if (isSpace) {
    handleSpaceInput(currentWord, currentLetter);
  } else if (isBackspace) {
    handleBackspaceInput(currentWord, currentLetter, isFirstLetter);
  }

  moveWordsUp(currentWord);
  adjustCursor();
});

function handleLetterInput(currentWord, currentLetter, key, expected) {
  if (currentLetter) {
    addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
    removeClass(currentLetter, 'current');
    if (currentLetter.nextSibling) {
      addClass(currentLetter.nextSibling, 'current');
    }
  } else {
    // Don't add extra letters to the word
    console.log('Extra letter typed');
  }
}

function handleBackspaceInput(currentWord, currentLetter, isFirstLetter) {
  if (currentLetter && isFirstLetter) {
    // Move to previous word
    removeClass(currentWord, 'current');
    addClass(currentWord.previousSibling, 'current');
    removeClass(currentLetter, 'current');
    addClass(currentWord.previousSibling.lastChild, 'current');
  } else if (currentLetter) {
    // Move back one letter
    removeClass(currentLetter, 'current');
    addClass(currentLetter.previousSibling, 'current');
  } else {
    // If at the end of a word, move to the last letter
    const lastLetter = currentWord.lastChild;
    addClass(lastLetter, 'current');
  }
  // Remove any classes from the current letter
  const newCurrentLetter = document.querySelector('.letter.current');
  if (newCurrentLetter) {
    removeClass(newCurrentLetter, 'correct');
    removeClass(newCurrentLetter, 'incorrect');
  }
}

function handleSpaceInput(currentWord, currentLetter) {
  // Mark any remaining letters as incorrect
  const remainingLetters = currentWord.querySelectorAll('.letter:not(.correct):not(.incorrect)');
  remainingLetters.forEach(letter => addClass(letter, 'incorrect'));

  removeClass(currentWord, 'current');
  addClass(currentWord.nextSibling, 'current');
  if (currentLetter) {
    removeClass(currentLetter, 'current');
  }
  addClass(currentWord.nextSibling.firstChild, 'current');
}

function moveWordsUp(currentWord) {
  if (currentWord.getBoundingClientRect().top > 250) {
    const words = document.getElementById('words');
    const margin = parseInt(words.style.marginTop || '0px');
    words.style.marginTop = (margin - 35) + 'px';
  }
}

function adjustCursor() {
  const nextLetter = document.querySelector('.letter.current');
  const nextWord = document.querySelector('.word.current');
  const cursor = document.getElementById('cursor');
  if (cursor && (nextLetter || nextWord)) {
    cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 2 + 'px';
    cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + 'px';
  }
}

newGame();