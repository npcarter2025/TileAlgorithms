#include <stdio.h>
#include <stdlib.h>

/**
 * Naive 2D convolution implementation.
 * 
 * @param A Input 2D array (flattened to 1D)
 * @param rows_A Number of rows in array A
 * @param cols_A Number of columns in array A
 * @param B Kernel array (flattened to 1D)
 * @param rows_B Number of rows in kernel B
 * @param cols_B Number of columns in kernel B
 * @param C Output array (must be pre-allocated with (rows_A - rows_B + 1) * (cols_A - cols_B + 1) elements)
 */
void convolution_2d(int *A, int rows_A, int cols_A, int *B, int rows_B, int cols_B, int *C) {
    int rows_C = rows_A - rows_B + 1;
    int cols_C = cols_A - cols_B + 1;
    
    // Initialize C array elements to 0
    for (int i = 0; i < rows_C * cols_C; i++) {
        C[i] = 0;
    }
    
    // TODO: Implement the 2D convolution by filling in the correct indices
    for (int i = /* Fill in the correct start index */; i < /* Fill in the correct end condition */; i++) {
        for (int j = /* Fill in the correct start index */; j < /* Fill in the correct end condition */; j++) {
            // For each output position (i,j)
            for (int k = /* Fill in the correct start index */; k < /* Fill in the correct end condition */; k++) {
                for (int l = /* Fill in the correct start index */; l < /* Fill in the correct end condition */; l++) {
                    // Compute the correct indices for A, B, and C
                    // Remember that for convolution, the kernel is flipped
                    // int kernel_row = /* Calculate the reversed row index for the kernel */;
                    // int kernel_col = /* Calculate the reversed column index for the kernel */;
                    
                    // Calculate the 1D indices for the 2D arrays
                    // int A_idx = /* Calculate the 1D index for A */;
                    // int B_idx = /* Calculate the 1D index for B */;
                    // int C_idx = /* Calculate the 1D index for C */;
                    
                    // C[C_idx] += A[A_idx] * B[B_idx];
                }
            }
        }
    }
}

/**
 * Helper function to print a 2D array
 */
void print_2d_array(int *arr, int rows, int cols, const char *name) {
    printf("%s = [\n", name);
    for (int i = 0; i < rows; i++) {
        printf("  [");
        for (int j = 0; j < cols; j++) {
            printf("%3d", arr[i * cols + j]);
            if (j < cols - 1) printf(", ");
        }
        printf("]\n");
    }
    printf("]\n");
}

int main() {
    printf("=== 2D Convolution Example ===\n\n");
    
    // Example input matrix A
    int A[] = {
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
    };
    int rows_A = 4;
    int cols_A = 4;
    
    // Example kernel B
    int B[] = {
        1, 0,
        0, 1
    };
    int rows_B = 2;
    int cols_B = 2;
    
    // Calculate output dimensions
    int rows_C = rows_A - rows_B + 1;
    int cols_C = cols_A - cols_B + 1;
    int *C = (int *)malloc(rows_C * cols_C * sizeof(int));
    
    print_2d_array(A, rows_A, cols_A, "Input A");
    print_2d_array(B, rows_B, cols_B, "Kernel B");
    
    convolution_2d(A, rows_A, cols_A, B, rows_B, cols_B, C);
    
    print_2d_array(C, rows_C, cols_C, "Output C");
    
    free(C);
    return 0;
} 