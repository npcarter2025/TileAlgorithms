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
    
    // Iterate over each output element
    for (int z_out = 0; z_out < size_C_z; z_out++) {
        for (int y_out = 0; y_out < size_C_y; y_out++) {
            for (int x_out = 0; x_out < size_C_x; x_out++) {
                
                // For each position in the kernel
                for (int z_k = 0; z_k < size_B_z; z_k++) {
                    for (int y_k = 0; y_k < size_B_y; y_k++) {
                        for (int x_k = 0; x_k < size_B_x; x_k++) {
                            
                            // Calculate the appropriate indices for the reversed kernel (convolution)
                            int kernel_z = size_B_z - 1 - z_k;
                            int kernel_y = size_B_y - 1 - y_k;
                            int kernel_x = size_B_x - 1 - x_k;
                            
                            // Calculate the corresponding input indices
                            int a_z = z_out + z_k;
                            int a_y = y_out + y_k;
                            int a_x = x_out + x_k;
                            
                            // Calculate flattened array indices
                            int c_index = z_out * size_C_y * size_C_x + y_out * size_C_x + x_out;
                            int a_index = a_z * size_A_y * size_A_x + a_y * size_A_x + a_x;
                            int b_index = kernel_z * size_B_y * size_B_x + kernel_y * size_B_x + kernel_x;
                            
                            // Update the output with correct values
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
    printf("=== Naive 3D Convolution Implementation ===\n\n");
    
    // Interactive mode to get dimensions from user
    int size_A_x, size_A_y, size_A_z, size_B_x, size_B_y, size_B_z;
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
    } else {
        // Use default values for a small example
        size_A_x = 4;
        size_A_y = 4;
        size_A_z = 4;
        size_B_x = 2;
        size_B_y = 2;
        size_B_z = 2;
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
    printf("Output C: %dx%dx%d array\n\n", size_C_x, size_C_y, size_C_z);
    
    // Print input arrays (only for small examples)
    if (size_A_x <= 10 && size_A_y <= 10 && size_A_z <= 10) {
        print_3d_array(A, size_A_x, size_A_y, size_A_z, "Input A");
        printf("\n");
        print_3d_array(B, size_B_x, size_B_y, size_B_z, "Kernel B");
        printf("\n");
    }
    
    // Perform the convolution
    convolution_3d(A, size_A_x, size_A_y, size_A_z, 
                  B, size_B_x, size_B_y, size_B_z, C);
    
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