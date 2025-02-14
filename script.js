class LivesSystem {
    constructor() {
        this.lives = 3;
        this.heartElements = document.querySelectorAll('#lives-display .heart-life');
    }

    loseLife() {
        if (this.lives > 0) {
            this.lives--;
            const heartToBreak = this.heartElements[this.lives];
            heartToBreak.classList.add('lost');

            // Add shake effect to remaining hearts
            this.heartElements.forEach((heart, index) => {
                if (index < this.lives) {
                    heart.style.animation = 'none';
                    heart.offsetHeight; // Trigger reflow
                    heart.style.animation = 'heartShake 0.5s ease-in-out';
                }
            });

            if (this.lives === 0) {
                // Game over
                setTimeout(() => {
                    alert('Game Over! But I\'d never give up on you! Try again! ❤️');
                    window.location.reload();
                }, 1000);
            }
            return true;
        }
        return false;
    }

    getCurrentLives() {
        return this.lives;
    }
}

class ValentineGame {
    constructor() {
        this.currentStage = 'start-stage';
        this.livesSystem = new LivesSystem();
        this.initializeStages();
    }

    initializeStages() {
        // Initial love button stage
        document.getElementById('start-game').addEventListener('click', () => {
            this.switchStage('start-stage', 'wordle-game');
            if (!this.wordleGame) {
                this.wordleGame = new WordleGame(this.livesSystem, this);
            }
        });
    }

    switchStage(fromStage, toStage) {
        document.getElementById(fromStage).classList.add('hidden');
        document.getElementById(toStage).classList.remove('hidden');
        this.currentStage = toStage;
    }
}

class JumbledLetterGame {
    constructor(livesSystem, parent) {
        this.livesSystem = livesSystem;
        this.parent = parent;
        this.container = document.getElementById('words-container');
        this.checkButton = document.getElementById('check-answer');
        this.correctOrder = ['Will', 'you', 'like', 'leave', 'me'];
        this.words = [...this.correctOrder].sort(() => Math.random() - 0.5);
        this.initializeGame();
    }

    initializeGame() {
        // Create draggable words
        this.words.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'draggable-word';
            wordElement.draggable = true;
            wordElement.textContent = word;
            this.container.appendChild(wordElement);

            // Add drag events
            wordElement.addEventListener('dragstart', () => {
                wordElement.classList.add('dragging');
            });

            wordElement.addEventListener('dragend', () => {
                wordElement.classList.remove('dragging');
            });
        });

        // Add container drag events
        this.container.addEventListener('dragover', e => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            const afterElement = this.getDragAfterElement(e.clientY);
            if (afterElement) {
                this.container.insertBefore(draggable, afterElement);
            } else {
                this.container.appendChild(draggable);
            }
        });

        // Add check button event
        this.checkButton.addEventListener('click', () => this.checkAnswer());
    }

    getDragAfterElement(y) {
        const draggableElements = [...this.container.querySelectorAll('.draggable-word:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    checkAnswer() {
        const currentOrder = [...this.container.querySelectorAll('.draggable-word')]
            .map(word => word.textContent);
        
        const isCorrect = this.correctOrder.every((word, index) => word === currentOrder[index]);
        
        if (isCorrect) {
            alert('Mwah! You got it! 💕');
            // Show final love message
            this.parent.switchStage('jumbled-letter', 'date-game');
            if (!this.parent.dateGame) {
                this.parent.dateGame = new DateGame(this.livesSystem, this.parent);
            }
        } else {
            this.livesSystem.loseLife();
            alert('😾😾😾');
        }
    }
}

class DateGame {
    constructor(livesSystem, parent) {
        this.livesSystem = livesSystem;
        this.parent = parent;
        this.correctDate = '2024-07-21';
        this.currentDate = new Date();
        this.selectedDate = null;
        this.initializeGame();
    }

    initializeGame() {
        this.dateDisplay = document.querySelector('.date-display');
        this.calendarDropdown = document.querySelector('.calendar-dropdown');
        this.currentMonthDisplay = document.querySelector('.current-month');
        this.calendarGrid = document.querySelector('.calendar-grid');
        
        this.dateDisplay.addEventListener('click', () => this.toggleCalendar());
        document.querySelector('.prev-month').addEventListener('click', () => this.changeMonth(-1));
        document.querySelector('.next-month').addEventListener('click', () => this.changeMonth(1));
        document.getElementById('check-date').addEventListener('click', () => this.checkDate());
        
        // Close calendar when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.fancy-date-picker')) {
                this.calendarDropdown.classList.add('hidden');
            }
        });

        this.renderCalendar();
    }

    toggleCalendar() {
        this.calendarDropdown.classList.toggle('hidden');
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month display
        const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
        this.currentMonthDisplay.textContent = monthName;

        // Clear grid
        this.calendarGrid.innerHTML = '';

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty cells for days before first of month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            this.calendarGrid.appendChild(emptyDay);
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Check if this is the selected date
            const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (currentDateString === this.selectedDate) {
                dayElement.classList.add('selected');
            }

            dayElement.addEventListener('click', () => this.selectDate(year, month, day));
            this.calendarGrid.appendChild(dayElement);
        }
    }

    selectDate(year, month, day) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        this.selectedDate = dateString;
        document.getElementById('special-date').value = dateString;
        
        // Update display
        const formattedDate = new Date(year, month, day).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.querySelector('.selected-date').textContent = formattedDate;
        
        // Hide calendar
        this.calendarDropdown.classList.add('hidden');
        
        // Re-render to update selected state
        this.renderCalendar();
    }

    checkDate() {
        const selectedDate = document.getElementById('special-date').value;
        if (selectedDate === this.correctDate) {
            alert('Yes! That was the magical day! 💖');
            this.parent.switchStage('date-game', 'love-message');
        } else {
            this.livesSystem.loseLife();
            alert('Not quite! Try another special date 💔');
        }
    }
}

class WordleGame {
    constructor(livesSystem, parent) {
        this.livesSystem = livesSystem;
        this.parent = parent;
        // Valentine's themed words
        this.words = ['HEART', 'SWEET', 'CUPID', 'LOVES'];
        this.word = this.words[Math.floor(Math.random() * this.words.length)];
        this.currentRow = 0;
        this.currentTile = 0;
        this.gameOver = false;
        
        this.initializeBoard();
        this.initializeKeyboard();
        this.addKeyboardListeners();
    }

    initializeBoard() {
        const board = document.getElementById('board');
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            for (let j = 0; j < 5; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                row.appendChild(tile);
            }
            board.appendChild(row);
        }
    }

    initializeKeyboard() {
        const keyboard = document.getElementById('keyboard');
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
        ];

        rows.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            
            row.forEach(key => {
                const button = document.createElement('button');
                button.textContent = key;
                button.className = 'key';
                if (key === 'Enter' || key === '⌫') {
                    button.classList.add('wide');
                }
                button.setAttribute('data-key', key);
                keyboardRow.appendChild(button);
            });
            
            keyboard.appendChild(keyboardRow);
        });
    }

    addKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            if (e.key === 'Enter') {
                this.checkRow();
            } else if (e.key === 'Backspace') {
                this.deleteLetter();
            } else if (/^[A-Za-z]$/.test(e.key)) {
                this.addLetter(e.key.toUpperCase());
            }
        });

        document.getElementById('keyboard').addEventListener('click', (e) => {
            if (!e.target.matches('button')) return;
            
            const key = e.target.getAttribute('data-key');
            if (key === 'Enter') {
                this.checkRow();
            } else if (key === '⌫') {
                this.deleteLetter();
            } else {
                this.addLetter(key);
            }
        });
    }

    addLetter(letter) {
        if (this.currentTile < 5 && this.currentRow < 6) {
            const row = document.querySelector('.row:nth-child(' + (this.currentRow + 1) + ')');
            const tile = row.children[this.currentTile];
            tile.textContent = letter;
            tile.setAttribute('data-letter', letter);
            this.currentTile++;
        }
    }

    deleteLetter() {
        if (this.currentTile > 0) {
            this.currentTile--;
            const row = document.querySelector('.row:nth-child(' + (this.currentRow + 1) + ')');
            const tile = row.children[this.currentTile];
            tile.textContent = '';
            tile.removeAttribute('data-letter');
        }
    }

    checkRow() {
        if (this.currentTile !== 5) return;

        const row = document.querySelector('.row:nth-child(' + (this.currentRow + 1) + ')');
        const tiles = [...row.children];
        const guess = tiles.map(tile => tile.getAttribute('data-letter')).join('');
        const wordArray = this.word.split('');
        
        let correctCount = 0;
        let wrongPositionCount = 0;
        let remainingLetters = [...wordArray];

        // First pass: mark correct letters
        tiles.forEach((tile, index) => {
            const letter = tile.getAttribute('data-letter');
            if (letter === wordArray[index]) {
                tile.classList.add('correct');
                correctCount++;
                this.fadeKeyboardLetter(letter);
                remainingLetters[index] = null;
            }
        });

        // Second pass: mark wrong position and wrong letters
        tiles.forEach((tile, index) => {
            if (tile.classList.contains('correct')) return;

            const letter = tile.getAttribute('data-letter');
            const letterIndex = remainingLetters.indexOf(letter);

            if (letterIndex !== -1) {
                tile.classList.add('wrong-position');
                wrongPositionCount++;
                remainingLetters[letterIndex] = null;
            } else {
                tile.classList.add('wrong');
                this.fadeKeyboardLetter(letter);
            }
        });

        // Check if no letters are correct or in wrong position
        if (correctCount === 0 && wrongPositionCount === 0) {
            console.log('You\'re losing a life! 😿');
            this.livesSystem.loseLife();
        }

        if (guess === this.word) {
            setTimeout(() => {
                alert('Congratulations! You found the word of love! 💖');
                // Show jumbled letter puzzle
                this.parent.switchStage('wordle-game', 'jumbled-letter');
                if (!this.parent.jumbledGame) {
                    this.parent.jumbledGame = new JumbledLetterGame(this.livesSystem, this.parent);
                }
            }, 500);
            this.gameOver = true;
            return;
        }

        if (this.currentRow === 5) {
            setTimeout(() => {
                alert('Don\'t give up on love! Mwah! The word was ' + this.word);
            }, 500);
            this.gameOver = true;
            return;
        }

        this.currentRow++;
        this.currentTile = 0;
    }

    fadeKeyboardLetter(letter) {
        const key = document.querySelector(`button[data-key="${letter}"]`);
        if (key) {
            key.classList.add('faded');
        }
    }
}

class MemoryGallery {
    constructor() {
        this.gallery = document.getElementById('memory-gallery');
        this.currentImage = document.getElementById('current-memory');
        this.images = ['images/IMG_2663.png','images/IMG_7325.jpeg', 'images/IMG_4138.jpeg'];
        this.currentIndex = 0;
        this.initializeGallery();
    }

    initializeGallery() {
        document.getElementById('start-wordle').addEventListener('click', () => {
            document.getElementById('love-message').classList.add('hidden');
            this.gallery.classList.remove('hidden');
            this.showNextImage();
        });
    }

    showNextImage() {
        if (this.currentIndex < this.images.length) {
            this.currentImage.src = this.images[this.currentIndex];
            this.currentImage.style.animation = 'none';
            this.currentImage.offsetHeight; // Trigger reflow
            this.currentImage.style.animation = 'revealImage 1.5s ease-out forwards';
            
            this.currentIndex++;
            if (this.currentIndex < this.images.length) {
                setTimeout(() => this.showNextImage(), 3000); // Show next image after 3 seconds
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Memory Gallery
    new MemoryGallery();
    
    // Egg animation
    const egg = document.getElementById("egg-overall");
    const eggTl = gsap.timeline({repeat: -1});
    
    // Egg wobble and blink animation
    eggTl.to(egg, {
        duration: 1,
        rotation: 5,
        transformOrigin: "50% 100%",
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1
    });

    // Avocado animation
    const avocado = document.getElementById("avocado-overall");
    const avocadoTl = gsap.timeline({repeat: -1});
    
    // Avocado bounce and rotate animation
    avocadoTl.to(avocado, {
        duration: 1.2,
        y: -10,
        rotation: -3,
        transformOrigin: "50% 100%",
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1
    });

    // Eyes blinking animation for both characters
    const eyes = ["#EggLeftEye", "#EggRightEye", "#AvocadoLeftEye", "#AvocadoRightEye"];
    eyes.forEach(eye => {
        gsap.to(eye, {
            duration: 0.1,
            scaleY: 0.1,
            repeat: -1,
            yoyo: true,
            repeatDelay: 3,
            transformOrigin: "50% 50%"
        });
    });

    // Text animation
    const text = document.querySelector("#text");
    if (text) {
        const splitText = new SplitText("#text", {type: "chars"});
        const chars = splitText.chars;
        
        gsap.from(chars, {
            duration: 0.08,
            opacity: 0,
            stagger: 0.08,
            ease: "power1.in",
            delay: 0.1
        });
    }

    // Heart floating animation
    gsap.to("#Heart", {
        duration: 1.5,
        y: -50,
        x: 10,
        opacity: 0,
        repeat: -1,
        ease: "power1.inOut"
    });
});

// Start the Valentine's game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new ValentineGame();
});

$( document ).ready(function() {
    var scaleCurve = mojs.easing.path('M0,100 L25,99.9999983 C26.2328835,75.0708847 19.7847843,0 100,0');
       var el = document.querySelector('.heartbutton'),
        // mo.js timeline obj
        timeline = new mojs.Timeline(),
    
        // tweens for the animation:
    
        // burst animation
        tween1 = new mojs.Burst({
            parent: el,
      radius:   { 0: 100 },
      angle:    { 0: 45 },
      y: -10,
      count:    10,
       radius:       100,
      children: {
        shape:        'circle',
        radius:       30,
        fill:         [ 'red', 'white' ],
        strokeWidth:  15,
        duration:     500,
      }
        });
    
    
        tween2 = new mojs.Tween({
            duration : 900,
            onUpdate: function(progress) {
                var scaleProgress = scaleCurve(progress);
                el.style.WebkitTransform = el.style.transform = 'scale3d(' + scaleProgress + ',' + scaleProgress + ',1)';
            }
        });
              tween3 = new mojs.Burst({
            parent: el,
      radius:   { 0: 100 },
      angle:    { 0: -45 },
      y: -10,
      count:    10,
       radius:       125,
      children: {
        shape:        'circle',
        radius:       30,
        fill:         [ 'white', 'red' ],
        strokeWidth:  15,
        duration:     400,
      }
        });
    
    // add tweens to timeline:
    timeline.add(tween1, tween2, tween3);
    
    
    // when clicking the button start the timeline/animation:
    $( ".heartbutton" ).click(function() {
        if ($(this).hasClass('active')){
            $(this).removeClass('active');
        }else{
      timeline.play();
      $(this).addClass('active');
        }
    });
    
    
    });
