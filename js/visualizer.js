// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Set light theme as default if no preference is saved
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        // Keep dark theme if explicitly saved
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        // Default to light theme
        document.body.classList.add('light-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('light-theme');
        
        // Update icon
        if (document.body.classList.contains('light-theme')) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        }
        
        // If any visualizations are currently shown, redraw them to update colors
        if (document.getElementById('1d-naive-canvas').childNodes.length > 0) {
            draw1DArrays();
        }
        if (document.getElementById('2d-naive-canvas').childNodes.length > 0) {
            draw2DMatrices();
        }
        if (document.getElementById('3d-naive-canvas').childNodes.length > 0) {
            draw3DVolumes();
        }
    });
});

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    console.log("1D canvas element exists:", !!document.getElementById('1d-naive-canvas'));
    // Navigation
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('section.visualization-container');
    
    // Tab Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(link => link.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // Initialize visualizations
    initialize1DVisualization();
    initialize2DVisualization();
    initialize3DVisualization();
});

// 1D Visualization
function initialize1DVisualization() {
    // DOM Elements
    const arraySizeSlider = document.getElementById('1d-array-size');
    const arraySizeValue = document.getElementById('1d-array-size-value');
    const kernelSizeSlider = document.getElementById('1d-kernel-size');
    const kernelSizeValue = document.getElementById('1d-kernel-size-value');
    const tileSizeSlider = document.getElementById('1d-tile-size');
    const tileSizeValue = document.getElementById('1d-tile-size-value');
    const operationSelect = document.getElementById('1d-operation');
    const randomButton = document.getElementById('1d-random');
    const playButton = document.getElementById('1d-play');
    const stepButton = document.getElementById('1d-step');
    const resetButton = document.getElementById('1d-reset');
    
    // Canvas contexts
    const naiveCanvas = document.getElementById('1d-naive-canvas');
    const tiledCanvas = document.getElementById('1d-tiled-canvas');
    const outputCanvas = document.getElementById('1d-output-visualization');
    
    // State variables
    let arraySize = parseInt(arraySizeSlider.value);
    let kernelSize = Math.min(parseInt(kernelSizeSlider.value), arraySize);
    
    // Update kernel slider if needed
    if (kernelSize !== parseInt(kernelSizeSlider.value)) {
        kernelSizeSlider.value = kernelSize;
    }
    
    // Update displayed values
    arraySizeValue.textContent = arraySize;
    kernelSizeValue.textContent = kernelSize;
    
    let tileSize = parseInt(tileSizeSlider.value);
    let operation = operationSelect.value;
    let inputArray = [];
    let kernelArray = [];
    let naiveOutputArray = [];
    let tiledOutputArray = [];
    let naiveCurrentStep = {x: 0, k: 0};
    let tiledCurrentStep = {tile: 0, x: 0, k: 0};
    let animationInterval = null;
    let isAnimating = false;
    
    // Initialize the arrays
    function initializeArrays() {
        // Ensure kernel size is valid
        kernelSize = Math.min(kernelSize, arraySize);
        
        // Generate random input array
        inputArray = Array.from({length: arraySize}, () => Math.floor(Math.random() * 10));
        
        // Generate random kernel array
        kernelArray = Array.from({length: kernelSize}, () => Math.floor(Math.random() * 5));
        
        // Initialize output arrays - ensure they have proper size
        const outputSize = Math.max(1, arraySize - kernelSize + 1);
        naiveOutputArray = Array(outputSize).fill(0);
        tiledOutputArray = Array(outputSize).fill(0);
        
        // Reset step trackers
        naiveCurrentStep = {x: 0, k: 0};
        tiledCurrentStep = {tile: 0, x: 0, k: 0};
    }
    
    // Draw 1D array visualization
    function draw1DArrays() {
        // Clear canvases
        while (naiveCanvas.firstChild) naiveCanvas.removeChild(naiveCanvas.firstChild);
        while (tiledCanvas.firstChild) tiledCanvas.removeChild(tiledCanvas.firstChild);
        
        // Clear output canvases and kernel visualization
        const naiveOutputCanvas = document.getElementById('1d-naive-output-visualization');
        const tiledOutputCanvas = document.getElementById('1d-tiled-output-visualization');
        const kernelVis = document.getElementById('1d-kernel-visualization');
        
        while (naiveOutputCanvas.firstChild) naiveOutputCanvas.removeChild(naiveOutputCanvas.firstChild);
        while (tiledOutputCanvas.firstChild) tiledOutputCanvas.removeChild(tiledOutputCanvas.firstChild);
        while (kernelVis.firstChild) kernelVis.removeChild(kernelVis.firstChild);
        
        // Calculate cell size
        const cellSize = Math.min(naiveCanvas.clientWidth / arraySize, 30);
        
        // Create array containers
        const naiveInputContainer = document.createElement('div');
        naiveInputContainer.className = 'input-array';
        const naiveKernelContainer = document.createElement('div');
        naiveKernelContainer.className = 'kernel-array';
        
        const tiledInputContainer = document.createElement('div');
        tiledInputContainer.className = 'input-array';
        const tiledKernelContainer = document.createElement('div');
        tiledKernelContainer.className = 'kernel-array';
        
        const naiveOutputContainer = document.createElement('div');
        naiveOutputContainer.className = 'output-array';
        
        const tiledOutputContainer = document.createElement('div');
        tiledOutputContainer.className = 'output-array';
        
        // Draw kernel visualization
        const kernelContainer = document.createElement('div');
        kernelContainer.className = 'kernel-display';
        
        // Add original kernel values to the box
        for (let i = 0; i < kernelSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell kernel';
            cell.style.width = `${cellSize * 1.5}px`;
            cell.style.height = `${cellSize * 1.5}px`;
            cell.textContent = kernelArray[i];
            kernelContainer.appendChild(cell);
        }
        
        // Add note about kernel flipping for convolution
        if (operation === 'convolution') {
            const flipNote = document.createElement('div');
            flipNote.className = 'kernel-flip-note';
            flipNote.textContent = '(Kernel is flipped during convolution)';
            kernelVis.appendChild(kernelContainer);
            kernelVis.appendChild(flipNote);
        } else {
            kernelVis.appendChild(kernelContainer);
        }
        
        // Draw naive implementation
        for (let i = 0; i < arraySize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${Math.max(14, cellSize * 0.7)}px`;
            cell.textContent = inputArray[i];
            
            // Highlight active elements for naive implementation
            if (naiveCurrentStep.x <= i && i < naiveCurrentStep.x + kernelSize) {
                if (i === naiveCurrentStep.x + naiveCurrentStep.k) {
                    cell.classList.add('active');
                }
                cell.classList.add('kernel');
            }
            
            naiveInputContainer.appendChild(cell);
        }
        
        // Draw kernel for naive implementation
        for (let i = 0; i < kernelSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell kernel';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            
            // For convolution, flip the kernel
            const kernelIndex = operation === 'convolution' ? kernelSize - 1 - i : i;
            cell.textContent = kernelArray[kernelIndex];
            
            if (i === naiveCurrentStep.k) {
                cell.classList.add('active');
            }
            
            naiveKernelContainer.appendChild(cell);
        }
        
        // Draw tiled implementation
        const numTiles = Math.ceil(arraySize / tileSize);
        
        for (let i = 0; i < arraySize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${Math.max(14, cellSize * 0.7)}px`;
            cell.textContent = inputArray[i];
            
            // Add tile background
            const tileIndex = Math.floor(i / tileSize);
            if (tileIndex === tiledCurrentStep.tile) {
                cell.classList.add('tile');
            }
            
            // Highlight active elements for tiled implementation
            if (tiledCurrentStep.x <= i && i < tiledCurrentStep.x + kernelSize) {
                if (i === tiledCurrentStep.x + tiledCurrentStep.k) {
                    cell.classList.add('active');
                }
                cell.classList.add('kernel');
            }
            
            tiledInputContainer.appendChild(cell);
        }
        
        // Draw kernel for tiled implementation
        for (let i = 0; i < kernelSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell kernel';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            
            // For convolution, flip the kernel
            const kernelIndex = operation === 'convolution' ? kernelSize - 1 - i : i;
            cell.textContent = kernelArray[kernelIndex];
            
            if (i === tiledCurrentStep.k) {
                cell.classList.add('active');
            }
            
            tiledKernelContainer.appendChild(cell);
        }
        
        // Draw naive output array
        for (let i = 0; i < naiveOutputArray.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell output';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${Math.max(14, cellSize * 0.7)}px`;
            cell.textContent = naiveOutputArray[i];
            
            // Highlight currently computed output
            if (naiveCurrentStep.x === i && naiveCurrentStep.k === kernelSize - 1) {
                cell.classList.add('active');
            }
            
            naiveOutputContainer.appendChild(cell);
        }
        
        // Draw tiled output array
        for (let i = 0; i < tiledOutputArray.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell output';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${Math.max(14, cellSize * 0.7)}px`;
            cell.textContent = tiledOutputArray[i];
            
            // Highlight currently computed output
            const currentTileStart = tiledCurrentStep.tile * tileSize;
            const relativeX = tiledCurrentStep.x - currentTileStart;
            if (tiledCurrentStep.x === i && tiledCurrentStep.k === kernelSize - 1) {
                cell.classList.add('active');
            }
            
            tiledOutputContainer.appendChild(cell);
        }
        
        // Add elements to canvases
        naiveCanvas.appendChild(naiveInputContainer);
        naiveCanvas.appendChild(naiveKernelContainer);
        naiveOutputCanvas.appendChild(naiveOutputContainer);
        
        tiledCanvas.appendChild(tiledInputContainer);
        tiledCanvas.appendChild(tiledKernelContainer);
        tiledOutputCanvas.appendChild(tiledOutputContainer);
    }
    
    // Perform one step of naive convolution/cross-correlation
    function naiveStep() {
        if (naiveCurrentStep.x >= arraySize) {
            return false; // Computation complete
        }
        
        // Get current position
        const {x, k} = naiveCurrentStep;
        
        // Update output at current position
        const kernelIdx = operation === 'convolution' ? kernelSize - 1 - k : k;
        let sum = 0;
        for (let i = 0; i < kernelSize; i++) {
            sum += inputArray[x + i] * kernelArray[kernelIdx];
        }
        naiveOutputArray[x] = sum;
        
        // Move to next position
        naiveCurrentStep.k++;
        if (naiveCurrentStep.k >= kernelSize) {
            naiveCurrentStep.k = 0;
            naiveCurrentStep.x++;
        }
        
        // Check if we've completed computing the current output element
        if (naiveCurrentStep.k >= kernelSize - 1) {
            // Compute final output value
            let sum = 0;
            for (let k = 0; k < kernelSize; k++) {
                const kernelIndex = operation === 'convolution' ? kernelSize - 1 - k : k;
                sum += inputArray[naiveCurrentStep.x + k] * kernelArray[kernelIndex];
            }
            naiveOutputArray[naiveCurrentStep.x] = sum;
        }
        
        return true; // Still computing
    }
    
    // Function to go back one step in the naive implementation
    function naiveBackStep() {
        // If we're at the beginning or before of the first step, do nothing
        if (naiveCurrentStep.x === 0 && naiveCurrentStep.k === 0) {
            return;
        }
        
        // Move back one kernel position
        naiveCurrentStep.k--;
        
        // If we've moved before the start of the kernel
        if (naiveCurrentStep.k < 0) {
            // Move to the previous window position
            naiveCurrentStep.x--;
            // And to the last kernel position
            naiveCurrentStep.k = kernelSize - 1;
            
            // If we've also moved back to a previous output calculation
            if (naiveCurrentStep.x < 0) {
                // Start at the beginning
                naiveCurrentStep.x = 0;
                naiveCurrentStep.k = 0;
            }
        }
    }
    
    // Perform one step of tiled convolution/cross-correlation
    function tiledStep() {
        if (tiledCurrentStep.tile >= Math.ceil(arraySize / tileSize)) {
            return false; // Computation complete
        }
        
        // Get current position
        const {tile, x, k} = tiledCurrentStep;
        
        // Check if current position is valid
        if (x < arraySize && x + k < arraySize) {
            // Update output at current position
            const kernelIdx = operation === 'convolution' ? kernelSize - 1 - k : k;
            let sum = 0;
            for (let i = 0; i < kernelSize; i++) {
                sum += inputArray[x + i] * kernelArray[kernelIdx];
            }
            tiledOutputArray[x] = sum;
        }
        
        // Move to next position
        tiledCurrentStep.k++;
        if (tiledCurrentStep.k >= kernelSize) {
            tiledCurrentStep.k = 0;
            tiledCurrentStep.x++;
            
            // Check if we've completed computing the current output element
            if (tiledCurrentStep.k >= kernelSize - 1) {
                // Compute final output value if within bounds
                let sum = 0;
                for (let k = 0; k < kernelSize; k++) {
                    const kernelIndex = operation === 'convolution' ? kernelSize - 1 - k : k;
                    sum += inputArray[tiledCurrentStep.x + k] * kernelArray[kernelIndex];
                }
                
                const outputIndex = tiledCurrentStep.x;
                if (outputIndex < arraySize - kernelSize + 1) {
                    tiledOutputArray[outputIndex] = sum;
                }
            }
            
            // Check if we've processed all elements in this tile
            const tileEnd = Math.min((tile + 1) * tileSize, arraySize);
            if (tiledCurrentStep.x >= tileEnd) {
                tiledCurrentStep.x = tile * tileSize;
                tiledCurrentStep.tile++;
            }
        }
        
        return tiledCurrentStep.tile < Math.ceil(arraySize / tileSize);
    }
    
    // Function to go back one step in the tiled implementation
    function tiledBackStep() {
        // If we're at the beginning or before of the first step, do nothing
        if (tiledCurrentStep.tile === 0 && tiledCurrentStep.x === 0 && tiledCurrentStep.k === 0) {
            return;
        }
        
        // Move back one kernel position
        tiledCurrentStep.k--;
        
        // If we've moved before the start of the kernel
        if (tiledCurrentStep.k < 0) {
            // Move to the previous window position within the current tile
            tiledCurrentStep.x--;
            // And to the last kernel position
            tiledCurrentStep.k = kernelSize - 1;
            
            // If we've moved before the current tile's starting position
            const tileStart = tiledCurrentStep.tile * tileSize;
            if (tiledCurrentStep.x < tileStart) {
                // If there are previous tiles
                if (tiledCurrentStep.tile > 0) {
                    // Move to the previous tile
                    tiledCurrentStep.tile--;
                    // And to its last window position
                    const newTileStart = tiledCurrentStep.tile * tileSize;
                    const maxX = Math.min(newTileStart + tileSize - kernelSize, arraySize - kernelSize);
                    tiledCurrentStep.x = maxX;
                } else {
                    // If we're already at the first tile, reset to the beginning
                    tiledCurrentStep.tile = 0;
                    tiledCurrentStep.x = 0;
                    tiledCurrentStep.k = 0;
                }
            }
        }
    }
    
    // Run animation
    function animate() {
        if (!isAnimating) return;
        
        const naiveHasMore = naiveStep();
        const tiledHasMore = tiledStep();
        
        draw1DArrays();
        
        if (!naiveHasMore && !tiledHasMore) {
            stopAnimation();
        }
    }
    
    // Start animation
    function startAnimation() {
        if (isAnimating) return;
        
        isAnimating = true;
        playButton.textContent = 'Pause';
        animationInterval = setInterval(animate, 500);
    }
    
    // Stop animation
    function stopAnimation() {
        if (!isAnimating) return;
        
        isAnimating = false;
        playButton.textContent = 'Play Animation';
        clearInterval(animationInterval);
    }
    
    // Reset visualization
    function resetVisualization() {
        stopAnimation();
        
        // Reset output arrays
        naiveOutputArray.fill(0);
        tiledOutputArray.fill(0);
        
        // Reset step trackers
        naiveCurrentStep = {x: 0, k: 0};
        tiledCurrentStep = {tile: 0, x: 0, k: 0};
        
        draw1DArrays();
    }
    
    // Event listeners
    arraySizeSlider.addEventListener('input', function() {
        arraySize = parseInt(this.value);
        arraySizeValue.textContent = arraySize;
        
        // Ensure kernel size doesn't exceed array size
        if (kernelSize > arraySize) {
            kernelSize = arraySize;
            kernelSizeSlider.value = kernelSize;
            kernelSizeValue.textContent = kernelSize;
        }
        
        resetVisualization();
        initializeArrays();
        draw1DArrays();
    });
    
    kernelSizeSlider.addEventListener('input', function() {
        // Ensure kernel size doesn't exceed array size
        kernelSize = Math.min(parseInt(this.value), arraySize);
        kernelSizeValue.textContent = kernelSize;
        
        // Update slider value if it was constrained
        if (parseInt(this.value) !== kernelSize) {
            this.value = kernelSize;
        }
        
        resetVisualization();
        initializeArrays();
        draw1DArrays();
    });
    
    tileSizeSlider.addEventListener('input', function() {
        tileSize = parseInt(this.value);
        tileSizeValue.textContent = tileSize;
        resetVisualization();
        tiledCurrentStep = {tile: 0, x: 0, k: 0};
        draw1DArrays();
    });
    
    operationSelect.addEventListener('change', function() {
        operation = this.value;
        resetVisualization();
        draw1DArrays();
    });
    
    randomButton.addEventListener('click', function() {
        resetVisualization();
        initializeArrays();
        draw1DArrays();
    });
    
    playButton.addEventListener('click', function() {
        if (isAnimating) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });
    
    stepButton.addEventListener('click', function() {
        naiveStep();
        tiledStep();
        draw1DArrays();
    });
    
    // Add event listener for rewind button
    const rwdButton = document.getElementById('1d-rwd');
    
    // Rewind button click handler
    rwdButton.addEventListener('click', function() {
        naiveBackStep();
        tiledBackStep();
        draw1DArrays();
    });
    
    resetButton.addEventListener('click', resetVisualization);
    
    // Initialize
    initializeArrays();
    draw1DArrays();
}

// 2D Visualization
function initialize2DVisualization() {
    // DOM Elements
    const matrixSizeSlider = document.getElementById('2d-matrix-size');
    const matrixSizeValue = document.getElementById('2d-matrix-size-value');
    const kernelSizeSlider = document.getElementById('2d-kernel-size');
    const kernelSizeValue = document.getElementById('2d-kernel-size-value');
    const tileSizeSlider = document.getElementById('2d-tile-size');
    const tileSizeValue = document.getElementById('2d-tile-size-value');
    const operationSelect = document.getElementById('2d-operation');
    const randomButton = document.getElementById('2d-random');
    const playButton = document.getElementById('2d-play');
    const stepButton = document.getElementById('2d-step');
    const resetButton = document.getElementById('2d-reset');
    
    // Canvas contexts
    const naiveCanvas = document.getElementById('2d-naive-canvas');
    const tiledCanvas = document.getElementById('2d-tiled-canvas');
    const outputCanvas = document.getElementById('2d-output-visualization');
    
    // State variables
    let matrixSize = parseInt(matrixSizeSlider.value);
    let kernelSize = parseInt(kernelSizeSlider.value);
    let tileSize = parseInt(tileSizeSlider.value);
    let operation = operationSelect.value;
    let inputMatrix = [];
    let kernelMatrix = [];
    let naiveOutputMatrix = [];
    let tiledOutputMatrix = [];
    let naiveCurrentStep = {x: 0, y: 0, kx: 0, ky: 0};
    let tiledCurrentStep = {tileX: 0, tileY: 0, x: 0, y: 0, kx: 0, ky: 0};
    let animationInterval = null;
    let isAnimating = false;
    
    // Initialize the matrices
    function initializeMatrices() {
        // Generate random input matrix
        inputMatrix = Array.from({length: matrixSize}, () => 
            Array.from({length: matrixSize}, () => Math.floor(Math.random() * 10))
        );
        
        // Generate random kernel matrix
        kernelMatrix = Array.from({length: kernelSize}, () => 
            Array.from({length: kernelSize}, () => Math.floor(Math.random() * 5))
        );
        
        // Initialize output matrices
        const outputSize = matrixSize - kernelSize + 1;
        naiveOutputMatrix = Array.from({length: outputSize}, () => 
            Array(outputSize).fill(0)
        );
        tiledOutputMatrix = Array.from({length: outputSize}, () => 
            Array(outputSize).fill(0)
        );
        
        // Reset step trackers
        naiveCurrentStep = {x: 0, y: 0, kx: 0, ky: 0};
        tiledCurrentStep = {tileX: 0, tileY: 0, x: 0, y: 0, kx: 0, ky: 0};
    }
    
    // Draw 2D matrix visualization
    function draw2DMatrices() {
        // Clear canvases
        while (naiveCanvas.firstChild) naiveCanvas.removeChild(naiveCanvas.firstChild);
        while (tiledCanvas.firstChild) tiledCanvas.removeChild(tiledCanvas.firstChild);
        
        // Clear output visualizations
        const naiveOutputVis = document.getElementById('2d-naive-output-visualization');
        const tiledOutputVis = document.getElementById('2d-tiled-output-visualization');
        const kernelVis = document.getElementById('2d-kernel-visualization');
        
        while (naiveOutputVis.firstChild) naiveOutputVis.removeChild(naiveOutputVis.firstChild);
        while (tiledOutputVis.firstChild) tiledOutputVis.removeChild(tiledOutputVis.firstChild);
        while (kernelVis.firstChild) kernelVis.removeChild(kernelVis.firstChild);
        
        // Calculate cell size
        const cellSize = Math.min(
            Math.min(naiveCanvas.clientWidth, naiveCanvas.clientHeight) / matrixSize,
            30
        ) * 1.2; // Apply a 1.2x multiplier to make cells larger
        
        // Draw kernel visualization
        const kernelContainer = document.createElement('div');
        kernelContainer.className = 'kernel-display';
        kernelContainer.style.display = 'grid';
        kernelContainer.style.gridTemplateColumns = `repeat(${kernelSize}, ${cellSize * 1.5}px)`;
        kernelContainer.style.gap = '2px';
        
        for (let y = 0; y < kernelSize; y++) {
            for (let x = 0; x < kernelSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell kernel';
                cell.style.width = `${cellSize * 1.5}px`;
                cell.style.height = `${cellSize * 1.5}px`;
                cell.textContent = kernelMatrix[y][x];
                kernelContainer.appendChild(cell);
            }
        }
        
        // Add note about kernel flipping for convolution
        if (operation === 'convolution') {
            const flipNote = document.createElement('div');
            flipNote.className = 'kernel-flip-note';
            flipNote.textContent = '(Kernel is flipped during convolution)';
            kernelVis.appendChild(kernelContainer);
            kernelVis.appendChild(flipNote);
        } else {
            kernelVis.appendChild(kernelContainer);
        }
        
        // Draw naive implementation
        const naiveMatrixContainer = document.createElement('div');
        naiveMatrixContainer.style.display = 'grid';
        naiveMatrixContainer.style.gridTemplateColumns = `repeat(${matrixSize}, ${cellSize}px)`;
        naiveMatrixContainer.style.gap = '2px';
        
        for (let y = 0; y < matrixSize; y++) {
            for (let x = 0; x < matrixSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.fontSize = `${Math.max(14, cellSize * 0.7)}px`;
                cell.textContent = inputMatrix[y][x];
                
                // Highlight kernel area for naive implementation
                if (naiveCurrentStep.y <= y && y < naiveCurrentStep.y + kernelSize &&
                    naiveCurrentStep.x <= x && x < naiveCurrentStep.x + kernelSize) {
                    cell.classList.add('kernel');
                    
                    // Highlight active element
                    if (y === naiveCurrentStep.y + naiveCurrentStep.ky && 
                        x === naiveCurrentStep.x + naiveCurrentStep.kx) {
                        cell.classList.add('active');
                    }
                }
                
                naiveMatrixContainer.appendChild(cell);
            }
        }
        
        // Draw tiled implementation
        const tiledMatrixContainer = document.createElement('div');
        tiledMatrixContainer.style.display = 'grid';
        tiledMatrixContainer.style.gridTemplateColumns = `repeat(${matrixSize}, ${cellSize}px)`;
        tiledMatrixContainer.style.gap = '2px';
        
        for (let y = 0; y < matrixSize; y++) {
            for (let x = 0; x < matrixSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.fontSize = `${Math.max(14, cellSize * 0.7)}px`;
                cell.textContent = inputMatrix[y][x];
                
                // Add tile background
                const tileX = Math.floor(x / tileSize);
                const tileY = Math.floor(y / tileSize);
                if (tileX === tiledCurrentStep.tileX && tileY === tiledCurrentStep.tileY) {
                    cell.classList.add('tile');
                }
                
                // Highlight kernel area for tiled implementation
                if (tiledCurrentStep.y <= y && y < tiledCurrentStep.y + kernelSize &&
                    tiledCurrentStep.x <= x && x < tiledCurrentStep.x + kernelSize) {
                    cell.classList.add('kernel');
                    
                    // Highlight active element
                    if (y === tiledCurrentStep.y + tiledCurrentStep.ky && 
                        x === tiledCurrentStep.x + tiledCurrentStep.kx) {
                        cell.classList.add('active');
                    }
                }
                
                tiledMatrixContainer.appendChild(cell);
            }
        }
        
        // Draw naive output matrix
        const naiveOutputContainer = document.createElement('div');
        naiveOutputContainer.style.display = 'grid';
        naiveOutputContainer.style.gridTemplateColumns = `repeat(${naiveOutputMatrix.length}, ${cellSize}px)`;
        naiveOutputContainer.style.gap = '1px';
        
        for (let y = 0; y < naiveOutputMatrix.length; y++) {
            for (let x = 0; x < naiveOutputMatrix[y].length; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell output';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.textContent = naiveOutputMatrix[y][x];
                
                // Highlight currently computed output
                if (naiveCurrentStep.x === x && naiveCurrentStep.y === y && 
                    naiveCurrentStep.kx === kernelSize - 1 && naiveCurrentStep.ky === kernelSize - 1) {
                    cell.classList.add('active');
                }
                
                naiveOutputContainer.appendChild(cell);
            }
        }
        
        // Draw tiled output matrix
        const tiledOutputContainer = document.createElement('div');
        tiledOutputContainer.style.display = 'grid';
        tiledOutputContainer.style.gridTemplateColumns = `repeat(${tiledOutputMatrix.length}, ${cellSize}px)`;
        tiledOutputContainer.style.gap = '1px';
        
        for (let y = 0; y < tiledOutputMatrix.length; y++) {
            for (let x = 0; x < tiledOutputMatrix[y].length; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell output';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.textContent = tiledOutputMatrix[y][x];
                
                // Highlight currently computed output
                if (tiledCurrentStep.x === x && tiledCurrentStep.y === y && 
                    tiledCurrentStep.kx === kernelSize - 1 && tiledCurrentStep.ky === kernelSize - 1) {
                    cell.classList.add('active');
                }
                
                tiledOutputContainer.appendChild(cell);
            }
        }
        
        // Append containers to visualizations
        naiveCanvas.appendChild(naiveMatrixContainer);
        tiledCanvas.appendChild(tiledMatrixContainer);
        naiveOutputVis.appendChild(naiveOutputContainer);
        tiledOutputVis.appendChild(tiledOutputContainer);
    }
    
    // Naive step function
    function naiveStep() {
        const outputSize = matrixSize - kernelSize + 1;
        if (naiveCurrentStep.y >= outputSize) {
            return false; // Computation complete
        }
        
        // Get current position
        const {x, y, kx, ky} = naiveCurrentStep;
        
        // Make sure indices are within bounds
        if (y < outputSize && x < outputSize && 
            y + ky < matrixSize && x + kx < matrixSize && 
            ky < kernelSize && kx < kernelSize) {
            
            // Update output at current position
            const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
            const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
            
            // Ensure kernel indices are within bounds
            if (kernelY >= 0 && kernelY < kernelSize && 
                kernelX >= 0 && kernelX < kernelSize) {
                naiveOutputMatrix[y][x] += inputMatrix[y + ky][x + kx] * kernelMatrix[kernelY][kernelX];
            }
        }
        
        // Move to next position
        naiveCurrentStep.kx++;
        if (naiveCurrentStep.kx >= kernelSize) {
            naiveCurrentStep.kx = 0;
            naiveCurrentStep.ky++;
            
            if (naiveCurrentStep.ky >= kernelSize) {
                naiveCurrentStep.ky = 0;
                naiveCurrentStep.x++;
                
                if (naiveCurrentStep.x >= outputSize) {
                    naiveCurrentStep.x = 0;
                    naiveCurrentStep.y++;
                }
            }
        }
        
        // Update output when kernel window is fully processed
        if (naiveCurrentStep.kx === kernelSize - 1 && naiveCurrentStep.ky === kernelSize - 1) {
            let sum = 0;
            for (let ky = 0; ky < kernelSize; ky++) {
                for (let kx = 0; kx < kernelSize; kx++) {
                    // For convolution, flip the kernel
                    const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
                    const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
                    
                    sum += inputMatrix[naiveCurrentStep.y + ky][naiveCurrentStep.x + kx] * 
                           kernelMatrix[kernelY][kernelX];
                }
            }
            naiveOutputMatrix[naiveCurrentStep.y][naiveCurrentStep.x] = sum;
        }
        
        return naiveCurrentStep.y < outputSize;
    }
    
    // Function to go back one step in the 2D naive implementation
    function naiveBackStep() {
        // If we're at the beginning, do nothing
        if (naiveCurrentStep.y === 0 && naiveCurrentStep.x === 0 && naiveCurrentStep.ky === 0 && naiveCurrentStep.kx === 0) {
            return;
        }
        
        // Move back one kernel position
        naiveCurrentStep.kx--;
        
        // If we've moved before the left edge of the kernel
        if (naiveCurrentStep.kx < 0) {
            // Move up one row in the kernel
            naiveCurrentStep.ky--;
            // And to the last column position
            naiveCurrentStep.kx = kernelSize - 1;
            
            // If we've moved before the top edge of the kernel
            if (naiveCurrentStep.ky < 0) {
                // Move left in the input matrix
                naiveCurrentStep.x--;
                // Reset kernel row
                naiveCurrentStep.ky = kernelSize - 1;
                
                // If we've moved before the left edge of the input
                if (naiveCurrentStep.x < 0) {
                    // Move up one row in the input
                    naiveCurrentStep.y--;
                    // And to the last column position possible
                    naiveCurrentStep.x = matrixSize - kernelSize;
                    
                    // If we've moved before the top edge of the input
                    if (naiveCurrentStep.y < 0) {
                        // Start at the beginning
                        naiveCurrentStep.y = 0;
                        naiveCurrentStep.x = 0;
                        naiveCurrentStep.ky = 0;
                        naiveCurrentStep.kx = 0;
                    }
                }
            }
        }
    }
    
    // Tiled step function 
    function tiledStep() {
        const outputSize = matrixSize - kernelSize + 1;
        const numTilesX = Math.ceil(matrixSize / tileSize);
        const numTilesY = Math.ceil(matrixSize / tileSize);
        
        if (tiledCurrentStep.tileY >= numTilesY) {
            return false; // Computation complete
        }
        
        // Get current position
        const {tileX, tileY, x, y, kx, ky} = tiledCurrentStep;
        
        // Check if current position is valid for output
        if (y < outputSize && x < outputSize && 
            y + ky < matrixSize && x + kx < matrixSize && 
            ky < kernelSize && kx < kernelSize) {
            
            // Update output at current position
            const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
            const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
            
            // Ensure kernel indices are within bounds
            if (kernelY >= 0 && kernelY < kernelSize &&
                kernelX >= 0 && kernelX < kernelSize) {
                tiledOutputMatrix[y][x] += inputMatrix[y + ky][x + kx] * kernelMatrix[kernelY][kernelX];
            }
        }
        
        // Move to next position
        tiledCurrentStep.kx++;
        if (tiledCurrentStep.kx >= kernelSize) {
            tiledCurrentStep.kx = 0;
            tiledCurrentStep.ky++;
            
            if (tiledCurrentStep.ky >= kernelSize) {
                tiledCurrentStep.ky = 0;
                tiledCurrentStep.x++;
                
                // Check if we've processed all columns in this tile
                const tileEndX = Math.min((tileX + 1) * tileSize, outputSize);
                if (tiledCurrentStep.x >= tileEndX) {
                    tiledCurrentStep.x = tileX * tileSize;
                    tiledCurrentStep.y++;
                    
                    // Check if we've processed all rows in this tile
                    const tileEndY = Math.min((tileY + 1) * tileSize, outputSize);
                    if (tiledCurrentStep.y >= tileEndY) {
                        tiledCurrentStep.y = tileY * tileSize;
                        tiledCurrentStep.tileX++;
                        
                        // Check if we've processed all tiles in this row
                        if (tiledCurrentStep.tileX >= numTilesX) {
                            tiledCurrentStep.tileX = 0;
                            tiledCurrentStep.tileY++;
                        }
                    }
                }
            }
        }
        
        // Update output when kernel window is fully processed
        if (tiledCurrentStep.kx === kernelSize - 1 && tiledCurrentStep.ky === kernelSize - 1) {
            // Compute final convolution value for this position
            let sum = 0;
            for (let ky = 0; ky < kernelSize; ky++) {
                for (let kx = 0; kx < kernelSize; kx++) {
                    // For convolution, flip the kernel
                    const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
                    const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
                    
                    const inputY = tiledCurrentStep.y + ky;
                    const inputX = tiledCurrentStep.x + kx;
                    
                    if (inputY < matrixSize && inputX < matrixSize) {
                        sum += inputMatrix[inputY][inputX] * kernelMatrix[kernelY][kernelX];
                    }
                }
            }
            
            const outputSizeY = matrixSize - kernelSize + 1;
            const outputSizeX = matrixSize - kernelSize + 1;
            
            if (tiledCurrentStep.y < outputSizeY && tiledCurrentStep.x < outputSizeX) {
                tiledOutputMatrix[tiledCurrentStep.y][tiledCurrentStep.x] = sum;
            }
        }
        
        return tiledCurrentStep.tileY < numTilesY;
    }
    
    // Function to go back one step in the 2D tiled implementation
    function tiledBackStep() {
        // If we're at the beginning, do nothing
        if (tiledCurrentStep.tileY === 0 && tiledCurrentStep.tileX === 0 && 
            tiledCurrentStep.y === 0 && tiledCurrentStep.x === 0 && 
            tiledCurrentStep.ky === 0 && tiledCurrentStep.kx === 0) {
            return;
        }
        
        // Move back one kernel position
        tiledCurrentStep.kx--;
        
        // If we've moved before the left edge of the kernel
        if (tiledCurrentStep.kx < 0) {
            // Move up one row in the kernel
            tiledCurrentStep.ky--;
            // And to the last column position
            tiledCurrentStep.kx = kernelSize - 1;
            
            // If we've moved before the top edge of the kernel
            if (tiledCurrentStep.ky < 0) {
                // Move left in the current window position
                tiledCurrentStep.x--;
                // Reset kernel row
                tiledCurrentStep.ky = kernelSize - 1;
                
                // If we've moved before the left boundary of the current window
                const tileStartX = tiledCurrentStep.tileX * tileSize;
                if (tiledCurrentStep.x < tileStartX) {
                    // Move up in the current tile
                    tiledCurrentStep.y--;
                    // Reset to rightmost position of current row
                    const tileEndX = Math.min(tileStartX + tileSize - kernelSize, matrixSize - kernelSize);
                    tiledCurrentStep.x = tileEndX;
                    
                    // If we've moved above the top boundary of the current tile
                    const tileStartY = tiledCurrentStep.tileY * tileSize;
                    if (tiledCurrentStep.y < tileStartY) {
                        // Move left to the previous tile
                        tiledCurrentStep.tileX--;
                        
                        // If we've moved left of the leftmost tile
                        if (tiledCurrentStep.tileX < 0) {
                            // Move up to the previous row of tiles
                            tiledCurrentStep.tileY--;
                            // Reset to rightmost tile of previous row
                            tiledCurrentStep.tileX = Math.ceil(matrixSize / tileSize) - 1;
                            
                            // If we've moved above the topmost tile
                            if (tiledCurrentStep.tileY < 0) {
                                // Reset to beginning
                                tiledCurrentStep.tileY = 0;
                                tiledCurrentStep.tileX = 0;
                                tiledCurrentStep.y = 0;
                                tiledCurrentStep.x = 0;
                                tiledCurrentStep.ky = 0;
                                tiledCurrentStep.kx = 0;
                                return;
                            }
                        }
                        
                        // Set position to bottom-right of the new tile
                        const newTileStartY = tiledCurrentStep.tileY * tileSize;
                        const newTileStartX = tiledCurrentStep.tileX * tileSize;
                        const tileEndY = Math.min(newTileStartY + tileSize - kernelSize, matrixSize - kernelSize);
                        const newTileEndX = Math.min(newTileStartX + tileSize - kernelSize, matrixSize - kernelSize);
                        tiledCurrentStep.y = tileEndY;
                        tiledCurrentStep.x = newTileEndX;
                    }
                }
            }
        }
    }
    
    // Run animation
    function animate() {
        if (!isAnimating) return;
        
        const naiveHasMore = naiveStep();
        const tiledHasMore = tiledStep();
        
        draw2DMatrices();
        
        if (!naiveHasMore && !tiledHasMore) {
            stopAnimation();
        }
    }
    
    // Start animation
    function startAnimation() {
        if (isAnimating) return;
        
        isAnimating = true;
        playButton.textContent = 'Pause';
        animationInterval = setInterval(animate, 500);
    }
    
    // Stop animation
    function stopAnimation() {
        if (!isAnimating) return;
        
        isAnimating = false;
        playButton.textContent = 'Play Animation';
        clearInterval(animationInterval);
    }
    
    // Reset visualization
    function resetVisualization() {
        stopAnimation();
        
        // Reset output matrices
        const outputSize = matrixSize - kernelSize + 1;
        for (let y = 0; y < outputSize; y++) {
            for (let x = 0; x < outputSize; x++) {
                naiveOutputMatrix[y][x] = 0;
                tiledOutputMatrix[y][x] = 0;
            }
        }
        
        // Reset step trackers
        naiveCurrentStep = {x: 0, y: 0, kx: 0, ky: 0};
        tiledCurrentStep = {tileX: 0, tileY: 0, x: 0, y: 0, kx: 0, ky: 0};
        
        draw2DMatrices();
    }
    
    // Event listeners
    matrixSizeSlider.addEventListener('input', function() {
        matrixSize = parseInt(this.value);
        matrixSizeValue.textContent = `${matrixSize}×${matrixSize}`;
        
        // Ensure kernel size doesn't exceed matrix size
        if (kernelSize > matrixSize) {
            kernelSize = matrixSize;
            kernelSizeSlider.value = kernelSize;
            kernelSizeValue.textContent = `${kernelSize}×${kernelSize}`;
        }
        
        resetVisualization();
        initializeMatrices();
        draw2DMatrices();
    });
    
    kernelSizeSlider.addEventListener('input', function() {
        // Ensure kernel size doesn't exceed matrix size
        kernelSize = Math.min(parseInt(this.value), matrixSize);
        kernelSizeValue.textContent = `${kernelSize}×${kernelSize}`;
        
        // Update slider value if it was constrained
        if (parseInt(this.value) !== kernelSize) {
            this.value = kernelSize;
        }
        
        resetVisualization();
        initializeMatrices();
        draw2DMatrices();
    });
    
    tileSizeSlider.addEventListener('input', function() {
        tileSize = parseInt(this.value);
        tileSizeValue.textContent = `${tileSize}×${tileSize}`;
        resetVisualization();
        tiledCurrentStep = {tileX: 0, tileY: 0, x: 0, y: 0, kx: 0, ky: 0};
        draw2DMatrices();
    });
    
    operationSelect.addEventListener('change', function() {
        operation = this.value;
        resetVisualization();
        draw2DMatrices();
    });
    
    randomButton.addEventListener('click', function() {
        resetVisualization();
        initializeMatrices();
        draw2DMatrices();
    });
    
    playButton.addEventListener('click', function() {
        if (isAnimating) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });
    
    stepButton.addEventListener('click', function() {
        naiveStep();
        tiledStep();
        draw2DMatrices();
    });
    
    // Add event listener for rewind button
    const rwdButton = document.getElementById('2d-rwd');
    
    // Rewind button click handler
    rwdButton.addEventListener('click', function() {
        naiveBackStep();
        tiledBackStep();
        draw2DMatrices();
    });
    
    resetButton.addEventListener('click', resetVisualization);
    
    // Initialize
    initializeMatrices();
    draw2DMatrices();
}

// 3D Visualization
function initialize3DVisualization() {
    // DOM Elements
    const volumeSizeSlider = document.getElementById('3d-volume-size');
    const volumeSizeValue = document.getElementById('3d-volume-size-value');
    const kernelSizeSlider = document.getElementById('3d-kernel-size');
    const kernelSizeValue = document.getElementById('3d-kernel-size-value');
    const tileSizeSlider = document.getElementById('3d-tile-size');
    const tileSizeValue = document.getElementById('3d-tile-size-value');
    const operationSelect = document.getElementById('3d-operation');
    const randomButton = document.getElementById('3d-random');
    const playButton = document.getElementById('3d-play');
    const stepButton = document.getElementById('3d-step');
    const resetButton = document.getElementById('3d-reset');
    
    // Canvas contexts
    const naiveCanvas = document.getElementById('3d-naive-canvas');
    const tiledCanvas = document.getElementById('3d-tiled-canvas');
    const outputCanvas = document.getElementById('3d-output-visualization');
    
    // State variables
    let volumeSize = parseInt(volumeSizeSlider.value);
    let kernelSize = parseInt(kernelSizeSlider.value);
    let tileSize = parseInt(tileSizeSlider.value);
    let operation = operationSelect.value;
    let inputVolume = [];
    let kernelVolume = [];
    let naiveOutputVolume = [];
    let tiledOutputVolume = [];
    let naiveCurrentStep = {x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
    let tiledCurrentStep = {tileX: 0, tileY: 0, tileZ: 0, x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
    let animationInterval = null;
    let isAnimating = false;
    let currentViewZ = 0;
    let currentOutputViewZ = 0;
    
    // Initialize the volumes
    function initializeVolumes() {
        // Generate random input volume
        inputVolume = Array.from({length: volumeSize}, () =>
            Array.from({length: volumeSize}, () =>
                Array.from({length: volumeSize}, () => Math.floor(Math.random() * 10))
            )
        );
        
        // Generate random kernel volume
        kernelVolume = Array.from({length: kernelSize}, () =>
            Array.from({length: kernelSize}, () =>
                Array.from({length: kernelSize}, () => Math.floor(Math.random() * 5))
            )
        );
        
        // Initialize output volumes
        const outputSize = volumeSize - kernelSize + 1;
        naiveOutputVolume = Array.from({length: outputSize}, () => 
            Array.from({length: outputSize}, () =>
                Array(outputSize).fill(0)
            )
        );
        tiledOutputVolume = Array.from({length: outputSize}, () => 
            Array.from({length: outputSize}, () =>
                Array(outputSize).fill(0)
            )
        );
        
        // Reset step trackers
        naiveCurrentStep = {x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
        tiledCurrentStep = {tileX: 0, tileY: 0, tileZ: 0, x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
        
        // Reset view positions
        currentViewZ = 0;
        currentOutputViewZ = 0;
    }
    
    // Draw functions for the 3D volumes
    function draw3DVolumes() {
        // Clear canvases
        while (naiveCanvas.firstChild) naiveCanvas.removeChild(naiveCanvas.firstChild);
        while (tiledCanvas.firstChild) tiledCanvas.removeChild(tiledCanvas.firstChild);
        
        // Clear output visualizations
        const naiveOutputVis = document.getElementById('3d-naive-output-visualization');
        const tiledOutputVis = document.getElementById('3d-tiled-output-visualization');
        const kernelVis = document.getElementById('3d-kernel-visualization');
        
        while (naiveOutputVis.firstChild) naiveOutputVis.removeChild(naiveOutputVis.firstChild);
        while (tiledOutputVis.firstChild) tiledOutputVis.removeChild(tiledOutputVis.firstChild);
        while (kernelVis.firstChild) kernelVis.removeChild(kernelVis.firstChild);
        
        // Calculate cell size
        const cellSize = Math.min(
            Math.min(naiveCanvas.clientWidth, naiveCanvas.clientHeight) / volumeSize,
            30
        ) * 1.2; // Apply a multiplier for larger cells
        
        // Draw kernel visualization
        const kernelContainer = document.createElement('div');
        kernelContainer.className = 'kernel-display';
        kernelContainer.style.display = 'grid';
        kernelContainer.style.gridTemplateColumns = `repeat(${kernelSize}, ${cellSize * 1.5}px)`;
        kernelContainer.style.gap = '2px';
        
        // Show the current Z slice of the kernel
        const kernelZ = Math.min(currentViewZ % kernelSize, kernelSize - 1);
        
        for (let y = 0; y < kernelSize; y++) {
            for (let x = 0; x < kernelSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell kernel';
                cell.style.width = `${cellSize * 1.5}px`;
                cell.style.height = `${cellSize * 1.5}px`;
                cell.textContent = kernelVolume[kernelZ][y][x];
                kernelContainer.appendChild(cell);
            }
        }
        
        kernelVis.appendChild(kernelContainer);
        const sliceInfo = document.createElement('div');
        sliceInfo.textContent = `Kernel Slice: ${kernelZ + 1}/${kernelSize}`;
        sliceInfo.style.textAlign = 'center';
        kernelVis.appendChild(sliceInfo);
        
        // Add note about kernel flipping for convolution
        if (operation === 'convolution') {
            const flipNote = document.createElement('div');
            flipNote.className = 'kernel-flip-note';
            flipNote.textContent = '(Kernel is flipped during convolution)';
            kernelVis.appendChild(flipNote);
        }
        
        // Draw naive implementation (current slice)
        const naiveMatrixContainer = document.createElement('div');
        naiveMatrixContainer.style.display = 'grid';
        naiveMatrixContainer.style.gridTemplateColumns = `repeat(${volumeSize}, ${cellSize}px)`;
        naiveMatrixContainer.style.gap = '2px';
        
        for (let y = 0; y < volumeSize; y++) {
            for (let x = 0; x < volumeSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.fontSize = `${Math.max(14, cellSize * 0.7)}px`;
                cell.textContent = inputVolume[currentViewZ][y][x];
                
                // Highlight kernel area for naive implementation
                if (naiveCurrentStep.z <= currentViewZ && currentViewZ < naiveCurrentStep.z + kernelSize &&
                    naiveCurrentStep.y <= y && y < naiveCurrentStep.y + kernelSize &&
                    naiveCurrentStep.x <= x && x < naiveCurrentStep.x + kernelSize) {
                    cell.classList.add('kernel');
                    
                    // Highlight active element
                    if (currentViewZ === naiveCurrentStep.z + naiveCurrentStep.kz && 
                        y === naiveCurrentStep.y + naiveCurrentStep.ky && 
                        x === naiveCurrentStep.x + naiveCurrentStep.kx) {
                        cell.classList.add('active');
                    }
                }
                
                naiveMatrixContainer.appendChild(cell);
            }
        }
        
        // Draw tiled implementation (current slice)
        const tiledMatrixContainer = document.createElement('div');
        tiledMatrixContainer.style.display = 'grid';
        tiledMatrixContainer.style.gridTemplateColumns = `repeat(${volumeSize}, ${cellSize}px)`;
        tiledMatrixContainer.style.gap = '2px';
        
        for (let y = 0; y < volumeSize; y++) {
            for (let x = 0; x < volumeSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.fontSize = `${Math.max(14, cellSize * 0.7)}px`;
                cell.textContent = inputVolume[currentViewZ][y][x];
                
                // Add tile background
                const tileX = Math.floor(x / tileSize);
                const tileY = Math.floor(y / tileSize);
                const tileZ = Math.floor(currentViewZ / tileSize);
                if (tileX === tiledCurrentStep.tileX && 
                    tileY === tiledCurrentStep.tileY && 
                    tileZ === tiledCurrentStep.tileZ) {
                    cell.classList.add('tile');
                }
                
                // Highlight kernel area for tiled implementation
                if (tiledCurrentStep.z <= currentViewZ && currentViewZ < tiledCurrentStep.z + kernelSize &&
                    tiledCurrentStep.y <= y && y < tiledCurrentStep.y + kernelSize &&
                    tiledCurrentStep.x <= x && x < tiledCurrentStep.x + kernelSize) {
                    cell.classList.add('kernel');
                    
                    // Highlight active element
                    if (currentViewZ === tiledCurrentStep.z + tiledCurrentStep.kz && 
                        y === tiledCurrentStep.y + tiledCurrentStep.ky && 
                        x === tiledCurrentStep.x + tiledCurrentStep.kx) {
                        cell.classList.add('active');
                    }
                }
                
                tiledMatrixContainer.appendChild(cell);
            }
        }
        
        // Add slice navigation controls
        const volumeControls = document.createElement('div');
        volumeControls.className = 'three-d-controls';
        volumeControls.innerHTML = `<div>Input Slice: ${currentViewZ + 1}/${volumeSize}</div>`;
        
        const prevButton = document.createElement('button');
        prevButton.className = 'three-d-view-button';
        prevButton.textContent = '←';
        prevButton.disabled = currentViewZ <= 0;
        prevButton.addEventListener('click', function() {
            currentViewZ = Math.max(0, currentViewZ - 1);
            draw3DVolumes();
        });
        
        const nextButton = document.createElement('button');
        nextButton.className = 'three-d-view-button';
        nextButton.textContent = '→';
        nextButton.disabled = currentViewZ >= volumeSize - 1;
        nextButton.addEventListener('click', function() {
            currentViewZ = Math.min(volumeSize - 1, currentViewZ + 1);
            draw3DVolumes();
        });
        
        volumeControls.prepend(prevButton);
        volumeControls.appendChild(nextButton);
        
        // Draw naive output volume (current slice)
        const naiveOutputContainer = document.createElement('div');
        naiveOutputContainer.style.display = 'grid';
        const outputSize = volumeSize - kernelSize + 1;
        naiveOutputContainer.style.gridTemplateColumns = `repeat(${outputSize}, ${cellSize}px)`;
        naiveOutputContainer.style.gap = '1px';
        
        if (currentOutputViewZ < outputSize) {
            for (let y = 0; y < outputSize; y++) {
                for (let x = 0; x < outputSize; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell output';
                    cell.style.width = `${cellSize}px`;
                    cell.style.height = `${cellSize}px`;
                    cell.textContent = naiveOutputVolume[currentOutputViewZ][y][x];
                    
                    // Highlight currently computed output
                    if (naiveCurrentStep.z === currentOutputViewZ && 
                        naiveCurrentStep.y === y && 
                        naiveCurrentStep.x === x && 
                        naiveCurrentStep.kz === kernelSize - 1 && 
                        naiveCurrentStep.ky === kernelSize - 1 && 
                        naiveCurrentStep.kx === kernelSize - 1) {
                        cell.classList.add('active');
                    }
                    
                    naiveOutputContainer.appendChild(cell);
                }
            }
        }
        
        // Draw tiled output volume (current slice)
        const tiledOutputContainer = document.createElement('div');
        tiledOutputContainer.style.display = 'grid';
        tiledOutputContainer.style.gridTemplateColumns = `repeat(${outputSize}, ${cellSize}px)`;
        tiledOutputContainer.style.gap = '1px';
        
        if (currentOutputViewZ < outputSize) {
            for (let y = 0; y < outputSize; y++) {
                for (let x = 0; x < outputSize; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell output';
                    cell.style.width = `${cellSize}px`;
                    cell.style.height = `${cellSize}px`;
                    cell.textContent = tiledOutputVolume[currentOutputViewZ][y][x];
                    
                    // Highlight currently computed output
                    if (tiledCurrentStep.z === currentOutputViewZ && 
                        tiledCurrentStep.y === y && 
                        tiledCurrentStep.x === x && 
                        tiledCurrentStep.kz === kernelSize - 1 && 
                        tiledCurrentStep.ky === kernelSize - 1 && 
                        tiledCurrentStep.kx === kernelSize - 1) {
                        cell.classList.add('active');
                    }
                    
                    tiledOutputContainer.appendChild(cell);
                }
            }
        }
        
        // Add navigation controls for output slices
        const naiveOutputNav = document.createElement('div');
        naiveOutputNav.className = 'three-d-controls';
        naiveOutputNav.innerHTML = `<div>Slice: ${currentOutputViewZ + 1}/${outputSize}</div>`;
        
        const prevNaiveOutputBtn = document.createElement('button');
        prevNaiveOutputBtn.className = 'three-d-view-button';
        prevNaiveOutputBtn.textContent = '←';
        prevNaiveOutputBtn.disabled = currentOutputViewZ <= 0;
        prevNaiveOutputBtn.addEventListener('click', function() {
            currentOutputViewZ = Math.max(0, currentOutputViewZ - 1);
            draw3DVolumes();
        });
        
        const nextNaiveOutputBtn = document.createElement('button');
        nextNaiveOutputBtn.className = 'three-d-view-button';
        nextNaiveOutputBtn.textContent = '→';
        nextNaiveOutputBtn.disabled = currentOutputViewZ >= outputSize - 1;
        nextNaiveOutputBtn.addEventListener('click', function() {
            currentOutputViewZ = Math.min(outputSize - 1, currentOutputViewZ + 1);
            draw3DVolumes();
        });
        
        naiveOutputNav.prepend(prevNaiveOutputBtn);
        naiveOutputNav.appendChild(nextNaiveOutputBtn);
        
        // Clone the navigation for tiled output
        const tiledOutputNav = naiveOutputNav.cloneNode(true);
        tiledOutputNav.querySelector('button:first-child').addEventListener('click', function() {
            currentOutputViewZ = Math.max(0, currentOutputViewZ - 1);
            draw3DVolumes();
        });
        tiledOutputNav.querySelector('button:last-child').addEventListener('click', function() {
            currentOutputViewZ = Math.min(outputSize - 1, currentOutputViewZ + 1);
            draw3DVolumes();
        });
        
        // Append all the components to their respective containers
        naiveCanvas.appendChild(naiveMatrixContainer);
        naiveCanvas.appendChild(volumeControls.cloneNode(true));
        
        tiledCanvas.appendChild(tiledMatrixContainer);
        tiledCanvas.appendChild(volumeControls);
        
        naiveOutputVis.appendChild(naiveOutputContainer);
        naiveOutputVis.appendChild(naiveOutputNav);
        
        tiledOutputVis.appendChild(tiledOutputContainer);
        tiledOutputVis.appendChild(tiledOutputNav);
    }
    
    // Naive step function
    function naiveStep() {
        const outputSize = volumeSize - kernelSize + 1;
        if (naiveCurrentStep.z >= outputSize) {
            return false; // Computation complete
        }
        
        // Get current position
        const {x, y, z, kx, ky, kz} = naiveCurrentStep;
        
        // Make sure indices are within bounds
        if (z < outputSize && y < outputSize && x < outputSize &&
            z + kz < volumeSize && y + ky < volumeSize && x + kx < volumeSize &&
            kz < kernelSize && ky < kernelSize && kx < kernelSize) {
            
            // Update output at current position
            const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
            const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
            const kernelZ = operation === 'convolution' ? kernelSize - 1 - kz : kz;
            
            // Ensure kernel indices are within bounds
            if (kernelZ >= 0 && kernelZ < kernelSize &&
                kernelY >= 0 && kernelY < kernelSize &&
                kernelX >= 0 && kernelX < kernelSize) {
                naiveOutputVolume[z][y][x] += inputVolume[z + kz][y + ky][x + kx] * kernelVolume[kernelZ][kernelY][kernelX];
            }
        }
        
        // Move to next position
        naiveCurrentStep.kx++;
        if (naiveCurrentStep.kx >= kernelSize) {
            naiveCurrentStep.kx = 0;
            naiveCurrentStep.ky++;
            
            if (naiveCurrentStep.ky >= kernelSize) {
                naiveCurrentStep.ky = 0;
                naiveCurrentStep.kz++;
                
                if (naiveCurrentStep.kz >= kernelSize) {
                    naiveCurrentStep.kz = 0;
                    naiveCurrentStep.x++;
                    
                    if (naiveCurrentStep.x >= outputSize) {
                        naiveCurrentStep.x = 0;
                        naiveCurrentStep.y++;
                        
                        if (naiveCurrentStep.y >= outputSize) {
                            naiveCurrentStep.y = 0;
                            naiveCurrentStep.z++;
                        }
                    }
                }
            }
        }
        
        // Update output when kernel window is fully processed
        if (naiveCurrentStep.kx === kernelSize - 1 && 
            naiveCurrentStep.ky === kernelSize - 1 && 
            naiveCurrentStep.kz === kernelSize - 1) {
            let sum = 0;
            for (let kz = 0; kz < kernelSize; kz++) {
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        // For convolution, flip the kernel
                        const kernelZ = operation === 'convolution' ? kernelSize - 1 - kz : kz;
                        const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
                        const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
                        
                        sum += inputVolume[naiveCurrentStep.z + kz][naiveCurrentStep.y + ky][naiveCurrentStep.x + kx] * 
                               kernelVolume[kernelZ][kernelY][kernelX];
                    }
                }
            }
            
            const outputSize = volumeSize - kernelSize + 1;
            if (naiveCurrentStep.z < outputSize && 
                naiveCurrentStep.y < outputSize && 
                naiveCurrentStep.x < outputSize) {
                naiveOutputVolume[naiveCurrentStep.z][naiveCurrentStep.y][naiveCurrentStep.x] = sum;
            }
        }
        
        return naiveCurrentStep.z < outputSize;
    }
    
    // Function to go back one step in the 3D naive implementation
    function naiveBackStep() {
        // If we're at the beginning, do nothing
        if (naiveCurrentStep.z === 0 && naiveCurrentStep.y === 0 && naiveCurrentStep.x === 0 && 
            naiveCurrentStep.kz === 0 && naiveCurrentStep.ky === 0 && naiveCurrentStep.kx === 0) {
            return;
        }
        
        // Move back one kernel position along x
        naiveCurrentStep.kx--;
        
        // If we've moved before the left edge of the kernel
        if (naiveCurrentStep.kx < 0) {
            // Move back one kernel position along y
            naiveCurrentStep.ky--;
            // Reset kernel x position
            naiveCurrentStep.kx = kernelSize - 1;
            
            // If we've moved before the front edge of the kernel
            if (naiveCurrentStep.ky < 0) {
                // Move back one kernel position along z
                naiveCurrentStep.kz--;
                // Reset kernel y position
                naiveCurrentStep.ky = kernelSize - 1;
                
                // If we've moved before the top edge of the kernel
                if (naiveCurrentStep.kz < 0) {
                    // Move back one input position along x
                    naiveCurrentStep.x--;
                    // Reset kernel z position
                    naiveCurrentStep.kz = kernelSize - 1;
                    
                    // If we've moved before the left edge of the input
                    if (naiveCurrentStep.x < 0) {
                        // Move back one input position along y
                        naiveCurrentStep.y--;
                        // Reset input x position
                        naiveCurrentStep.x = volumeSize - kernelSize;
                        
                        // If we've moved before the front edge of the input
                        if (naiveCurrentStep.y < 0) {
                            // Move back one input position along z
                            naiveCurrentStep.z--;
                            // Reset input y position
                            naiveCurrentStep.y = volumeSize - kernelSize;
                            
                            // If we've moved before the top edge of the input
                            if (naiveCurrentStep.z < 0) {
                                // Start at the beginning
                                naiveCurrentStep.z = 0;
                                naiveCurrentStep.y = 0;
                                naiveCurrentStep.x = 0;
                                naiveCurrentStep.kz = 0;
                                naiveCurrentStep.ky = 0;
                                naiveCurrentStep.kx = 0;
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Tiled step function
    function tiledStep() {
        const outputSize = volumeSize - kernelSize + 1;
        const numTiles = Math.ceil(volumeSize / tileSize);
        
        if (tiledCurrentStep.tileZ >= numTiles) {
            return false; // Computation complete
        }
        
        // Get current position
        const {tileX, tileY, tileZ, x, y, z, kx, ky, kz} = tiledCurrentStep;
        
        // Check if current position is valid for output
        if (z < outputSize && y < outputSize && x < outputSize &&
            z + kz < volumeSize && y + ky < volumeSize && x + kx < volumeSize &&
            kz < kernelSize && ky < kernelSize && kx < kernelSize) {
            
            // Update output at current position
            const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
            const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
            const kernelZ = operation === 'convolution' ? kernelSize - 1 - kz : kz;
            
            // Ensure kernel indices are within bounds
            if (kernelZ >= 0 && kernelZ < kernelSize &&
                kernelY >= 0 && kernelY < kernelSize &&
                kernelX >= 0 && kernelX < kernelSize) {
                tiledOutputVolume[z][y][x] += inputVolume[z + kz][y + ky][x + kx] * kernelVolume[kernelZ][kernelY][kernelX];
            }
        }
        
        // Move to next position
        tiledCurrentStep.kx++;
        if (tiledCurrentStep.kx >= kernelSize) {
            tiledCurrentStep.kx = 0;
            tiledCurrentStep.ky++;
            
            if (tiledCurrentStep.ky >= kernelSize) {
                tiledCurrentStep.ky = 0;
                tiledCurrentStep.kz++;
                
                if (tiledCurrentStep.kz >= kernelSize) {
                    tiledCurrentStep.kz = 0;
                    tiledCurrentStep.x++;
                    
                    // Check if we've processed all columns in this tile
                    const tileEndX = Math.min((tileX + 1) * tileSize, outputSize);
                    if (tiledCurrentStep.x >= tileEndX) {
                        tiledCurrentStep.x = tileX * tileSize;
                        tiledCurrentStep.y++;
                        
                        // Check if we've processed all rows in this tile
                        const tileEndY = Math.min((tileY + 1) * tileSize, outputSize);
                        if (tiledCurrentStep.y >= tileEndY) {
                            tiledCurrentStep.y = tileY * tileSize;
                            tiledCurrentStep.z++;
                            
                            // Check if we've processed all depths in this tile
                            const tileEndZ = Math.min((tileZ + 1) * tileSize, outputSize);
                            if (tiledCurrentStep.z >= tileEndZ) {
                                tiledCurrentStep.z = tileZ * tileSize;
                                tiledCurrentStep.tileX++;
                                
                                // Check if we've processed all tiles in this row
                                if (tiledCurrentStep.tileX >= numTiles) {
                                    tiledCurrentStep.tileX = 0;
                                    tiledCurrentStep.tileY++;
                                    
                                    // Check if we've processed all tile rows
                                    if (tiledCurrentStep.tileY >= numTiles) {
                                        tiledCurrentStep.tileY = 0;
                                        tiledCurrentStep.tileZ++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Update output when kernel window is fully processed
        if (tiledCurrentStep.kx === kernelSize - 1 && 
            tiledCurrentStep.ky === kernelSize - 1 && 
            tiledCurrentStep.kz === kernelSize - 1) {
            let sum = 0;
            for (let kz = 0; kz < kernelSize; kz++) {
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        // For convolution, flip the kernel
                        const kernelZ = operation === 'convolution' ? kernelSize - 1 - kz : kz;
                        const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
                        const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
                        
                        const inputZ = tiledCurrentStep.z + kz;
                        const inputY = tiledCurrentStep.y + ky;
                        const inputX = tiledCurrentStep.x + kx;
                        
                        if (inputZ < volumeSize && inputY < volumeSize && inputX < volumeSize) {
                            sum += inputVolume[inputZ][inputY][inputX] * 
                                   kernelVolume[kernelZ][kernelY][kernelX];
                        }
                    }
                }
            }
            
            const outputSize = volumeSize - kernelSize + 1;
            if (tiledCurrentStep.z < outputSize && 
                tiledCurrentStep.y < outputSize && 
                tiledCurrentStep.x < outputSize) {
                tiledOutputVolume[tiledCurrentStep.z][tiledCurrentStep.y][tiledCurrentStep.x] = sum;
            }
        }
        
        return tiledCurrentStep.tileZ < numTiles;
    }
    
    // Function to go back one step in the 3D tiled implementation
    function tiledBackStep() {
        // If we're at the beginning, do nothing
        if (tiledCurrentStep.tileZ === 0 && tiledCurrentStep.tileY === 0 && tiledCurrentStep.tileX === 0 && 
            tiledCurrentStep.z === 0 && tiledCurrentStep.y === 0 && tiledCurrentStep.x === 0 && 
            tiledCurrentStep.kz === 0 && tiledCurrentStep.ky === 0 && tiledCurrentStep.kx === 0) {
            return;
        }
        
        // Move back one kernel position along x
        tiledCurrentStep.kx--;
        
        // Complex logic to handle moving back through a 3D tiled implementation
        if (tiledCurrentStep.kx < 0) {
            tiledCurrentStep.ky--;
            tiledCurrentStep.kx = kernelSize - 1;
            
            if (tiledCurrentStep.ky < 0) {
                tiledCurrentStep.kz--;
                tiledCurrentStep.ky = kernelSize - 1;
                
                if (tiledCurrentStep.kz < 0) {
                    tiledCurrentStep.x--;
                    tiledCurrentStep.kz = kernelSize - 1;
                    
                    const tileStartX = tiledCurrentStep.tileX * tileSize;
                    if (tiledCurrentStep.x < tileStartX) {
                        tiledCurrentStep.y--;
                        const tileEndX = Math.min(tileStartX + tileSize - kernelSize, volumeSize - kernelSize);
                        tiledCurrentStep.x = tileEndX;
                        
                        const tileStartY = tiledCurrentStep.tileY * tileSize;
                        if (tiledCurrentStep.y < tileStartY) {
                            tiledCurrentStep.z--;
                            const tileEndY = Math.min(tileStartY + tileSize - kernelSize, volumeSize - kernelSize);
                            tiledCurrentStep.y = tileEndY;
                            
                            const tileStartZ = tiledCurrentStep.tileZ * tileSize;
                            if (tiledCurrentStep.z < tileStartZ) {
                                tiledCurrentStep.tileX--;
                                
                                if (tiledCurrentStep.tileX < 0) {
                                    tiledCurrentStep.tileY--;
                                    tiledCurrentStep.tileX = Math.ceil(volumeSize / tileSize) - 1;
                                    
                                    if (tiledCurrentStep.tileY < 0) {
                                        tiledCurrentStep.tileZ--;
                                        tiledCurrentStep.tileY = Math.ceil(volumeSize / tileSize) - 1;
                                        
                                        if (tiledCurrentStep.tileZ < 0) {
                                            // Reset to beginning
                                            tiledCurrentStep.tileZ = 0;
                                            tiledCurrentStep.tileY = 0;
                                            tiledCurrentStep.tileX = 0;
                                            tiledCurrentStep.z = 0;
                                            tiledCurrentStep.y = 0;
                                            tiledCurrentStep.x = 0;
                                            tiledCurrentStep.kz = 0;
                                            tiledCurrentStep.ky = 0;
                                            tiledCurrentStep.kx = 0;
                                            return;
                                        }
                                    }
                                }
                            }
                            
                            // Set position to bottom-right of the new tile
                            const newTileStartZ = tiledCurrentStep.tileZ * tileSize;
                            const newTileStartY = tiledCurrentStep.tileY * tileSize;
                            const newTileStartX = tiledCurrentStep.tileX * tileSize;
                            const tileEndZ = Math.min(newTileStartZ + tileSize - kernelSize, volumeSize - kernelSize);
                            const newTileEndY = Math.min(newTileStartY + tileSize - kernelSize, volumeSize - kernelSize);
                            const newTileEndX = Math.min(newTileStartX + tileSize - kernelSize, volumeSize - kernelSize);
                            tiledCurrentStep.z = tileEndZ;
                            tiledCurrentStep.y = newTileEndY;
                            tiledCurrentStep.x = newTileEndX;
                        }
                    }
                }
            }
        }
    }
    
    // Run animation
    function animate() {
        if (!isAnimating) return;
        
        const naiveHasMore = naiveStep();
        const tiledHasMore = tiledStep();
        
        // Auto-update view to show active slice
        if (naiveCurrentStep.z >= 0 && naiveCurrentStep.z < volumeSize) {
            currentViewZ = naiveCurrentStep.z;
        }
        if (naiveCurrentStep.z >= 0 && naiveCurrentStep.z < volumeSize - kernelSize + 1) {
            currentOutputViewZ = naiveCurrentStep.z;
        }
        
        draw3DVolumes();
        
        if (!naiveHasMore && !tiledHasMore) {
            stopAnimation();
        }
    }
    
    // Start animation
    function startAnimation() {
        if (isAnimating) return;
        
        isAnimating = true;
        playButton.textContent = 'Pause';
        animationInterval = setInterval(animate, 500);
    }
    
    // Stop animation
    function stopAnimation() {
        if (!isAnimating) return;
        
        isAnimating = false;
        playButton.textContent = 'Play Animation';
        clearInterval(animationInterval);
    }
    
    // Reset visualization
    function resetVisualization() {
        stopAnimation();
        
        // Reset output volumes
        const outputSize = volumeSize - kernelSize + 1;
        for (let z = 0; z < outputSize; z++) {
            for (let y = 0; y < outputSize; y++) {
                for (let x = 0; x < outputSize; x++) {
                    naiveOutputVolume[z][y][x] = 0;
                    tiledOutputVolume[z][y][x] = 0;
                }
            }
        }
        
        // Reset step trackers
        naiveCurrentStep = {x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
        tiledCurrentStep = {tileX: 0, tileY: 0, tileZ: 0, x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
        
        draw3DVolumes();
    }
    
    // Event listeners
    volumeSizeSlider.addEventListener('input', function() {
        volumeSize = parseInt(this.value);
        volumeSizeValue.textContent = `${volumeSize}×${volumeSize}×${volumeSize}`;
        
        // Ensure kernel size doesn't exceed volume size
        if (kernelSize > volumeSize) {
            kernelSize = volumeSize;
            kernelSizeSlider.value = kernelSize;
            kernelSizeValue.textContent = `${kernelSize}×${kernelSize}×${kernelSize}`;
        }
        
        resetVisualization();
        initializeVolumes();
        draw3DVolumes();
    });
    
    kernelSizeSlider.addEventListener('input', function() {
        // Ensure kernel size doesn't exceed volume size
        kernelSize = Math.min(parseInt(this.value), volumeSize);
        kernelSizeValue.textContent = `${kernelSize}×${kernelSize}×${kernelSize}`;
        
        // Update slider value if it was constrained
        if (parseInt(this.value) !== kernelSize) {
            this.value = kernelSize;
        }
        
        resetVisualization();
        initializeVolumes();
        draw3DVolumes();
    });
    
    tileSizeSlider.addEventListener('input', function() {
        tileSize = parseInt(this.value);
        tileSizeValue.textContent = `${tileSize}×${tileSize}×${tileSize}`;
        resetVisualization();
        tiledCurrentStep = {tileX: 0, tileY: 0, tileZ: 0, x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
        draw3DVolumes();
    });
    
    operationSelect.addEventListener('change', function() {
        operation = this.value;
        resetVisualization();
        draw3DVolumes();
    });
    
    randomButton.addEventListener('click', function() {
        resetVisualization();
        initializeVolumes();
        draw3DVolumes();
    });
    
    playButton.addEventListener('click', function() {
        if (isAnimating) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });
    
    stepButton.addEventListener('click', function() {
        naiveStep();
        tiledStep();
        draw3DVolumes();
    });
    
    // Add event listener for rewind button
    const rwdButton = document.getElementById('3d-rwd');
    
    // Rewind button click handler
    rwdButton.addEventListener('click', function() {
        naiveBackStep();
        tiledBackStep();
        draw3DVolumes();
    });
    
    resetButton.addEventListener('click', resetVisualization);
    
    // Initialize
    initializeVolumes();
    draw3DVolumes();
}

// Add this at the end of visualizer.js
console.log("Visualizer script loaded");
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    console.log("1D canvas element exists:", !!document.getElementById('1d-naive-canvas'));
}); 