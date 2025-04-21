#include <stdio.h>
#include <stdlib.h>
#include <time.h>

/**
 * Naive 2D convolution implementation.
 */
void naive_convolution_2d(int **A, int height_A, int width_A, 
                         int **B, int height_B, int width_B, 
                         int **C) {
    // Initialize C matrix elements to 0
    for (int i = 0; i < height_A - height_B + 1; i++) {
        for (int j = 0; j < width_A - width_B + 1; j++) {
            C[i][j] = 0;
        }
    }
    
    // Perform 2D convolution
    for (int i = 0; i < height_A - height_B + 1; i++) {
        for (int j = 0; j < width_A - width_B + 1; j++) {
            for (int ki = 0; ki < height_B; ki++) {
                for (int kj = 0; kj < width_B; kj++) {
                    // Note: Kernel is flipped both horizontally and vertically for convolution
                    C[i][j] += A[i + ki][j + kj] * B[height_B - 1 - ki][width_B - 1 - kj];
                }
            }
        }
    }
}

/**
 * Tiled 2D convolution implementation.
 */
void tiled_convolution_2d(int **A, int height_A, int width_A, 
                         int **B, int height_B, int width_B, 
                         int **C, int tile_height, int tile_width) {
    // Initialize C matrix elements to 0
    for (int i = 0; i < height_A - height_B + 1; i++) {
        for (int j = 0; j < width_A - width_B + 1; j++) {
            C[i][j] = 0;
        }
    }
    
    // Output height and width
    int height_C = height_A - height_B + 1;
    int width_C = width_A - width_B + 1;
    
    // Process output matrix in tiles
    for (int i_tile = 0; i_tile < height_C; i_tile += tile_height) {
        for (int j_tile = 0; j_tile < width_C; j_tile += tile_width) {
            // Determine the actual tile size (handle edge tiles)
            int curr_tile_height = (i_tile + tile_height > height_C) ? height_C - i_tile : tile_height;
            int curr_tile_width = (j_tile + tile_width > width_C) ? width_C - j_tile : tile_width;
            
            // For each tile, process all kernel elements
            for (int ki = 0; ki < height_B; ki++) {
                for (int kj = 0; kj < width_B; kj++) {
                    // Compute kernel element value (flipped for convolution)
                    int kernel_val = B[height_B - 1 - ki][width_B - 1 - kj];
                    
                    // Apply kernel element to the current tile
                    for (int i_local = 0; i_local < curr_tile_height; i_local++) {
                        for (int j_local = 0; j_local < curr_tile_width; j_local++) {
                            int i_global = i_tile + i_local;
                            int j_global = j_tile + j_local;
                            
                            C[i_global][j_global] += A[i_global + ki][j_global + kj] * kernel_val;
                        }
                    }
                }
            }
        }
    }
}

/**
 * Helper function to allocate a 2D array
 */
int** allocate_2d_array(int height, int width) {
    int **array = (int**)malloc(height * sizeof(int*));
    if (!array) {
        printf("Memory allocation failed\n");
        exit(1);
    }
    
    for (int i = 0; i < height; i++) {
        array[i] = (int*)malloc(width * sizeof(int));
        if (!array[i]) {
            printf("Memory allocation failed\n");
            exit(1);
        }
    }
    
    return array;
}

/**
 * Helper function to free a 2D array
 */
void free_2d_array(int **array, int height) {
    if (!array) return;
    
    for (int i = 0; i < height; i++) {
        if (array[i]) free(array[i]);
    }
    
    free(array);
}

/**
 * Helper function to print a 2D array
 */
void print_2d_array(int **array, int height, int width, const char *name) {
    printf("%s = [\n", name);
    for (int i = 0; i < height; i++) {
        printf("  [");
        for (int j = 0; j < width; j++) {
            printf("%d", array[i][j]);
            if (j < width - 1) printf(", ");
        }
        printf("]");
        if (i < height - 1) printf(",");
        printf("\n");
    }
    printf("]\n");
}

/**
 * Helper function to check if two 2D arrays are equal
 */
int arrays_2d_equal(int **A, int **B, int height, int width) {
    for (int i = 0; i < height; i++) {
        for (int j = 0; j < width; j++) {
            if (A[i][j] != B[i][j]) {
                return 0;
            }
        }
    }
    return 1;
}

/**
 * Helper function to measure execution time for naive 2D convolution
 */
double measure_time_naive(int **A, int height_A, int width_A, 
                         int **B, int height_B, int width_B, 
                         int **C, int iterations) {
    clock_t start, end;
    double total_time = 0.0;
    
    for (int iter = 0; iter < iterations; iter++) {
        start = clock();
        naive_convolution_2d(A, height_A, width_A, B, height_B, width_B, C);
        end = clock();
        total_time += ((double) (end - start)) / CLOCKS_PER_SEC;
    }
    
    return total_time / iterations;
}

/**
 * Helper function to measure execution time for tiled 2D convolution
 */
double measure_time_tiled(int **A, int height_A, int width_A, 
                         int **B, int height_B, int width_B, 
                         int **C, int tile_height, int tile_width, int iterations) {
    clock_t start, end;
    double total_time = 0.0;
    
    for (int iter = 0; iter < iterations; iter++) {
        start = clock();
        tiled_convolution_2d(A, height_A, width_A, B, height_B, width_B, C, tile_height, tile_width);
        end = clock();
        total_time += ((double) (end - start)) / CLOCKS_PER_SEC;
    }
    
    return total_time / iterations;
}

int main() {
    printf("=== 2D Convolution Performance Comparison ===\n\n");
    
    // Get matrix dimensions from user
    int height_A, width_A, height_B, width_B, tile_height, tile_width;
    
    printf("Enter height of input matrix A: ");
    scanf("%d", &height_A);
    
    printf("Enter width of input matrix A: ");
    scanf("%d", &width_A);
    
    printf("Enter height of kernel B: ");
    scanf("%d", &height_B);
    
    printf("Enter width of kernel B: ");
    scanf("%d", &width_B);
    
    // Validate dimensions
    if (height_B > height_A || width_B > width_A) {
        printf("Error: Kernel dimensions must be less than or equal to input dimensions\n");
        return 1;
    }
    
    printf("Enter tile height: ");
    scanf("%d", &tile_height);
    
    printf("Enter tile width: ");
    scanf("%d", &tile_width);
    
    // Allocate memory for matrices
    int **A = allocate_2d_array(height_A, width_A);
    int **B = allocate_2d_array(height_B, width_B);
    int **C_naive = allocate_2d_array(height_A - height_B + 1, width_A - width_B + 1);
    int **C_tiled = allocate_2d_array(height_A - height_B + 1, width_A - width_B + 1);
    
    // Initialize matrices with random values
    srand(time(NULL));
    for (int i = 0; i < height_A; i++) {
        for (int j = 0; j < width_A; j++) {
            A[i][j] = rand() % 100;
        }
    }
    
    for (int i = 0; i < height_B; i++) {
        for (int j = 0; j < width_B; j++) {
            B[i][j] = rand() % 10;
        }
    }
    
    // Perform both convolution methods
    naive_convolution_2d(A, height_A, width_A, B, height_B, width_B, C_naive);
    tiled_convolution_2d(A, height_A, width_A, B, height_B, width_B, C_tiled, tile_height, tile_width);
    
    // Verify correctness
    int height_C = height_A - height_B + 1;
    int width_C = width_A - width_B + 1;
    
    if (!arrays_2d_equal(C_naive, C_tiled, height_C, width_C)) {
        printf("ERROR: Naive and tiled implementations produce different results!\n");
        
        // Print a small section of both results for debugging
        printf("Top-left 3x3 corner of naive result:\n");
        for (int i = 0; i < 3 && i < height_C; i++) {
            for (int j = 0; j < 3 && j < width_C; j++) {
                printf("%d ", C_naive[i][j]);
            }
            printf("\n");
        }
        
        printf("\nTop-left 3x3 corner of tiled result:\n");
        for (int i = 0; i < 3 && i < height_C; i++) {
            for (int j = 0; j < 3 && j < width_C; j++) {
                printf("%d ", C_tiled[i][j]);
            }
            printf("\n");
        }
        
        return 1;
    }
    
    printf("Naive and tiled implementations produce identical results.\n\n");
    
    // Measure performance
    int iterations = 5;
    printf("Running performance test with %d iterations...\n", iterations);
    
    double naive_time = measure_time_naive(A, height_A, width_A, B, height_B, width_B, C_naive, iterations);
    double tiled_time = measure_time_tiled(A, height_A, width_A, B, height_B, width_B, C_tiled, tile_height, tile_width, iterations);
    
    printf("Naive implementation: %.6f seconds per run\n", naive_time);
    printf("Tiled implementation: %.6f seconds per run\n", tiled_time);
    printf("Speedup: %.2fx\n", naive_time / tiled_time);
    
    // Free allocated memory
    free_2d_array(A, height_A);
    free_2d_array(B, height_B);
    free_2d_array(C_naive, height_C);
    free_2d_array(C_tiled, height_C);
    
    return 0;
} 