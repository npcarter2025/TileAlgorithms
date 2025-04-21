#include <stdio.h>
#include <stdlib.h>

/**
 * Tiled 1D convolution implementation.
 * Takes advantage of data reuse by using tiling.
 * 
 * @param A Input array A
 * @param size_A Length of array A
 * @param B Kernel array B
 * @param size_B Length of array B
 * @param C Output array C (must be pre-allocated with size_A - size_B + 1 elements)
 * @param tile_A Size of tile for array A
 * @param tile_B Size of tile for kernel B
 */
void tiled_convolution_1d(int *A, int size_A, int *B, int size_B, int *C, int tile_A, int tile_B) {
    // Initialize C array elements to 0
    for (int k = 0; k < size_A - size_B + 1; k++) {
        C[k] = 0;
    }
    
    // TODO: Process kernel B in tiles of size tile_B
    // Implement the nested loops for tiled convolution here
    // Hint: Remember that convolution requires the kernel to be reversed
    
    // Outer loop: iterate over kernel B in tiles
    for (register int i = 0; i < /* TODO: Number of tiles in B */; i++) {
        // Middle loop: iterate over output elements
        for (register int j = 0; j < /* TODO: Output size */; j++) {
            // Inner loop: process a single tile
            for (register int k = 0; k < /* TODO: Elements in a tile */; k++) {
                // TODO: Calculate the appropriate index for the reversed kernel
                int kernel_idx = /* TODO: Calculate reversed kernel index */;
                
                // TODO: Calculate the correct indices and update the output
                C[/* TODO */] += A[/* TODO */] * B[/* TODO */];
            }
        }
    }
    
    // TODO: Process the remainder of kernel B (if size_B is not a multiple of tile_B)
    // This is needed when kernel size is not perfectly divisible by tile_B
    
    for (register int i = 0; i < /* TODO: Output size */; i++) {
        for (register int k = /* TODO: Start from remainder */; k < /* TODO: End at size_B */; k++) {
            // TODO: Calculate the appropriate index for the reversed kernel
            int kernel_idx = /* TODO: Calculate reversed kernel index */;
            
            // TODO: Calculate the correct indices and update the output
            C[/* TODO */] += A[/* TODO */] * B[/* TODO */];
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

int main() {
    printf("=== Tiled 1D Convolution Template ===\n\n");
    
    // Example with tiling
    int A[] = {1, 2, 3, 4, 5, 6, 7, 8};
    int B[] = {2, 1, 3};
    int size_A = sizeof(A) / sizeof(A[0]);
    int size_B = sizeof(B) / sizeof(B[0]);
    int C[size_A - size_B + 1];
    
    // You can experiment with different tile sizes
    int tile_A = 4;
    int tile_B = 2;
    
    print_array(A, size_A, "Input A");
    print_array(B, size_B, "Kernel B");
    printf("tile_A = %d, tile_B = %d\n", tile_A, tile_B);
    
    tiled_convolution_1d(A, size_A, B, size_B, C, tile_A, tile_B);
    
    print_array(C, size_A - size_B + 1, "Output C");
    
    printf("\nExpected output for convolution: [11, 19, 28, 37, 46, 55]\n");
    printf("\nRemember: In convolution, the kernel B is reversed before applying.\n");
    printf("For example, kernel [2, 1, 3] is treated as [3, 1, 2] during the computation.\n");
    
    return 0;
} 