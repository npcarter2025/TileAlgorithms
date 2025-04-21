# Convolution and Cross-Correlation Implementations

This repository contains implementations of 1D and 2D convolution and cross-correlation operations with both naive and tiled approaches.

## Interactive Visualizer

**[Try the Interactive Visualizer!](https://npcarter2025.github.io/TileAlgorithms/)** - An interactive web-based visualization tool to help understand how convolution and cross-correlation algorithms work, with both naive and tiled implementations.

## Quick Start

### Using the Shell Script

For your convenience, a shell script is provided to compile and run all implementations:

```bash
# Change to the coding_practice directory
cd coding_practice

# Make the script executable
chmod +x run_all_tests.sh

# Run the script
./run_all_tests.sh
```

The script will compile all implementations and place the executables in the `bin` directory. It will then present you with a menu to choose which mode to run:
1. **Template Mode** - Practice implementing the algorithms yourself
2. **Complete Implementations Mode** - Run tests with fully implemented algorithms

### Using Make

Alternatively, you can use the provided Makefile:

```bash
# Change to the coding_practice directory
cd coding_practice

# Compile all implementations
make

# Compile only template files
make templates

# Compile only implementation files
make implementations

# Clean up all binaries
make clean

# Clean only template binaries
make clean-templates

# Clean only implementation binaries
make clean-implementations
```

### Template Mode

This mode is designed for practice and learning. It allows you to:
1. Select one of the algorithms (naive or tiled versions of cross-correlation and convolution)
2. Implement the algorithm yourself by filling in the blank loops with the correct indices
3. Test your implementation with example inputs
4. Optionally view the correct answer if you get stuck

### Complete Implementations Mode

This mode provides access to all the features of the fully implemented algorithms:
1. Run default tests with reasonable input sizes
2. Optimize tile sizes automatically to find the best performance
3. Run performance comparisons between naive and tiled implementations
4. Test with custom input values in interactive mode

### Features

1. **Default Values**: The script uses reasonable default values for array sizes and tile sizes, so you don't have to enter them manually.

2. **Tile Size Optimization**: The script can automatically test multiple tile size combinations to find the optimal configuration for maximum performance.

3. **Interactive Mode**: If you still want to input your own values, you can use the interactive mode.

4. **Template Practice**: Write your own implementations and test them against the provided examples.

5. **Answer Viewing**: If you get stuck implementing an algorithm, you can choose to view the correct answer.

6. **Organized Executables**: All compiled programs are placed in the `bin` directory to keep the workspace clean.

7. **Makefile Support**: Use `make` commands for building, cleaning, and managing the codebase.

To use these features, select the corresponding option from the menu when running the script:
- Template Mode: Practice implementing algorithms yourself
- Complete Mode: Access optimizations and performance tests
  - Options 1-3: Run individual tests with default values
  - Options 7-9: Run optimization to find the best tile sizes
  - Option 10: Run all optimizations
  - Option 0: Interactive mode (prompts for all values)

## Cross-Correlation

Cross-correlation is a measure of similarity between two sequences. In signal processing, it's often used to search for a particular pattern within a signal. 

### Implementation Details:

- **Naive Cross-Correlation**: A straightforward implementation that computes each output element directly.
- **Tiled Cross-Correlation**: An optimized implementation that processes data in tiles to improve cache utilization.

## 1D Convolution

Convolution is a mathematical operation that expresses how the shape of one function is modified by another. In 1D convolution, the kernel is flipped before the operation.

### Implementation Details:

- **Naive 1D Convolution**: A direct implementation that computes each output element by summing the products of input elements and the flipped kernel.
- **Tiled 1D Convolution**: An optimized implementation that processes the signal in chunks to improve cache locality.

## 2D Convolution

2D convolution extends the concept to matrices, widely used in image processing for operations like blurring, sharpening, and edge detection. The kernel is flipped both horizontally and vertically.

### Implementation Details:

- **Naive 2D Convolution**: A straightforward implementation with four nested loops to compute each output pixel.
- **Tiled 2D Convolution**: An implementation that processes the image in tiles to improve cache performance.

## 3D Convolution

3D convolution further extends the concept to volumetric data, which is essential for processing 3D images, videos (where time is the third dimension), or scientific data like MRI scans. The kernel is flipped in all three dimensions.

### Implementation Details:

- **Naive 3D Convolution**: A direct implementation with six nested loops (three for output positions, three for kernel positions) to compute each output voxel.
- **Tiled 3D Convolution**: An optimized implementation that processes the volume in 3D tiles to improve cache locality and performance.

## Learning the Algorithms

To gain a better understanding of how these algorithms work, the Template Mode allows you to implement them yourself:

1. For each algorithm, you are provided with a template where you need to:
   - Fill in the correct loop indices
   - Calculate the proper array indices
   - Handle special cases (like remainder tiles)

2. The templates include helpful comments that guide you through the implementation.

3. After implementing, you can run the code with example inputs to test your solution.

4. If you get stuck, you can view the complete answer to learn from it.

## Performance Comparison

Each folder contains a comparison program that measures the performance difference between the naive and tiled implementations.

## Directory Structure

- `bin/` - Contains all compiled executables (created when you run the script or make)
- `templates/` - Contains template files for practice
- `cross_correlation/` - Cross-correlation implementations
- `1d_convolution/` - 1D convolution implementations
- `2d_convolution/` - 2D convolution implementations

## Manual Compilation and Running Instructions

### Cross-Correlation

#### Compiling the implementations:
```bash
# Compile the naive implementation
gcc -o bin/naive_cross_correlation cross_correlation/naive/cross_correlation.c

# Compile the tiled implementation
gcc -o bin/tiled_cross_correlation cross_correlation/tiled/tiled_cross_correlation.c

# Compile the performance comparison
gcc -o bin/cross_correlation_comparison cross_correlation/cross_correlation_comparison.c
```

#### Running the tests:
```bash
# Run the naive implementation
bin/naive_cross_correlation

# Run the tiled implementation
bin/tiled_cross_correlation

# Run the performance comparison (recommended)
bin/cross_correlation_comparison
```

For the performance comparison, you'll be prompted to enter:
- Size of array A (e.g., 10000)
- Size of array B (e.g., 1000)
- Tile size for array A (e.g., 100)
- Tile size for array B (e.g., 50)

The program will generate random inputs, verify that both implementations produce the same results, and compare their performance.

### 1D Convolution

#### Compiling the implementations:
```bash
# Compile the naive implementation
gcc -o bin/naive_convolution 1d_convolution/naive/convolution.c

# Compile the tiled implementation
gcc -o bin/tiled_convolution 1d_convolution/tiled/tiled_convolution.c

# Compile the performance comparison
gcc -o bin/convolution_comparison 1d_convolution/convolution_comparison.c
```

#### Running the tests:
```bash
# Run the naive implementation
bin/naive_convolution

# Run the tiled implementation
bin/tiled_convolution

# Run the performance comparison (recommended)
bin/convolution_comparison
```

### 2D Convolution

#### Compiling the implementations:
```bash
# Compile the naive implementation
gcc -o bin/convolution_2d 2d_convolution/naive/convolution_2d.c

# Compile the tiled implementation
gcc -o bin/tiled_convolution_2d 2d_convolution/tiled/tiled_convolution_2d.c

# Compile the performance comparison
gcc -o bin/convolution_2d_comparison 2d_convolution/convolution_2d_comparison.c
```

#### Running the tests:
```bash
# Run the naive implementation
bin/convolution_2d

# Run the tiled implementation
bin/tiled_convolution_2d

# Run the performance comparison (recommended)
bin/convolution_2d_comparison
```

### 3D Convolution

#### Compiling the implementations:
```bash
# Compile the naive implementation
gcc -o bin/convolution_3d 3d_convolution/naive/convolution_3d.c

# Compile the tiled implementation
gcc -o bin/tiled_convolution_3d 3d_convolution/tiled/tiled_convolution_3d.c

# Compile the performance comparison
gcc -o bin/convolution_3d_comparison 3d_convolution/convolution_3d_comparison.c
```

#### Running the tests:
```bash
# Run the naive implementation
bin/convolution_3d

# Run the tiled implementation
bin/tiled_convolution_3d

# Run the performance comparison (recommended)
bin/convolution_3d_comparison
```

## Default Values

The script uses the following default values:

### 1D Cross-Correlation and Convolution:
- Array A size: 50,000 elements
- Array B (kernel) size: 2,000 elements  
- Tile A size: 64 elements
- Tile B size: 32 elements

### 2D Convolution:
- Matrix A size: 500×500
- Kernel B size: 5×5
- Tile height: 32
- Tile width: 32

### 3D Convolution:
- Volume A size: 50×50×50
- Kernel B size: 5×5×5
- Tile size: 8×8×8

## Tile Size Optimization

The optimization feature tests multiple combinations of tile sizes to find the one that yields the best performance. It tests the following tile sizes:

### 1D Algorithms:
- For tile_A and tile_B: 16, 32, 64, 128, 256 (where applicable)

### 2D Algorithms:
- For tile_height and tile_width: 8, 16, 32, 64

## Experiment Suggestions

For best results when comparing naive and tiled implementations:

1. **Input Sizes**: Use large input sizes to observe significant performance differences
   - For 1D algorithms: Try array A of size 50,000-100,000 and array B of size 1,000-5,000
   - For 2D algorithms: Try matrices of size 1000×1000 with kernels of size 5×5 to 20×20

2. **Tile Sizes**: Experiment with different tile sizes to find the optimal configuration
   - For 1D algorithms: Try tile sizes between 16-256
   - For 2D algorithms: Try tile sizes between 8×8 and 64×64

3. **Multiple Runs**: The comparison programs run multiple iterations to provide more accurate timing

## Key Concepts

- **Tiling**: Dividing the computation into smaller chunks that fit into cache, improving data locality and reducing cache misses.
- **Cache Utilization**: The tiled implementations are designed to maximize the reuse of data while it's in cache.
- **Memory Access Patterns**: Optimizing the order of operations to make memory accesses more sequential and predictable.

## Difference between Convolution and Cross-Correlation

The key difference between convolution and cross-correlation is that in convolution, the kernel is flipped before the operation, while in cross-correlation, the kernel is used as is. In mathematical terms:

- **Cross-Correlation**: (f ⋆ g)(t) = ∫f(τ)g(t+τ)dτ
- **Convolution**: (f * g)(t) = ∫f(τ)g(t-τ)dτ

For symmetric kernels, the results of convolution and cross-correlation are identical. 