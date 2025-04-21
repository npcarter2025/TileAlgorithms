#include <stdio.h>
#include <stdlib.h>

/**
 * Naive 3D convolution implementation.
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
 */
void convolution_3d(int *A, int size_A_x, int size_A_y, int size_A_z,
                   int *B, int size_B_x, int size_B_y, int size_B_z,
                   int *C) {
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
    
    // TODO: Implement naive 3D convolution
    // Hint: Remember that convolution requires the kernel to be reversed in all dimensions
    
    // Iterate over each output element
    for (int z_out = 0; z_out < /* TODO: Output Z size */; z_out++) {
        for (int y_out = 0; y_out < /* TODO: Output Y size */; y_out++) {
            for (int x_out = 0; x_out < /* TODO: Output X size */; x_out++) {
                
                // TODO: Compute convolution for this output element
                // For each position in the kernel
                for (int z_k = 0; z_k < /* TODO: Kernel Z size */; z_k++) {
                    for (int y_k = 0; y_k < /* TODO: Kernel Y size */; y_k++) {
                        for (int x_k = 0; x_k < /* TODO: Kernel X size */; x_k++) {
                            
                            // TODO: Calculate the appropriate indices for the reversed kernel
                            int kernel_z = /* TODO: Calculate reversed Z kernel index */;
                            int kernel_y = /* TODO: Calculate reversed Y kernel index */;
                            int kernel_x = /* TODO: Calculate reversed X kernel index */;
                            
                            // TODO: Calculate the corresponding input indices
                            int a_z = /* TODO: Calculate A z-index */;
                            int a_y = /* TODO: Calculate A y-index */;
                            int a_x = /* TODO: Calculate A x-index */;
                            
                            // TODO: Calculate flattened array indices
                            int c_index = /* TODO: Calculate flattened C index */;
                            int a_index = /* TODO: Calculate flattened A index */;
                            int b_index = /* TODO: Calculate flattened B index */;
                            
                            // TODO: Update the output with correct values
                            C[c_index] += A[a_index] * B[b_index];
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
    printf("=== Naive 3D Convolution Template ===\n\n");
    
    // Example with small 3D arrays
    int size_A_x = 4, size_A_y = 4, size_A_z = 4;
    int size_B_x = 2, size_B_y = 2, size_B_z = 2;
    
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
    printf("Input A: %dx%dx%d array\n", size_A_x, size_A_y, size_A_z);
    printf("Kernel B: %dx%dx%d array\n", size_B_x, size_B_y, size_B_z);
    printf("Output C: %dx%dx%d array\n\n", size_C_x, size_C_y, size_C_z);
    
    // Print input arrays (only for small examples)
    print_3d_array(A, size_A_x, size_A_y, size_A_z, "Input A");
    printf("\n");
    print_3d_array(B, size_B_x, size_B_y, size_B_z, "Kernel B");
    printf("\n");
    
    // Perform the convolution
    convolution_3d(A, size_A_x, size_A_y, size_A_z, 
                  B, size_B_x, size_B_y, size_B_z, C);
    
    // Print the output
    print_3d_array(C, size_C_x, size_C_y, size_C_z, "Output C");
    
    printf("\nRemember: In 3D convolution, the kernel B is reversed in all three dimensions before applying.\n");
    printf("For example, B[z][y][x] becomes B[size_B_z-1-z][size_B_y-1-y][size_B_x-1-x] during computation.\n");
    
    // Free allocated memory
    free(A);
    free(B);
    free(C);
    
    return 0;
} 