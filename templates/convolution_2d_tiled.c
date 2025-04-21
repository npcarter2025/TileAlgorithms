#include <stdio.h>
#include <stdlib.h>

/**
 * Tiled 2D convolution implementation.
 * Takes advantage of data reuse by using tiling.
 * 
 * @param A Input 2D array (flattened to 1D)
 * @param rows_A Number of rows in array A
 * @param cols_A Number of columns in array A
 * @param B Kernel array (flattened to 1D)
 * @param rows_B Number of rows in kernel B
 * @param cols_B Number of columns in kernel B
 * @param C Output array (must be pre-allocated with (rows_A - rows_B + 1) * (cols_A - cols_B + 1) elements)
 * @param tile_height Height of tiles for processing
 * @param tile_width Width of tiles for processing
 */
void tiled_convolution_2d(int *A, int rows_A, int cols_A, 
                        int *B, int rows_B, int cols_B, 
                        int *C, int tile_height, int tile_width) {
    // Calculate dimensions for output array C
    int rows_C = rows_A - rows_B + 1;
    int cols_C = cols_A - cols_B + 1;
    
    // Initialize C array elements to 0
    for (int i = 0; i < rows_C * cols_C; i++) {
        C[i] = 0;
    }
    
    // TODO: Implement tiled 2D convolution by filling in the correct indices
    // Outer loops: iterate over output elements in tiles
    for (register int ti = 0; ti < /* TODO: Number of tiles in rows */; ti++) {
        for (register int tj = 0; tj < /* TODO: Number of tiles in columns */; tj++) {
            
            // Calculate tile boundaries
            int i_start = /* TODO: Determine starting row index for this tile */;
            int i_end = /* TODO: Determine ending row index for this tile */;
            int j_start = /* TODO: Determine starting column index for this tile */;
            int j_end = /* TODO: Determine ending column index for this tile */;
            
            // Middle loops: iterate over kernel elements
            for (register int ki = 0; ki < /* TODO: Kernel height */; ki++) {
                for (register int kj = 0; kj < /* TODO: Kernel width */; kj++) {
                    
                    // Calculate the appropriate indices for the reversed kernel (convolution)
                    int kernel_row = /* TODO: Calculate reversed row index for kernel */;
                    int kernel_col = /* TODO: Calculate reversed column index for kernel */;
                    int kernel_idx = /* TODO: Calculate 1D index for kernel B */;
                    
                    // Inner loops: process elements within the current tile
                    for (register int i = i_start; i < i_end; i++) {
                        for (register int j = j_start; j < j_end; j++) {
                            
                            // Calculate input A indices
                            int a_row = /* TODO: Calculate input A row index */;
                            int a_col = /* TODO: Calculate input A column index */;
                            
                            // Calculate the 1D indices for the 2D arrays
                            int a_idx = /* TODO: Calculate 1D index for A */;
                            int c_idx = /* TODO: Calculate 1D index for C */;
                            
                            // Update the output with correct values
                            C[c_idx] += A[a_idx] * B[kernel_idx];
                        }
                    }
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
    printf("=== Tiled 2D Convolution Template ===\n\n");
    
    // Example input matrix A
    int A[] = {
        1, 2, 3, 4, 5,
        6, 7, 8, 9, 10,
        11, 12, 13, 14, 15,
        16, 17, 18, 19, 20,
        21, 22, 23, 24, 25
    };
    int rows_A = 5;
    int cols_A = 5;
    
    // Example kernel B
    int B[] = {
        1, 0, -1,
        2, 0, -2,
        1, 0, -1
    };
    int rows_B = 3;
    int cols_B = 3;
    
    // Calculate output dimensions
    int rows_C = rows_A - rows_B + 1;
    int cols_C = cols_A - cols_B + 1;
    int *C = (int *)malloc(rows_C * cols_C * sizeof(int));
    
    // Define tile sizes
    int tile_height = 2;
    int tile_width = 2;
    
    print_2d_array(A, rows_A, cols_A, "Input A");
    print_2d_array(B, rows_B, cols_B, "Kernel B");
    printf("Tile sizes: %d x %d\n\n", tile_height, tile_width);
    
    tiled_convolution_2d(A, rows_A, cols_A, B, rows_B, cols_B, C, tile_height, tile_width);
    
    print_2d_array(C, rows_C, cols_C, "Output C");
    
    // Expected output for the example
    int expected[] = {
        -13, -20, -17,
        -18, -20, -2,
        7, 20, 33
    };
    printf("\nExpected output:\n");
    print_2d_array(expected, rows_C, cols_C, "Expected C");
    
    printf("\nRemember: In 2D convolution, the kernel B is reversed in both dimensions.\n");
    printf("For example, B[i][j] becomes B[rows_B-1-i][cols_B-1-j] during computation.\n");
    
    free(C);
    return 0;
} 