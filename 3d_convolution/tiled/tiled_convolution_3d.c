#include <stdio.h>
#include <stdlib.h>

/**
 * Tiled 3D convolution implementation.
 * Takes advantage of data reuse by using tiling.
 * 
 * @param A Input 3D array (flattened to 1D)
 * @param size_A_x X dimension of array A
 * @param size_A_y Y dimension of array A
 * @param size_A_z Z dimension of array A
 * @param B Kernel 3D array (flattened to 1D)
 * @param size_B_x X dimension of kernel B
 * @param size_B_y Y dimension of kernel B
 * @param size_B_z Z dimension of kernel B
 * @param C Output 3D array (flattened to 1D, must be pre-allocated)
 * @param tile_A_x Tile size for array A in X dimension
 * @param tile_A_y Tile size for array A in Y dimension
 * @param tile_A_z Tile size for array A in Z dimension
 * @param tile_B_x Tile size for kernel B in X dimension
 * @param tile_B_y Tile size for kernel B in Y dimension
 * @param tile_B_z Tile size for kernel B in Z dimension
 */
void tiled_convolution_3d(
    int *A, int size_A_x, int size_A_y, int size_A_z,
    int *B, int size_B_x, int size_B_y, int size_B_z,
    int *C,
    int tile_A_x, int tile_A_y, int tile_A_z,
    int tile_B_x, int tile_B_y, int tile_B_z
) {
    // Calculate output dimensions
    int size_C_x = size_A_x - size_B_x + 1;
    int size_C_y = size_A_y - size_B_y + 1;
    int size_C_z = size_A_z - size_B_z + 1;
    
    // Initialize C array elements to 0
    for (int z = 0; z < size_C_z; z++) {
        for (int y = 0; y < size_C_y; y++) {
            for (int x = 0; x < size_C_x; x++) {
                C[z * size_C_y * size_C_x + y * size_C_x + x] = 0;
            }
        }
    }
    
    // Calculate the number of tiles for each dimension of B
    int num_tiles_B_x = (size_B_x + tile_B_x - 1) / tile_B_x;
    int num_tiles_B_y = (size_B_y + tile_B_y - 1) / tile_B_y;
    int num_tiles_B_z = (size_B_z + tile_B_z - 1) / tile_B_z;
    
    // Outer loops: iterate over kernel B in tiles for each dimension
    for (register int tz = 0; tz < num_tiles_B_z; tz++) {
        // Calculate the bounds for the z dimension of this kernel tile
        int z_start = tz * tile_B_z;
        int z_end = (tz == num_tiles_B_z - 1) ? size_B_z : (tz + 1) * tile_B_z;
        
        for (register int ty = 0; ty < num_tiles_B_y; ty++) {
            // Calculate the bounds for the y dimension of this kernel tile
            int y_start = ty * tile_B_y;
            int y_end = (ty == num_tiles_B_y - 1) ? size_B_y : (ty + 1) * tile_B_y;
            
            for (register int tx = 0; tx < num_tiles_B_x; tx++) {
                // Calculate the bounds for the x dimension of this kernel tile
                int x_start = tx * tile_B_x;
                int x_end = (tx == num_tiles_B_x - 1) ? size_B_x : (tx + 1) * tile_B_x;
                
                // Middle loops: iterate over output elements
                for (register int z = 0; z < size_C_z; z++) {
                    for (register int y = 0; y < size_C_y; y++) {
                        for (register int x = 0; x < size_C_x; x++) {
                            
                            // Inner loops: process a single tile in each dimension
                            for (register int k_z = z_start; k_z < z_end; k_z++) {
                                for (register int k_y = y_start; k_y < y_end; k_y++) {
                                    for (register int k_x = x_start; k_x < x_end; k_x++) {
                                        
                                        // Calculate the appropriate indices for the reversed kernel
                                        int kernel_z = size_B_z - 1 - k_z;
                                        int kernel_y = size_B_y - 1 - k_y;
                                        int kernel_x = size_B_x - 1 - k_x;
                                        
                                        // Calculate input A indices
                                        int a_z = z + k_z;
                                        int a_y = y + k_y;
                                        int a_x = x + k_x;
                                        
                                        // Ensure indices are within bounds to avoid accessing invalid memory
                                        if (a_z >= 0 && a_z < size_A_z && 
                                            a_y >= 0 && a_y < size_A_y && 
                                            a_x >= 0 && a_x < size_A_x) {
                                            
                                            // Calculate flattened indices
                                            int c_index = z * size_C_y * size_C_x + y * size_C_x + x;
                                            int a_index = a_z * size_A_y * size_A_x + a_y * size_A_x + a_x;
                                            int b_index = kernel_z * size_B_y * size_B_x + kernel_y * size_B_x + kernel_x;
                                            
                                            C[c_index] += A[a_index] * B[b_index];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Helper function to initialize a 3D array with sequential values
 */
void init_3d_array(int *arr, int size_x, int size_y, int size_z) {
    int value = 1;
    for (int z = 0; z < size_z; z++) {
        for (int y = 0; y < size_y; y++) {
            for (int x = 0; x < size_x; x++) {
                arr[z * size_y * size_x + y * size_x + x] = value++;
            }
        }
    }
}

/**
 * Helper function to initialize a 3D kernel
 */
void init_kernel_3d(int *kernel, int size_x, int size_y, int size_z) {
    for (int z = 0; z < size_z; z++) {
        for (int y = 0; y < size_y; y++) {
            for (int x = 0; x < size_x; x++) {
                kernel[z * size_y * size_x + y * size_x + x] = (z + y + x) % 3 + 1;
            }
        }
    }
}

/**
 * Helper function to print a 3D array
 */
void print_3d_array(int *arr, int size_x, int size_y, int size_z, const char *name) {
    printf("%s = [\n", name);
    for (int z = 0; z < size_z; z++) {
        printf("  Layer %d:\n", z);
        for (int y = 0; y < size_y; y++) {
            printf("    [");
            for (int x = 0; x < size_x; x++) {
                printf("%d", arr[z * size_y * size_x + y * size_x + x]);
                if (x < size_x - 1) printf(", ");
            }
            printf("]\n");
        }
        if (z < size_z - 1) printf("\n");
    }
    printf("]\n");
}

int main() {
    printf("=== Tiled 3D Convolution Implementation ===\n\n");
    
    // Interactive mode to get dimensions from user
    int size_A_x, size_A_y, size_A_z, size_B_x, size_B_y, size_B_z;
    int tile_A_x, tile_A_y, tile_A_z, tile_B_x, tile_B_y, tile_B_z;
    int interactive_mode = 0;
    
    // Ask if the user wants to use interactive mode
    printf("Do you want to use interactive mode? (1 for yes, 0 for no): ");
    scanf("%d", &interactive_mode);
    
    if (interactive_mode) {
        // Get dimensions from the user
        printf("\nEnter dimensions for input array A:\n");
        printf("X dimension: ");
        scanf("%d", &size_A_x);
        printf("Y dimension: ");
        scanf("%d", &size_A_y);
        printf("Z dimension: ");
        scanf("%d", &size_A_z);
        
        printf("\nEnter dimensions for kernel B:\n");
        printf("X dimension: ");
        scanf("%d", &size_B_x);
        printf("Y dimension: ");
        scanf("%d", &size_B_y);
        printf("Z dimension: ");
        scanf("%d", &size_B_z);
        
        // Validate input dimensions
        if (size_B_x > size_A_x || size_B_y > size_A_y || size_B_z > size_A_z) {
            printf("Error: Kernel dimensions must be smaller than input dimensions.\n");
            return 1;
        }
        
        // Get tile sizes from the user
        printf("\nEnter tile sizes for array A:\n");
        printf("X dimension: ");
        scanf("%d", &tile_A_x);
        printf("Y dimension: ");
        scanf("%d", &tile_A_y);
        printf("Z dimension: ");
        scanf("%d", &tile_A_z);
        
        printf("\nEnter tile sizes for kernel B:\n");
        printf("X dimension: ");
        scanf("%d", &tile_B_x);
        printf("Y dimension: ");
        scanf("%d", &tile_B_y);
        printf("Z dimension: ");
        scanf("%d", &tile_B_z);
        
        // Validate tile sizes
        if (tile_B_x > size_B_x) {
            printf("Warning: Tile size for B's X dimension is larger than B itself. Setting to %d.\n", size_B_x);
            tile_B_x = size_B_x;
        }
        if (tile_B_y > size_B_y) {
            printf("Warning: Tile size for B's Y dimension is larger than B itself. Setting to %d.\n", size_B_y);
            tile_B_y = size_B_y;
        }
        if (tile_B_z > size_B_z) {
            printf("Warning: Tile size for B's Z dimension is larger than B itself. Setting to %d.\n", size_B_z);
            tile_B_z = size_B_z;
        }
    } else {
        // Use default values for a small example
        size_A_x = 4;
        size_A_y = 4;
        size_A_z = 4;
        size_B_x = 2;
        size_B_y = 2;
        size_B_z = 2;
        
        // Default tile sizes
        tile_A_x = 2;
        tile_A_y = 2;
        tile_A_z = 2;
        tile_B_x = 1;
        tile_B_y = 1;
        tile_B_z = 1;
    }
    
    // Calculate the size of the output array
    int size_C_x = size_A_x - size_B_x + 1;
    int size_C_y = size_A_y - size_B_y + 1;
    int size_C_z = size_A_z - size_B_z + 1;
    
    // Allocate memory for arrays
    int *A = (int *)malloc(size_A_x * size_A_y * size_A_z * sizeof(int));
    int *B = (int *)malloc(size_B_x * size_B_y * size_B_z * sizeof(int));
    int *C = (int *)malloc(size_C_x * size_C_y * size_C_z * sizeof(int));
    
    // Initialize arrays
    init_3d_array(A, size_A_x, size_A_y, size_A_z);
    init_kernel_3d(B, size_B_x, size_B_y, size_B_z);
    
    // Print array information
    printf("\nInput A: %dx%dx%d array\n", size_A_x, size_A_y, size_A_z);
    printf("Kernel B: %dx%dx%d array\n", size_B_x, size_B_y, size_B_z);
    printf("Output C: %dx%dx%d array\n", size_C_x, size_C_y, size_C_z);
    printf("Tile sizes for A: %dx%dx%d\n", tile_A_x, tile_A_y, tile_A_z);
    printf("Tile sizes for B: %dx%dx%d\n\n", tile_B_x, tile_B_y, tile_B_z);
    
    // Print input arrays (only for small examples)
    if (size_A_x <= 10 && size_A_y <= 10 && size_A_z <= 10) {
        print_3d_array(A, size_A_x, size_A_y, size_A_z, "Input A");
        printf("\n");
        print_3d_array(B, size_B_x, size_B_y, size_B_z, "Kernel B");
        printf("\n");
    }
    
    // Perform the tiled convolution
    tiled_convolution_3d(
        A, size_A_x, size_A_y, size_A_z,
        B, size_B_x, size_B_y, size_B_z,
        C,
        tile_A_x, tile_A_y, tile_A_z,
        tile_B_x, tile_B_y, tile_B_z
    );
    
    // Print the output for small arrays
    if (size_C_x <= 10 && size_C_y <= 10 && size_C_z <= 10) {
        print_3d_array(C, size_C_x, size_C_y, size_C_z, "Output C");
    } else {
        printf("Output array is too large to display.\n");
    }
    
    printf("\nRemember: In 3D convolution, the kernel B is reversed in all three dimensions before applying.\n");
    printf("For example, B[z][y][x] becomes B[size_B_z-1-z][size_B_y-1-y][size_B_x-1-x] during computation.\n");
    
    // Free allocated memory
    free(A);
    free(B);
    free(C);
    
    return 0;
} 