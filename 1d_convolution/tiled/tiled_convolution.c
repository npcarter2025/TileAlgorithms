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

int main() {
    printf("=== Tiled 1D Convolution Examples ===\n\n");
    
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
    
    // Testing with user input
    int user_size_A, user_size_B, user_tile_A, user_tile_B;
    
    printf("\n\nEnter your own example:\n");
    printf("Enter size of input array A: ");
    scanf("%d", &user_size_A);
    
    printf("Enter size of kernel B: ");
    scanf("%d", &user_size_B);
    
    // Validate that size_B <= size_A
    if (user_size_B > user_size_A) {
        printf("Error: Kernel size must be less than or equal to input size\n");
        return 1;
    }
    
    printf("Enter tile size for array A: ");
    scanf("%d", &user_tile_A);
    
    printf("Enter tile size for kernel B: ");
    scanf("%d", &user_tile_B);
    
    // Allocate memory for arrays
    int *user_A = (int*)malloc(user_size_A * sizeof(int));
    int *user_B = (int*)malloc(user_size_B * sizeof(int));
    int *user_C = (int*)malloc((user_size_A - user_size_B + 1) * sizeof(int));
    
    if (!user_A || !user_B || !user_C) {
        printf("Memory allocation failed\n");
        return 1;
    }
    
    // Get array elements from user
    printf("Enter %d elements for input array A:\n", user_size_A);
    for (int i = 0; i < user_size_A; i++) {
        scanf("%d", &user_A[i]);
    }
    
    printf("Enter %d elements for kernel B:\n", user_size_B);
    for (int i = 0; i < user_size_B; i++) {
        scanf("%d", &user_B[i]);
    }
    
    // Print input arrays
    print_array(user_A, user_size_A, "Input A");
    print_array(user_B, user_size_B, "Kernel B");
    printf("tile_A = %d, tile_B = %d\n", user_tile_A, user_tile_B);
    
    // Perform tiled convolution
    tiled_convolution_1d(user_A, user_size_A, user_B, user_size_B, user_C, user_tile_A, user_tile_B);
    
    // Print result
    print_array(user_C, user_size_A - user_size_B + 1, "Output C");
    
    // Free allocated memory
    free(user_A);
    free(user_B);
    free(user_C);
    
    return 0;
} 