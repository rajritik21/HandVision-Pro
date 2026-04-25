const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Create an off-screen canvas for persistent drawing
const drawingCanvas = document.createElement("canvas");
const dCtx = drawingCanvas.getContext("2d");

const widthSlider = document.getElementById("videoWidth");
const heightSlider = document.getElementById("videoHeight");
const widthValue = document.getElementById("widthValue");
const heightValue = document.getElementById("heightValue");
const brushSizeSlider = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");

const fingerCountDisplay = document.getElementById("fingerCount");
const handStatusDisplay = document.getElementById("handStatus");
const leftHandCountDisplay = document.getElementById("leftHandCount");
const rightHandCountDisplay = document.getElementById("rightHandCount");

const startBtn = document.getElementById("start-btn");
const canvasBtn = document.getElementById("canvas-btn");
const backBtn = document.getElementById("back-btn");
const clearCanvasBtn = document.getElementById("clear-canvas");
const landingPage = document.getElementById("landing-page");
const permissionError = document.getElementById("permission-error");

const trackingControls = document.getElementById("tracking-controls");
const canvasControls = document.getElementById("canvas-controls");
const statsOverlay = document.getElementById("stats-overlay");
const fingerIndicator = document.getElementById("finger-indicator");

const colorDots = document.querySelectorAll(".color-dot");

let canvasWidth = 800;
let canvasHeight = 600;
let isCameraStarted = false;
let appMode = "tracking"; // "tracking" or "canvas"
let lastX = null;
let lastY = null;
let brushSize = 5;
let brushColor = "#00f2fe";

// For gesture clearing
let clearCounter = 0;
const CLEAR_THRESHOLD = 15; // Number of frames with 5 fingers up to clear

// Initialize dimensions
function updateDimensions() {
    canvasWidth = parseInt(widthSlider.value);
    canvasHeight = parseInt(heightSlider.value);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    drawingCanvas.width = canvasWidth;
    drawingCanvas.height = canvasHeight;
    widthValue.textContent = `${canvasWidth}px`;
    heightValue.textContent = `${canvasHeight}px`;
    resetDrawingStyles();
}

function resetDrawingStyles() {
    dCtx.strokeStyle = brushColor;
    dCtx.lineWidth = brushSize;
    dCtx.lineCap = "round";
    dCtx.lineJoin = "round";
    dCtx.shadowBlur = 10;
    dCtx.shadowColor = brushColor;
}

widthSlider.addEventListener("input", updateDimensions);
heightSlider.addEventListener("input", updateDimensions);
brushSizeSlider.addEventListener("input", (e) => {
    brushSize = parseInt(e.target.value);
    brushSizeValue.textContent = `${brushSize}px`;
    dCtx.lineWidth = brushSize;
});

// Color Selection
colorDots.forEach(dot => {
    dot.addEventListener("click", () => {
        colorDots.forEach(d => d.classList.remove("active"));
        dot.classList.add("active");
        brushColor = dot.dataset.color;
        resetDrawingStyles();
    });
});

clearCanvasBtn.addEventListener("click", () => {
    dCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
});

backBtn.addEventListener("click", () => {
    landingPage.classList.remove("hidden");
    backBtn.classList.add("hidden");
    canvasControls.classList.add("hidden");
    trackingControls.classList.add("hidden");
    statsOverlay.classList.add("hidden");
    fingerIndicator.classList.add("hidden");
    appMode = "tracking"; // Default back to tracking
});

updateDimensions();

// ✋ Initialize MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.8
});

function countFingers(landmarks, isRightHand) {
    const fingerStates = [false, false, false, false, false];
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const indexMCP = landmarks[5];

    if (isRightHand) {
        if (thumbTip.x < thumbIP.x && thumbTip.x < indexMCP.x - 0.02) fingerStates[0] = true;
    } else {
        if (thumbTip.x > thumbIP.x && thumbTip.x > indexMCP.x + 0.02) fingerStates[0] = true;
    }

    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    const mcps = [5, 9, 13, 17];

    for (let i = 0; i < 4; i++) {
        const tip = landmarks[tips[i]];
        const pip = landmarks[pips[i]];
        const mcp = landmarks[mcps[i]];
        if (tip.y < pip.y && tip.y < mcp.y) fingerStates[i + 1] = true;
    }
    return fingerStates;
}

hands.onResults(results => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw camera feed mirrored
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 2. Draw persistent lines (Canvas Mode Only)
    if (appMode === "canvas") {
        ctx.drawImage(drawingCanvas, 0, 0);
    }

    let totalFingers = 0;
    let handCount = 0;
    let leftCount = 0;
    let rightCount = 0;
    
    // Reset indicators
    for(let i=1; i<=10; i++) {
        const dot = document.getElementById(`dot-${i}`);
        if (dot) dot.classList.remove('active');
    }

    if (results.multiHandLandmarks && results.multiHandedness) {
        handCount = results.multiHandLandmarks.length;
        
        results.multiHandLandmarks.forEach((landmarks, index) => {
            const rawLabel = results.multiHandedness[index].label;
            const isRightHand = rawLabel === "Right"; 
            const color = isRightHand ? "#00f2fe" : "#f472b6";

            const fingerStates = countFingers(landmarks, isRightHand);
            const count = fingerStates.filter(state => state).length;
            totalFingers += count;

            if (isRightHand) rightCount = count;
            else leftCount = count;

            // AIR CANVAS LOGIC
            if (appMode === "canvas") {
                // Gesture 1: Drawing (Index up, others down)
                const isWriting = fingerStates[1] && !fingerStates[2] && !fingerStates[3] && !fingerStates[4];
                
                // Gesture 2: Clear Canvas (All 5 fingers up)
                if (count === 5) {
                    clearCounter++;
                    if (clearCounter > CLEAR_THRESHOLD) {
                        dCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                        clearCounter = 0;
                    }
                } else {
                    clearCounter = 0;
                }

                const indexTip = landmarks[8];
                const x = (1 - indexTip.x) * canvas.width;
                const y = indexTip.y * canvas.height;

                if (isWriting) {
                    if (lastX !== null && lastY !== null) {
                        dCtx.beginPath();
                        dCtx.moveTo(lastX, lastY);
                        dCtx.lineTo(x, y);
                        dCtx.stroke();
                    }
                    lastX = x;
                    lastY = y;
                    
                    // Brush cursor
                    ctx.fillStyle = brushColor;
                    ctx.beginPath();
                    ctx.arc(x, y, brushSize/2 + 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#fff";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                } else {
                    lastX = null;
                    lastY = null;
                }
            }

            // Draw skeleton (Always show skeleton but thinner in canvas mode)
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: color, lineWidth: appMode === "canvas" ? 2 : 4 });
            drawLandmarks(ctx, landmarks, { color: "#ffffff", lineWidth: 1, radius: appMode === "canvas" ? 2 : 4 });
            ctx.restore();

            // Update dots only in tracking mode
            if (appMode === "tracking") {
                const dotOffset = isRightHand ? 5 : 0;
                fingerStates.forEach((isUp, fIdx) => {
                    if (isUp) {
                        const dotId = dotOffset + fIdx + 1;
                        const dot = document.getElementById(`dot-${dotId}`);
                        if (dot) dot.classList.add('active');
                    }
                });
                
                // Display count near wrist
                const wrist = landmarks[0];
                const wx = (1 - wrist.x) * canvas.width;
                const wy = wrist.y * canvas.height;
                ctx.fillStyle = color;
                ctx.font = "bold 16px Outfit";
                ctx.textAlign = "center";
                ctx.fillText(`${rawLabel} Hand: ${count}`, wx, wy + 40);
            }
        });
    } else {
        lastX = null;
        lastY = null;
        clearCounter = 0;
    }

    // Update Dashboard Only in Tracking Mode
    if (appMode === "tracking") {
        fingerCountDisplay.textContent = totalFingers;
        leftHandCountDisplay.textContent = leftCount;
        rightHandCountDisplay.textContent = rightCount;
        handStatusDisplay.textContent = handCount > 0 ? `${handCount} Hand${handCount > 1 ? 's' : ''} Tracked` : "Searching...";
    }
});

// 📷 Camera Lifecycle Management
let cameraStream = null;

const camera = new Camera(video, {
    onFrame: async () => {
        await hands.send({ image: video });
    },
    width: 1280,
    height: 720
});

async function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    video.srcObject = null;
}

async function startApp(mode) {
    permissionError.classList.add("hidden");
    
    try {
        const activeBtn = mode === "tracking" ? startBtn : canvasBtn;
        const originalContent = activeBtn.innerHTML;
        activeBtn.disabled = true;
        activeBtn.innerHTML = '<i data-lucide="loader"></i> INITIALIZING...';
        lucide.createIcons();

        // 1. Check for camera permission first
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Stop it immediately after check to allow MediaPipe's Camera to take over if needed,
            // or just keep it. Actually, MediaPipe Camera uses getUserMedia internally.
            // Better to let MediaPipe start it.
            cameraStream.getTracks().forEach(track => track.stop());
        } catch (err) {
            throw new Error("Permission Denied");
        }
        
        await camera.start();
        // Capture the stream created by MediaPipe
        cameraStream = video.srcObject;
        
        appMode = mode;
        landingPage.classList.add("hidden");
        backBtn.classList.remove("hidden");
        
        if (mode === "canvas") {
            canvasControls.classList.remove("hidden");
            trackingControls.classList.add("hidden");
            statsOverlay.classList.add("hidden");
            fingerIndicator.classList.add("hidden");
            hands.setOptions({ maxNumHands: 1 });
        } else {
            canvasControls.classList.add("hidden");
            trackingControls.classList.remove("hidden");
            statsOverlay.classList.remove("hidden");
            fingerIndicator.classList.remove("hidden");
            hands.setOptions({ maxNumHands: 2 });
        }

        activeBtn.disabled = false;
        activeBtn.innerHTML = originalContent;
        lucide.createIcons();

    } catch (err) {
        console.error("Camera Error:", err);
        permissionError.classList.remove("hidden");
        startBtn.disabled = false;
        canvasBtn.disabled = false;
        startBtn.innerHTML = '<i data-lucide="play"></i> START TRACKING';
        canvasBtn.innerHTML = '<i data-lucide="pencil"></i> AIR CANVAS';
        lucide.createIcons();
    }
}

backBtn.addEventListener("click", async () => {
    await stopCamera();
    landingPage.classList.remove("hidden");
    backBtn.classList.add("hidden");
    canvasControls.classList.add("hidden");
    trackingControls.classList.add("hidden");
    statsOverlay.classList.add("hidden");
    fingerIndicator.classList.add("hidden");
    appMode = "tracking";
});

startBtn.addEventListener("click", () => startApp("tracking"));
canvasBtn.addEventListener("click", () => startApp("canvas"));

