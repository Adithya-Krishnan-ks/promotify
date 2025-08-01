// Don't Tap the Rectangle Game Logic
class DontTapGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.scoreElement = document.getElementById('score');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        
        this.score = 0;
        this.isGameRunning = false;
        this.isPaused = false;
        this.gameInterval = null;
        this.backgroundInterval = null;
        this.speedIncreaseInterval = null;
        this.shapes = [];
        this.currentBackgroundColor = '#f0f0f0';
        this.speedMultiplier = 1;

        // Funny game over messages
        this.gameOverMessages = [
            "You clicked a rectangle! That's exactly what we told you NOT to do! 🤦‍♂️",
            "Rectangle Dodger (lasted 0.3 seconds) - New record in failure! 🏆",
            "Congratulations! You've mastered the art of doing the opposite! 👏",
            "The rectangle sends its regards... 💀",
            "You had ONE job: Don't tap rectangles. ONE JOB! 😤",
            "Even my grandmother would've lasted longer... and she's been gone for years! 👵",
            "The rectangles are laughing at you right now. Can you hear them? 📐",
            "Achievement Unlocked: Professional Rectangle Clicker! 🎮"
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        
        // Change background color every 10 seconds
        this.backgroundInterval = setInterval(() => {
            if (this.isGameRunning && !this.isPaused) {
                this.changeBackgroundColor();
            }
        }, 10000);

        // Increase speed every 4 seconds
        this.speedIncreaseInterval = setInterval(() => {
            if (this.isGameRunning && !this.isPaused) {
                this.speedMultiplier += 0.2;
            }
        }, 4000);
    }
    
    startGame() {
        this.score = 0;
        this.speedMultiplier = 1;
        this.isGameRunning = true;
        this.isPaused = false;
        this.shapes = [];
        
        this.updateScore();
        this.gameArea.innerHTML = '';
        this.gameOverModal.style.display = 'none';
        
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        
        this.gameInterval = setInterval(() => {
            if (!this.isPaused) {
                this.spawnShape();
                this.updateShapes();
            }
        }, 1000);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
    }
    
    spawnShape() {
        if (!this.isGameRunning) return;
        
        const shapeTypes = ['circle', 'triangle', 'star', 'hexagon', 'rectangle'];
        const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        
        const shape = document.createElement('div');
        shape.className = `shape ${shapeType}`;
        
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const x = Math.random() * (gameAreaRect.width - 40);
        const y = -40;
        
        shape.style.left = x + 'px';
        shape.style.top = y + 'px';
        shape.style.width = '30px';
        shape.style.height = '30px';
        
        shape.addEventListener('click', (e) => this.handleShapeClick(e, shapeType));
        
        this.gameArea.appendChild(shape);
        this.shapes.push({
            element: shape,
            type: shapeType,
            y: y,
            speed: (Math.random() * 3 + 2) * this.speedMultiplier
        });
    }
    
    updateShapes() {
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            shape.y += shape.speed;
            shape.element.style.top = shape.y + 'px';
            
            if (shape.y > this.gameArea.offsetHeight) {
                shape.element.remove();
                this.shapes.splice(i, 1);
                
                // Reduce score by -1 for missed shapes
                this.score = Math.max(0, this.score - 1);
                this.updateScore();
            }
        }
    }
    
    handleShapeClick(event, shapeType) {
        event.stopPropagation();
        
        if (shapeType === 'rectangle') {
            this.gameOver();
            return;
        }

        this.score++;
        this.updateScore();
        
        const shapeElement = event.target;
        const shapeIndex = this.shapes.findIndex(s => s.element === shapeElement);
        if (shapeIndex > -1) {
            this.shapes[shapeIndex].element.remove();
            this.shapes.splice(shapeIndex, 1);
        }
        
        this.addClickEffect(event.clientX, event.clientY);
    }
    
    addClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.style.position = 'fixed';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        effect.style.width = '20px';
        effect.style.height = '20px';
        effect.style.background = '#27ae60';
        effect.style.borderRadius = '50%';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '1000';
        effect.style.animation = 'clickEffect 0.5s ease-out forwards';
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 500);
    }
    
    changeBackgroundColor() {
        const colors = ['#ffe6e6', '#e6f3ff', '#e6ffe6', '#fff3e6', '#f3e6ff', '#ffffcc'];
        let newColor;
        do {
            newColor = colors[Math.floor(Math.random() * colors.length)];
        } while (newColor === this.currentBackgroundColor);
        
        this.currentBackgroundColor = newColor;
        this.gameArea.style.background = newColor;
    }
    
    gameOver() {
        this.isGameRunning = false;
        clearInterval(this.gameInterval);
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverMessage.textContent = this.gameOverMessages[Math.floor(Math.random() * this.gameOverMessages.length)];
        this.gameOverModal.style.display = 'block';
        
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        
        this.shapes.forEach(shape => shape.element.remove());
        this.shapes = [];
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
}

// Restart game function
function restartGame() {
    game.startGame();
}

// Add CSS animation for click effect
const style = document.createElement('style');
style.textContent = `
    @keyframes clickEffect {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(3);
            opacity: 0;
        }
    }

    .shape {
        transition: transform 0.1s ease;
        position: absolute;
    }

    .shape:hover {
        transform: scale(1.1);
    }

    .triangle {
        width: 0 !important;
        height: 0 !important;
        border-left: 15px solid transparent;
        border-right: 15px solid transparent;
        border-bottom: 30px solid #45b7d1;
        background: transparent !important;
    }

    .star {
        background: #96ceb4;
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    }

    .hexagon {
        background: #feca57;
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    }

    .circle {
        background: #ff6b6b;
        border-radius: 50%;
    }

    .rectangle {
        background: #4ecdc4;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);

// Initialize game on DOM load
let game;
document.addEventListener('DOMContentLoaded', function() {
    game = new DontTapGame();
});
