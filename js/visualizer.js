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
    let kernelSize = parseInt(kernelSizeSlider.value);
    let tileSize = parseInt(tileSizeSlider.value);
    let operation = operationSelect.value;
    let inputArray = [];
    let kernelArray = [];
    let outputArray = [];
    let naiveCurrentStep = {x: 0, k: 0};
    let tiledCurrentStep = {tile: 0, x: 0, k: 0};
    let animationInterval = null;
    let isAnimating = false;
    
    // Initialize the arrays
    function initializeArrays() {
        // Generate random input array
        inputArray = Array.from({length: arraySize}, () => Math.floor(Math.random() * 10));
        
        // Generate random kernel array
        kernelArray = Array.from({length: kernelSize}, () => Math.floor(Math.random() * 5));
        
        // Initialize output array
        outputArray = Array(arraySize - kernelSize + 1).fill(0);
        
        // Reset step trackers
        naiveCurrentStep = {x: 0, k: 0};
        tiledCurrentStep = {tile: 0, x: 0, k: 0};
    }
    
    // Draw 1D array visualization
    function draw1DArrays() {
        // Clear canvases
        while (naiveCanvas.firstChild) naiveCanvas.removeChild(naiveCanvas.firstChild);
        while (tiledCanvas.firstChild) tiledCanvas.removeChild(tiledCanvas.firstChild);
        while (outputCanvas.firstChild) outputCanvas.removeChild(outputCanvas.firstChild);
        
        // Create array containers
        const naiveInputContainer = document.createElement('div');
        naiveInputContainer.className = 'input-array';
        const naiveKernelContainer = document.createElement('div');
        naiveKernelContainer.className = 'kernel-array';
        
        const tiledInputContainer = document.createElement('div');
        tiledInputContainer.className = 'input-array';
        const tiledKernelContainer = document.createElement('div');
        tiledKernelContainer.className = 'kernel-array';
        
        const outputContainer = document.createElement('div');
        outputContainer.className = 'output-array';
        
        // Calculate cell size
        const cellSize = Math.min(naiveCanvas.clientWidth / arraySize, 30);
        
        // Draw naive implementation
        for (let i = 0; i < arraySize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
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
        
        // Draw output array
        for (let i = 0; i < outputArray.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell output';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.textContent = outputArray[i];
            
            if (i === naiveCurrentStep.x || i === tiledCurrentStep.x) {
                cell.classList.add('active');
            }
            
            outputContainer.appendChild(cell);
        }
        
        // Add elements to canvases
        naiveCanvas.appendChild(naiveInputContainer);
        naiveCanvas.appendChild(naiveKernelContainer);
        
        tiledCanvas.appendChild(tiledInputContainer);
        tiledCanvas.appendChild(tiledKernelContainer);
        
        outputCanvas.appendChild(outputContainer);
    }
    
    // Perform one step of naive convolution/cross-correlation
    function naiveStep() {
        if (naiveCurrentStep.x >= outputArray.length) {
            return false; // Computation complete
        }
        
        // Get current position
        const {x, k} = naiveCurrentStep;
        
        // Update output at current position
        const kernelIdx = operation === 'convolution' ? kernelSize - 1 - k : k;
        outputArray[x] += inputArray[x + k] * kernelArray[kernelIdx];
        
        // Move to next position
        naiveCurrentStep.k++;
        if (naiveCurrentStep.k >= kernelSize) {
            naiveCurrentStep.k = 0;
            naiveCurrentStep.x++;
        }
        
        return true; // Still computing
    }
    
    // Perform one step of tiled convolution/cross-correlation
    function tiledStep() {
        if (tiledCurrentStep.tile >= Math.ceil(arraySize / tileSize)) {
            return false; // Computation complete
        }
        
        // Get current position
        const {tile, x, k} = tiledCurrentStep;
        
        // Check if current position is valid
        if (x < outputArray.length && x + k < arraySize) {
            // Update output at current position
            const kernelIdx = operation === 'convolution' ? kernelSize - 1 - k : k;
            outputArray[x] += inputArray[x + k] * kernelArray[kernelIdx];
        }
        
        // Move to next position
        tiledCurrentStep.k++;
        if (tiledCurrentStep.k >= kernelSize) {
            tiledCurrentStep.k = 0;
            tiledCurrentStep.x++;
            
            // Check if we've processed all elements in this tile
            const tileEnd = Math.min((tile + 1) * tileSize, outputArray.length);
            if (tiledCurrentStep.x >= tileEnd) {
                tiledCurrentStep.x = tile * tileSize;
                tiledCurrentStep.tile++;
            }
        }
        
        return tiledCurrentStep.tile < Math.ceil(arraySize / tileSize);
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
        
        // Reset output array
        outputArray.fill(0);
        
        // Reset step trackers
        naiveCurrentStep = {x: 0, k: 0};
        tiledCurrentStep = {tile: 0, x: 0, k: 0};
        
        draw1DArrays();
    }
    
    // Event listeners
    arraySizeSlider.addEventListener('input', function() {
        arraySize = parseInt(this.value);
        arraySizeValue.textContent = arraySize;
        resetVisualization();
        initializeArrays();
        draw1DArrays();
    });
    
    kernelSizeSlider.addEventListener('input', function() {
        kernelSize = parseInt(this.value);
        kernelSizeValue.textContent = kernelSize;
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
        stopAnimation();
        animate();
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
    let outputMatrix = [];
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
        
        // Initialize output matrix
        const outputSize = matrixSize - kernelSize + 1;
        outputMatrix = Array.from({length: outputSize}, () => 
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
        while (outputCanvas.firstChild) outputCanvas.removeChild(outputCanvas.firstChild);
        
        // Calculate cell size
        const cellSize = Math.min(
            Math.min(naiveCanvas.clientWidth, naiveCanvas.clientHeight) / matrixSize,
            20
        );
        
        // Draw naive implementation
        const naiveMatrixContainer = document.createElement('div');
        naiveMatrixContainer.style.display = 'grid';
        naiveMatrixContainer.style.gridTemplateColumns = `repeat(${matrixSize}, ${cellSize}px)`;
        naiveMatrixContainer.style.gap = '1px';
        
        for (let y = 0; y < matrixSize; y++) {
            for (let x = 0; x < matrixSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
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
        tiledMatrixContainer.style.gap = '1px';
        
        for (let y = 0; y < matrixSize; y++) {
            for (let x = 0; x < matrixSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
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
        
        // Draw output matrix
        const outputSize = matrixSize - kernelSize + 1;
        const outputMatrixContainer = document.createElement('div');
        outputMatrixContainer.style.display = 'grid';
        outputMatrixContainer.style.gridTemplateColumns = `repeat(${outputSize}, ${cellSize}px)`;
        outputMatrixContainer.style.gap = '1px';
        
        for (let y = 0; y < outputSize; y++) {
            for (let x = 0; x < outputSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell output';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.textContent = outputMatrix[y][x];
                
                // Highlight active output elements
                if ((y === naiveCurrentStep.y && x === naiveCurrentStep.x) || 
                    (y === tiledCurrentStep.y && x === tiledCurrentStep.x)) {
                    cell.classList.add('active');
                }
                
                outputMatrixContainer.appendChild(cell);
            }
        }
        
        // Add elements to canvases
        naiveCanvas.appendChild(naiveMatrixContainer);
        tiledCanvas.appendChild(tiledMatrixContainer);
        outputCanvas.appendChild(outputMatrixContainer);
    }
    
    // Perform one step of naive 2D convolution/cross-correlation
    function naiveStep() {
        const outputSize = matrixSize - kernelSize + 1;
        if (naiveCurrentStep.y >= outputSize) {
            return false; // Computation complete
        }
        
        // Get current position
        const {x, y, kx, ky} = naiveCurrentStep;
        
        // Update output at current position
        const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
        const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
        outputMatrix[y][x] += inputMatrix[y + ky][x + kx] * kernelMatrix[kernelY][kernelX];
        
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
        
        return naiveCurrentStep.y < outputSize;
    }
    
    // Perform one step of tiled 2D convolution/cross-correlation
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
        if (y < outputSize && x < outputSize && y + ky < matrixSize && x + kx < matrixSize) {
            // Update output at current position
            const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
            const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
            outputMatrix[y][x] += inputMatrix[y + ky][x + kx] * kernelMatrix[kernelY][kernelX];
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
        
        return tiledCurrentStep.tileY < numTilesY;
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
        
        // Reset output matrix
        const outputSize = matrixSize - kernelSize + 1;
        outputMatrix = Array.from({length: outputSize}, () => Array(outputSize).fill(0));
        
        // Reset step trackers
        naiveCurrentStep = {x: 0, y: 0, kx: 0, ky: 0};
        tiledCurrentStep = {tileX: 0, tileY: 0, x: 0, y: 0, kx: 0, ky: 0};
        
        draw2DMatrices();
    }
    
    // Event listeners
    matrixSizeSlider.addEventListener('input', function() {
        matrixSize = parseInt(this.value);
        matrixSizeValue.textContent = `${matrixSize}×${matrixSize}`;
        resetVisualization();
        initializeMatrices();
        draw2DMatrices();
    });
    
    kernelSizeSlider.addEventListener('input', function() {
        kernelSize = parseInt(this.value);
        kernelSizeValue.textContent = `${kernelSize}×${kernelSize}`;
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
        stopAnimation();
        animate();
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
    let outputVolume = [];
    let naiveCurrentStep = {x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
    let tiledCurrentStep = {tileX: 0, tileY: 0, tileZ: 0, x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
    let animationInterval = null;
    let isAnimating = false;
    
    // Current view slice
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
        
        // Initialize output volume
        const outputSize = volumeSize - kernelSize + 1;
        outputVolume = Array.from({length: outputSize}, () => 
            Array.from({length: outputSize}, () =>
                Array(outputSize).fill(0)
            )
        );
        
        // Reset step trackers
        naiveCurrentStep = {x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
        tiledCurrentStep = {tileX: 0, tileY: 0, tileZ: 0, x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
        
        // Reset view slices
        currentViewZ = 0;
        currentOutputViewZ = 0;
    }
    
    // Draw 3D volume visualization (showing 2D slices)
    function draw3DVolumes() {
        // Clear canvases
        while (naiveCanvas.firstChild) naiveCanvas.removeChild(naiveCanvas.firstChild);
        while (tiledCanvas.firstChild) tiledCanvas.removeChild(tiledCanvas.firstChild);
        while (outputCanvas.firstChild) outputCanvas.removeChild(outputCanvas.firstChild);
        
        // Add slice controls if they don't exist
        if (!document.querySelector('.three-d-controls')) {
            // For input volume
            const volumeControls = document.createElement('div');
            volumeControls.className = 'three-d-controls';
            
            const prevButton = document.createElement('button');
            prevButton.className = 'three-d-view-button';
            prevButton.textContent = '← Prev Slice';
            prevButton.addEventListener('click', function() {
                currentViewZ = Math.max(0, currentViewZ - 1);
                draw3DVolumes();
            });
            
            const sliceIndicator = document.createElement('span');
            sliceIndicator.id = 'volume-slice-indicator';
            sliceIndicator.textContent = `Slice ${currentViewZ + 1}/${volumeSize}`;
            
            const nextButton = document.createElement('button');
            nextButton.className = 'three-d-view-button';
            nextButton.textContent = 'Next Slice →';
            nextButton.addEventListener('click', function() {
                currentViewZ = Math.min(volumeSize - 1, currentViewZ + 1);
                draw3DVolumes();
            });
            
            volumeControls.appendChild(prevButton);
            volumeControls.appendChild(sliceIndicator);
            volumeControls.appendChild(nextButton);
            
            naiveCanvas.parentNode.insertBefore(volumeControls.cloneNode(true), naiveCanvas);
            tiledCanvas.parentNode.insertBefore(volumeControls.cloneNode(true), tiledCanvas);
            
            // For output volume
            const outputControls = document.createElement('div');
            outputControls.className = 'three-d-controls';
            
            const outputPrevButton = document.createElement('button');
            outputPrevButton.className = 'three-d-view-button';
            outputPrevButton.textContent = '← Prev Slice';
            outputPrevButton.addEventListener('click', function() {
                currentOutputViewZ = Math.max(0, currentOutputViewZ - 1);
                draw3DVolumes();
            });
            
            const outputSliceIndicator = document.createElement('span');
            outputSliceIndicator.id = 'output-slice-indicator';
            outputSliceIndicator.textContent = `Slice ${currentOutputViewZ + 1}/${volumeSize}`;
            
            const outputNextButton = document.createElement('button');
            outputNextButton.className = 'three-d-view-button';
            outputNextButton.textContent = 'Next Slice →';
            outputNextButton.addEventListener('click', function() {
                currentOutputViewZ = Math.min(volumeSize - 1, currentOutputViewZ + 1);
                draw3DVolumes();
            });
            
            outputControls.appendChild(outputPrevButton);
            outputControls.appendChild(outputSliceIndicator);
            outputControls.appendChild(outputNextButton);
            
            outputCanvas.parentNode.insertBefore(outputControls, outputCanvas);
        }
        
        // Update slice indicators
        document.querySelectorAll('#volume-slice-indicator').forEach(el => {
            el.textContent = `Slice ${currentViewZ + 1}/${volumeSize}`;
        });
        document.getElementById('output-slice-indicator').textContent = 
            `Slice ${currentOutputViewZ + 1}/${volumeSize}`;
        
        // Calculate cell size
        const cellSize = Math.min(
            Math.min(naiveCanvas.clientWidth, naiveCanvas.clientHeight) / volumeSize,
            20
        );
        
        // Draw naive implementation
        const naiveMatrixContainer = document.createElement('div');
        naiveMatrixContainer.style.display = 'grid';
        naiveMatrixContainer.style.gridTemplateColumns = `repeat(${volumeSize}, ${cellSize}px)`;
        naiveMatrixContainer.style.gap = '1px';
        
        for (let y = 0; y < volumeSize; y++) {
            for (let x = 0; x < volumeSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
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
        
        // Draw tiled implementation
        const tiledMatrixContainer = document.createElement('div');
        tiledMatrixContainer.style.display = 'grid';
        tiledMatrixContainer.style.gridTemplateColumns = `repeat(${volumeSize}, ${cellSize}px)`;
        tiledMatrixContainer.style.gap = '1px';
        
        for (let y = 0; y < volumeSize; y++) {
            for (let x = 0; x < volumeSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
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
        
        // Draw output matrix for current slice
        const outputSize = volumeSize - kernelSize + 1;
        const outputMatrixContainer = document.createElement('div');
        outputMatrixContainer.style.display = 'grid';
        outputMatrixContainer.style.gridTemplateColumns = `repeat(${outputSize}, ${cellSize}px)`;
        outputMatrixContainer.style.gap = '1px';
        
        for (let y = 0; y < outputSize; y++) {
            for (let x = 0; x < outputSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell output';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.textContent = outputVolume[currentOutputViewZ][y][x];
                
                // Highlight active output elements
                if ((currentOutputViewZ === naiveCurrentStep.z && 
                     y === naiveCurrentStep.y && 
                     x === naiveCurrentStep.x) || 
                    (currentOutputViewZ === tiledCurrentStep.z && 
                     y === tiledCurrentStep.y && 
                     x === tiledCurrentStep.x)) {
                    cell.classList.add('active');
                }
                
                outputMatrixContainer.appendChild(cell);
            }
        }
        
        // Add elements to canvases
        naiveCanvas.appendChild(naiveMatrixContainer);
        tiledCanvas.appendChild(tiledMatrixContainer);
        outputCanvas.appendChild(outputMatrixContainer);
    }
    
    // Perform one step of naive 3D convolution/cross-correlation
    function naiveStep() {
        const outputSize = volumeSize - kernelSize + 1;
        if (naiveCurrentStep.z >= outputSize) {
            return false; // Computation complete
        }
        
        // Get current position
        const {x, y, z, kx, ky, kz} = naiveCurrentStep;
        
        // Update output at current position
        const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
        const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
        const kernelZ = operation === 'convolution' ? kernelSize - 1 - kz : kz;
        outputVolume[z][y][x] += inputVolume[z + kz][y + ky][x + kx] * kernelVolume[kernelZ][kernelY][kernelX];
        
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
        
        return naiveCurrentStep.z < outputSize;
    }
    
    // Perform one step of tiled 3D convolution/cross-correlation
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
            z + kz < volumeSize && y + ky < volumeSize && x + kx < volumeSize) {
            // Update output at current position
            const kernelX = operation === 'convolution' ? kernelSize - 1 - kx : kx;
            const kernelY = operation === 'convolution' ? kernelSize - 1 - ky : ky;
            const kernelZ = operation === 'convolution' ? kernelSize - 1 - kz : kz;
            outputVolume[z][y][x] += inputVolume[z + kz][y + ky][x + kx] * kernelVolume[kernelZ][kernelY][kernelX];
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
        
        return tiledCurrentStep.tileZ < numTiles;
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
        
        // Reset output volume
        const outputSize = volumeSize - kernelSize + 1;
        outputVolume = Array.from({length: outputSize}, () => 
            Array.from({length: outputSize}, () =>
                Array(outputSize).fill(0)
            )
        );
        
        // Reset step trackers
        naiveCurrentStep = {x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
        tiledCurrentStep = {tileX: 0, tileY: 0, tileZ: 0, x: 0, y: 0, z: 0, kx: 0, ky: 0, kz: 0};
        
        draw3DVolumes();
    }
    
    // Event listeners
    volumeSizeSlider.addEventListener('input', function() {
        volumeSize = parseInt(this.value);
        volumeSizeValue.textContent = `${volumeSize}×${volumeSize}×${volumeSize}`;
        resetVisualization();
        initializeVolumes();
        draw3DVolumes();
    });
    
    kernelSizeSlider.addEventListener('input', function() {
        kernelSize = parseInt(this.value);
        kernelSizeValue.textContent = `${kernelSize}×${kernelSize}×${kernelSize}`;
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
        stopAnimation();
        animate();
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