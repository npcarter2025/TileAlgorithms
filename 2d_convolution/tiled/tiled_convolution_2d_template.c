#include <stdio.h>
#include <stdlib.h>

/**
 * Performs tiled 2D convolution between input A and kernel B.
 * A is the input matrix, B is the kernel.
 * 
 * @param A Input matrix A
 * @param height_A Height of matrix A
 * @param width_A Width of matrix A
 * @param B Kernel matrix B
 * @param height_B Height of kernel B
 * @param width_B Width of kernel B
 * @param C Output matrix C (must be pre-allocated with (height_A - height_B + 1) x (width_A - width_B + 1) elements)
 * @param tile_height Height of tiles for processing
 * @param tile_width Width of tiles for processing
 */
void tiled_convolution_2d(int **A, int height_A, int width_A, 
                         int **B, int height_B, int width_B, 
                         int **C, int tile_height, int tile_width) {
    // Initialize C matrix elements to 0
    for (int i = 0; i < height_A - height_B + 1; i++) {
        for (int j = 0; j < width_A - width_B + 1; j++) {
            C[i][j] = 0;
        }
    }
    
    // Output height and width
    int height_C = height_A - height_B + 1;
    int width_C = width_A - width_B + 1;
    
    // TODO: Implement tiled 2D convolution
    // Process output matrix in tiles
    for (int i_tile = 0; i_tile < /* TODO: fill in appropriate limit */; i_tile += /* TODO: fill in appropriate step */) {
        for (int j_tile = 0; j_tile < /* TODO: fill in appropriate limit */; j_tile += /* TODO: fill in appropriate step */) {
            // TODO: Determine the actual tile size (handle edge tiles)
            int curr_tile_height = /* TODO: fill in logic to handle edge tiles */;
            int curr_tile_width = /* TODO: fill in logic to handle edge tiles */;
            
            // TODO: For each tile, process all kernel elements
            for (int ki = 0; ki < /* TODO: fill in appropriate limit */; ki++) {
                for (int kj = 0; kj < /* TODO: fill in appropriate limit */; kj++) {
                    // TODO: Compute kernel element value (flipped for convolution)
                    int kernel_val = /* TODO: fill in logic to access the correct kernel element */;
                    
                    // TODO: Apply kernel element to the current tile
                    for (int i_local = 0; i_local < /* TODO: fill in appropriate limit */; i_local++) {
                        for (int j_local = 0; j_local < /* TODO: fill in appropriate limit */; j_local++) {
                            // TODO: Calculate global indices from local tile indices
                            int i_global = /* TODO: fill in logic */;
                            int j_global = /* TODO: fill in logic */;
                            
                            // TODO: Update the output with the convolution calculation
                            /* TODO: fill in convolution calculation */
                        }
                    }
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
    // Example matrices
    int height_A = 5, width_A = 5;
    int height_B = 3, width_B = 3;
    int tile_height = 2, tile_width = 2;
    
    // Allocate and initialize example matrices
    int **A = allocate_2d_array(height_A, width_A);
    int **B = allocate_2d_array(height_B, width_B);
    int **C = allocate_2d_array(height_A - height_B + 1, width_A - width_B + 1);
    
    // Example input matrix
    int A_data[5][5] = {
        {1, 2, 3, 4, 5},
        {6, 7, 8, 9, 10},
        {11, 12, 13, 14, 15},
        {16, 17, 18, 19, 20},
        {21, 22, 23, 24, 25}
    };
    
    // Example kernel matrix
    int B_data[3][3] = {
        {1, 0, -1},
        {2, 0, -2},
        {1, 0, -1}
    };
    
    // Copy data to allocated matrices
    for (int i = 0; i < height_A; i++) {
        for (int j = 0; j < width_A; j++) {
            A[i][j] = A_data[i][j];
        }
    }
    
    for (int i = 0; i < height_B; i++) {
        for (int j = 0; j < width_B; j++) {
            B[i][j] = B_data[i][j];
        }
    }
    
    printf("=== Tiled 2D Convolution Example ===\n\n");
    
    // Print input matrices
    print_2d_array(A, height_A, width_A, "Input A");
    print_2d_array(B, height_B, width_B, "Kernel B");
    printf("Tile size: %d x %d\n\n", tile_height, tile_width);
    
    // Perform tiled convolution
    tiled_convolution_2d(A, height_A, width_A, B, height_B, width_B, C, tile_height, tile_width);
    
    // Print result
    print_2d_array(C, height_A - height_B + 1, width_A - width_B + 1, "Output C");
    
    // Option for user input
    printf("\nDo you want to try with your own matrices? (1 for yes, 0 for no): ");
    int user_choice;
    scanf("%d", &user_choice);
    
    if (user_choice) {
        int user_height_A, user_width_A, user_height_B, user_width_B, user_tile_height, user_tile_width;
        
        // Get matrix dimensions from user
        printf("Enter height of input matrix A: ");
        scanf("%d", &user_height_A);
        
        printf("Enter width of input matrix A: ");
        scanf("%d", &user_width_A);
        
        printf("Enter height of kernel B: ");
        scanf("%d", &user_height_B);
        
        printf("Enter width of kernel B: ");
        scanf("%d", &user_width_B);
        
        // Validate dimensions
        if (user_height_B > user_height_A || user_width_B > user_width_A) {
            printf("Error: Kernel dimensions must be less than or equal to input dimensions\n");
            free_2d_array(A, height_A);
            free_2d_array(B, height_B);
            free_2d_array(C, height_A - height_B + 1);
            return 1;
        }
        
        printf("Enter tile height: ");
        scanf("%d", &user_tile_height);
        
        printf("Enter tile width: ");
        scanf("%d", &user_tile_width);
        
        // Allocate memory for user matrices
        int **user_A = allocate_2d_array(user_height_A, user_width_A);
        int **user_B = allocate_2d_array(user_height_B, user_width_B);
        int **user_C = allocate_2d_array(user_height_A - user_height_B + 1, user_width_A - user_width_B + 1);
        
        // Get matrix elements from user
        printf("Enter elements for input matrix A (%d x %d):\n", user_height_A, user_width_A);
        for (int i = 0; i < user_height_A; i++) {
            for (int j = 0; j < user_width_A; j++) {
                printf("A[%d][%d]: ", i, j);
                scanf("%d", &user_A[i][j]);
            }
        }
        
        printf("Enter elements for kernel B (%d x %d):\n", user_height_B, user_width_B);
        for (int i = 0; i < user_height_B; i++) {
            for (int j = 0; j < user_width_B; j++) {
                printf("B[%d][%d]: ", i, j);
                scanf("%d", &user_B[i][j]);
            }
        }
        
        // Print input matrices
        print_2d_array(user_A, user_height_A, user_width_A, "Input A");
        print_2d_array(user_B, user_height_B, user_width_B, "Kernel B");
        printf("Tile size: %d x %d\n\n", user_tile_height, user_tile_width);
        
        // Perform tiled convolution
        tiled_convolution_2d(user_A, user_height_A, user_width_A, 
                           user_B, user_height_B, user_width_B, 
                           user_C, user_tile_height, user_tile_width);
        
        // Print result
        print_2d_array(user_C, user_height_A - user_height_B + 1, user_width_A - user_width_B + 1, "Output C");
        
        // Free allocated memory
        free_2d_array(user_A, user_height_A);
        free_2d_array(user_B, user_height_B);
        free_2d_array(user_C, user_height_A - user_height_B + 1);
    }
    
    // Free allocated memory for example matrices
    free_2d_array(A, height_A);
    free_2d_array(B, height_B);
    free_2d_array(C, height_A - height_B + 1);
    
    return 0;
} 