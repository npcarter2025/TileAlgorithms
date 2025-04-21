#include <stdio.h>
#include <stdlib.h>

/**
 * Tiled 1D cross-correlation implementation.
 * Takes advantage of data reuse by using tiling.
 * 
 * @param A Input array A
 * @param size_A Length of array A
 * @param B Input array B
 * @param size_B Length of array B
 * @param C Output array C (must be pre-allocated with size_A - size_B + 1 elements)
 * @param tile_A Size of tile for array A
 * @param tile_B Size of tile for array B
 */
void tiled_cross_correlation_1d(int *A, int size_A, int *B, int size_B, int *C, int tile_A, int tile_B) {
    // Initialize C array elements to 0
    for (int k = 0; k < size_A - size_B + 1; k++) {
        C[k] = 0;
    }
    
    // First implementation with triple nested loop
    for (register int i = 0; i < size_B / tile_B; i++) {
        for (register int j = 0; j < size_A - size_B + 1; j++) {
            for (register int k = 0; k < tile_B; k++) {
                C[j] += A[j + i * tile_B + k] * B[i * tile_B + k];
            }
        }
    }
    
    for (register int i = 0; i < size_A - size_B + 1; i++) {
        for (register int k = size_B - size_B % tile_B; k < size_B; k++) {
            C[i] += A[i + k] * B[k];
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
    printf("=== Tiled Cross-Correlation Examples ===\n\n");
    
    // Example with tiling
    int A[] = {1, 2, 3, 4, 5, 6, 7, 8};
    int B[] = {2, 1, 3};
    int size_A = sizeof(A) / sizeof(A[0]);
    int size_B = sizeof(B) / sizeof(B[0]);
    int C[size_A - size_B + 1];
    
    // You can experiment with different tile sizes
    int tile_A = 4;
    int tile_B = 2;
    
    print_array(A, size_A, "A");
    print_array(B, size_B, "B");
    printf("tile_A = %d, tile_B = %d\n", tile_A, tile_B);
    
    tiled_cross_correlation_1d(A, size_A, B, size_B, C, tile_A, tile_B);
    
    print_array(C, size_A - size_B + 1, "C (result)");
    
    return 0;
} 