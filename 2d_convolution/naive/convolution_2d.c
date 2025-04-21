#include <stdio.h>
#include <stdlib.h>

/**
 * Performs 2D convolution between input A and kernel B.
 * A is the input matrix, B is the kernel.
 * 
 * @param A Input matrix A
 * @param height_A Height of matrix A
 * @param width_A Width of matrix A
 * @param B Kernel matrix B
 * @param height_B Height of kernel B
 * @param width_B Width of kernel B
 * @param C Output matrix C (must be pre-allocated with (height_A - height_B + 1) x (width_A - width_B + 1) elements)
 */
void convolution_2d(int **A, int height_A, int width_A, 
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

int main() {
    int height_A, width_A, height_B, width_B;
    
    // Get matrix dimensions from user
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
    
    // Allocate memory for matrices
    int **A = allocate_2d_array(height_A, width_A);
    int **B = allocate_2d_array(height_B, width_B);
    int **C = allocate_2d_array(height_A - height_B + 1, width_A - width_B + 1);
    
    // Get matrix elements from user
    printf("Enter elements for input matrix A (%d x %d):\n", height_A, width_A);
    for (int i = 0; i < height_A; i++) {
        for (int j = 0; j < width_A; j++) {
            printf("A[%d][%d]: ", i, j);
            scanf("%d", &A[i][j]);
        }
    }
    
    printf("Enter elements for kernel B (%d x %d):\n", height_B, width_B);
    for (int i = 0; i < height_B; i++) {
        for (int j = 0; j < width_B; j++) {
            printf("B[%d][%d]: ", i, j);
            scanf("%d", &B[i][j]);
        }
    }
    
    // Print input matrices
    print_2d_array(A, height_A, width_A, "Input A");
    print_2d_array(B, height_B, width_B, "Kernel B");
    
    // Perform convolution
    convolution_2d(A, height_A, width_A, B, height_B, width_B, C);
    
    // Print result
    print_2d_array(C, height_A - height_B + 1, width_A - width_B + 1, "Output C");
    
    // Free allocated memory
    free_2d_array(A, height_A);
    free_2d_array(B, height_B);
    free_2d_array(C, height_A - height_B + 1);
    
    return 0;
} 