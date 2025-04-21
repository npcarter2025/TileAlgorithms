#include <stdio.h>
#include <stdlib.h>
#include <time.h>

/**
 * Naive 1D convolution implementation.
 */
void naive_convolution_1d(int *A, int size_A, int *B, int size_B, int *C) {
    // Initialize C array elements to 0
    for (int k = 0; k < size_A - size_B + 1; k++) {
        C[k] = 0;
    }
    
    // Perform convolution - the kernel is flipped in convolution compared to cross-correlation
    for (register int i = 0; i < size_A - size_B + 1; i++) {
        for (register int j = 0; j < size_B; j++) {
            // Note: B is accessed in reverse order for convolution (B[size_B - 1 - j])
            C[i] += A[i + j] * B[size_B - 1 - j];
        }
    }
}

/**
 * Tiled 1D convolution implementation.
 */
void tiled_convolution_1d(int *A, int size_A, int *B, int size_B, int *C, int tile_A, int tile_B) {
    // Initialize C array elements to 0
    for (int k = 0; k < size_A - size_B + 1; k++) {
        C[k] = 0;
    }
    
    // Process kernel B in tiles of size tile_B
    for (register int i = 0; i < size_B / tile_B; i++) {
        for (register int j = 0; j < size_A - size_B + 1; j++) {
            for (register int k = 0; k < tile_B; k++) {
                // Reversed kernel for convolution (size_B - 1 - (i * tile_B + k))
                int kernel_idx = size_B - 1 - (i * tile_B + k);
                C[j] += A[j + i * tile_B + k] * B[kernel_idx];
            }
        }
    }
    
    // Process the remainder of kernel B (if size_B is not a multiple of tile_B)
    for (register int i = 0; i < size_A - size_B + 1; i++) {
        for (register int k = size_B - size_B % tile_B; k < size_B; k++) {
            // Reversed kernel for convolution (size_B - 1 - k)
            int kernel_idx = size_B - 1 - k;
            C[i] += A[i + k] * B[kernel_idx];
        }
    }
}

/**
 * Helper function to print an array
 */
void print_array(int *arr, int size, const char *name) {
    printf("%s = [", name);
    for (int i = 0; i < size; i++) {
        printf("%d", arr[i]);
        if (i < size - 1) printf(", ");
    }
    printf("]\n");
}

/**
 * Helper function to check if two arrays are equal
 */
int arrays_equal(int *A, int *B, int size) {
    for (int i = 0; i < size; i++) {
        if (A[i] != B[i]) {
            return 0;
        }
    }
    return 1;
}

/**
 * Helper function to measure execution time
 */
double measure_time(void (*func)(int*, int, int*, int, int*), int *A, int size_A, int *B, int size_B, int *C, int iterations) {
    clock_t start, end;
    double total_time = 0.0;
    
    for (int iter = 0; iter < iterations; iter++) {
        start = clock();
        func(A, size_A, B, size_B, C);
        end = clock();
        total_time += ((double) (end - start)) / CLOCKS_PER_SEC;
    }
    
    return total_time / iterations;
}

/**
 * Wrapper for tiled convolution to match the function signature for timing
 */
void tiled_wrapper(int *A, int size_A, int *B, int size_B, int *C) {
    // Use fixed tile sizes for the wrapper
    int tile_A = 64;
    int tile_B = 32;
    tiled_convolution_1d(A, size_A, B, size_B, C, tile_A, tile_B);
}

int main() {
    printf("=== 1D Convolution Performance Comparison ===\n\n");
    
    // Get array sizes from user
    int size_A, size_B, tile_A, tile_B;
    
    printf("Enter size of input array A: ");
    scanf("%d", &size_A);
    
    printf("Enter size of kernel B: ");
    scanf("%d", &size_B);
    
    // Validate that size_B <= size_A
    if (size_B > size_A) {
        printf("Error: Kernel size must be less than or equal to input size\n");
        return 1;
    }
    
    printf("Enter tile size for array A: ");
    scanf("%d", &tile_A);
    
    printf("Enter tile size for kernel B: ");
    scanf("%d", &tile_B);
    
    // Allocate memory for arrays
    int *A = (int*)malloc(size_A * sizeof(int));
    int *B = (int*)malloc(size_B * sizeof(int));
    int *C_naive = (int*)malloc((size_A - size_B + 1) * sizeof(int));
    int *C_tiled = (int*)malloc((size_A - size_B + 1) * sizeof(int));
    
    if (!A || !B || !C_naive || !C_tiled) {
        printf("Memory allocation failed\n");
        return 1;
    }
    
    // Initialize arrays with random values
    srand(time(NULL));
    for (int i = 0; i < size_A; i++) {
        A[i] = rand() % 100;
    }
    
    for (int i = 0; i < size_B; i++) {
        B[i] = rand() % 10;
    }
    
    // Perform both convolution methods
    naive_convolution_1d(A, size_A, B, size_B, C_naive);
    tiled_convolution_1d(A, size_A, B, size_B, C_tiled, tile_A, tile_B);
    
    // Verify correctness
    if (!arrays_equal(C_naive, C_tiled, size_A - size_B + 1)) {
        printf("ERROR: Naive and tiled implementations produce different results!\n");
        
        // Print first few elements for debugging
        printf("First 10 elements of naive result: ");
        for (int i = 0; i < 10 && i < size_A - size_B + 1; i++) {
            printf("%d ", C_naive[i]);
        }
        printf("\n");
        
        printf("First 10 elements of tiled result: ");
        for (int i = 0; i < 10 && i < size_A - size_B + 1; i++) {
            printf("%d ", C_tiled[i]);
        }
        printf("\n");
        
        return 1;
    }
    
    printf("Naive and tiled implementations produce identical results.\n\n");
    
    // Measure performance
    int iterations = 10;
    printf("Running performance test with %d iterations...\n", iterations);
    
    double naive_time = measure_time(naive_convolution_1d, A, size_A, B, size_B, C_naive, iterations);
    double tiled_time = measure_time(tiled_wrapper, A, size_A, B, size_B, C_tiled, iterations);
    
    printf("Naive implementation: %.6f seconds per run\n", naive_time);
    printf("Tiled implementation: %.6f seconds per run\n", tiled_time);
    printf("Speedup: %.2fx\n", naive_time / tiled_time);
    
    // Free allocated memory
    free(A);
    free(B);
    free(C_naive);
    free(C_tiled);
    
    return 0;
} 