document.addEventListener("DOMContentLoaded", function() {
    localStorage.clear();
    const canvas = document.getElementById("radar");
    const ctx = canvas.getContext('2d');
    const blipList = document.getElementById('blip-list');

    // New Radar Size
    const radarSize = 200; // Radius of the radar circle (half of the canvas size)
    const canvasSize = radarSize * 2; // Full canvas width/height

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Radar Line Object
    var line = {
        x: radarSize,
        y: radarSize,
        length: radarSize,
        angle: 0,
        speed: Math.PI / 180,
        end: { x: radarSize, y: 0 },
        draw: function() {
            this.angle += this.speed;
            this.end.x = this.x + this.length * Math.cos(this.angle);
            this.end.y = this.y + this.length * Math.sin(this.angle);

            ctx.save();
            ctx.strokeStyle = "#383";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.end.x, this.end.y);
            ctx.stroke();

            // Check for collisions with balls
            Ball.all.forEach(ball => {
                const distanceToLine = pointToLineDistance(line, this.end, ball);
                const distanceFromLineStart = lineDistance(line, ball);
                const distanceFromLineEnd = lineDistance(this.end, ball);
                if (distanceToLine < 1 && distanceFromLineStart < this.length && distanceFromLineEnd < this.length) {
                    const blip = new Blip(ball.x, ball.y, 0.2);
                    addBlipToTable(blip);
                }
            });

            ctx.restore();
        }
    };

    // Ball Constructor
    function Ball(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = 0;
        this.vy = 0;
        Ball.all.push(this);
    }
    Ball.all = [];
    Ball.prototype = {
        draw: function() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = "#fb0";
            ctx.beginPath();
            ctx.arc(0, 0, this.r, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        remove: function() {
            Ball.all.splice(Ball.all.indexOf(this), 1);
        }
    };

    // Blip Constructor
    function Blip(x, y, t) {
        this.x = x;
        this.y = y;
        this.t = t;
        this.type = getRandomType(); // Randomly set type
        Blip.all.push(this);
        saveBlipToDatabase(this); // Save to localStorage
    }
    Blip.all = [];

    function getRandomType() {
        const types = ['asteroid', 'satellite', 'comet', 'unknown'];
        return types[Math.floor(Math.random() * types.length)];
    }

    function saveBlipToDatabase(blip) {
        let blips = JSON.parse(localStorage.getItem('blipDatabase')) || [];
        blips.push(blip);
        localStorage.setItem('blipDatabase', JSON.stringify(blips));
    }

    function addBlipToTable(blip) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${blip.type}</td>
            <td>${blip.x.toFixed(2)}</td>
            <td>${blip.y.toFixed(2)}</td>
        `;

        blipList.appendChild(row);
    }

    function pointToLineDistance(A, B, P) {
        var normalLength = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
        return Math.abs((P.x - A.x) * (B.y - A.y) - (P.y - A.y) * (B.x - A.x)) / normalLength;
    }

    function lineDistance(A, B) {
        return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    }

    // Initialize canvas
    function main() {
        // Clear display
        ctx.save();
        ctx.fillStyle = "rgba(20, 0, 0, .04)";
        ctx.beginPath();
        ctx.arc(radarSize, radarSize, radarSize, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Update balls
        if (Ball.all.length < 2) {
            for (var i = 0; i < 1; i++) {
                var ball = new Ball(Math.random() * canvasSize, Math.random() * canvasSize, 2);
                ball.vx = Math.random() / 10;
                ball.vy = Math.random() / 10;
            }
        }

        Ball.all.forEach(ball => {
            // Update ball
            ball.x += ball.vx;
            ball.y += ball.vy;
            if (ball.x > canvas.width - ball.r) {
                ball.x = canvas.width - ball.r;
                ball.vx = -Math.abs(ball.vx);
            } else if (ball.x < ball.r) {
                ball.x = ball.r;
                ball.vx = Math.abs(ball.vx);
            }
            if (ball.y > canvas.height - ball.r) {
                ball.y = canvas.height - ball.r;
                ball.vy = -Math.abs(ball.vy);
            } else if (ball.y < ball.r) {
                ball.y = ball.r;
                ball.vy = Math.abs(ball.vy);
            }
        });

        Blip.all.forEach((blip, index) => {
            ctx.save();
            if (blip.t > 0.03) {
                blip.t *= 0.997;
                var col = `rgba(25, 255, 25, ${blip.t})`;
                ctx.fillStyle = col;
                ctx.beginPath();
                ctx.arc(blip.x, blip.y, 2, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            } else if (blip.t <= 0.03) {
                Blip.all.splice(index, 1);
            }
            ctx.restore();
        });

        line.draw();

        ctx.strokeStyle = "rgba(80,80,80, 1)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(radarSize, radarSize, radarSize, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();

        for (var i = 1; i < 5; i++) {
            ctx.strokeStyle = "rgba(30,80,30, 0.5)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(radarSize, radarSize, 40 * i, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.stroke();
        }
    }

    setInterval(main, 1000 / 60); // Adjust frame rate if necessary

    // Load and display saved blips
    function loadBlips() {
        let blips = JSON.parse(localStorage.getItem('blipDatabase')) || [];
        blips.forEach(blip => {
            addBlipToTable(blip);
            Blip.all.push(blip);
        });
    }

    loadBlips(); // Load blips on page load
});
