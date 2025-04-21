#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

// Function declarations
void naive_convolution_3d(int *A, int size_A_x, int size_A_y, int size_A_z,
                         int *B, int size_B_x, int size_B_y, int size_B_z,
                         int *C);

void tiled_convolution_3d(int *A, int size_A_x, int size_A_y, int size_A_z,
                         int *B, int size_B_x, int size_B_y, int size_B_z,
                         int *C,
                         int tile_A_x, int tile_A_y, int tile_A_z,
                         int tile_B_x, int tile_B_y, int tile_B_z);

// Helper functions
void init_random_3d_array(int *arr, int size_x, int size_y, int size_z) {
    for (int z = 0; z < size_z; z++) {
        for (int y = 0; y < size_y; y++) {
            for (int x = 0; x < size_x; x++) {
                arr[z * size_y * size_x + y * size_x + x] = rand() % 10;
            }
        }
    }
}

void print_3d_array(int *arr, int size_x, int size_y, int size_z, const char *name) {
    printf("%s = [\n", name);
    for (int z = 0; z < size_z && z < 3; z++) { // Print only first 3 layers maximum
        printf("  Layer %d:\n", z);
        for (int y = 0; y < size_y && y < 3; y++) { // Print only first 3 rows maximum
            printf("    [");
            for (int x = 0; x < size_x && x < 5; x++) { // Print only first 5 columns maximum
                printf("%d", arr[z * size_y * size_x + y * size_x + x]);
                if (x < size_x - 1 && x < 4) printf(", ");
            }
            if (size_x > 5) printf(", ..."); // Indicate truncation
            printf("]\n");
        }
        if (size_y > 3) printf("    ...\n"); // Indicate truncation
        if (z < size_z - 1 && z < 2) printf("\n");
    }
    if (size_z > 3) printf("  ...\n"); // Indicate truncation
    printf("]\n");
}

int arrays_equal(int *arr1, int *arr2, int size) {
    for (int i = 0; i < size; i++) {
        if (arr1[i] != arr2[i]) {
            printf("Difference found at index %d: %d vs %d\n", i, arr1[i], arr2[i]);
            return 0;
        }
    }
    return 1;
}

// Implementation of naive 3D convolution
void naive_convolution_3d(int *A, int size_A_x, int size_A_y, int size_A_z,
                         int *B, int size_B_x, int size_B_y, int size_B_z,
                         int *C) {
    // Calculate output dimensions
    int size_C_x = size_A_x - size_B_x + 1;
    int size_C_y = size_A_y - size_B_y + 1;
    int size_C_z = size_A_z - size_B_z + 1;
    
    // Initialize C array elements to 0
    memset(C, 0, size_C_x * size_C_y * size_C_z * sizeof(int));
    
    // Iterate over each output element
    for (int z_out = 0; z_out < size_C_z; z_out++) {
        for (int y_out = 0; y_out < size_C_y; y_out++) {
            for (int x_out = 0; x_out < size_C_x; x_out++) {
                
                // For each position in the kernel
                for (int z_k = 0; z_k < size_B_z; z_k++) {
                    for (int y_k = 0; y_k < size_B_y; y_k++) {
                        for (int x_k = 0; x_k < size_B_x; x_k++) {
                            
                            // Calculate the indices with kernel reversal for convolution
                            int kernel_z = size_B_z - 1 - z_k;
                            int kernel_y = size_B_y - 1 - y_k;
                            int kernel_x = size_B_x - 1 - x_k;
                            
                            // Calculate input indices
                            int a_z = z_out + z_k;
                            int a_y = y_out + y_k;
                            int a_x = x_out + x_k;
                            
                            // Calculate flattened indices
                            int c_index = z_out * size_C_y * size_C_x + y_out * size_C_x + x_out;
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

// Implementation of tiled 3D convolution
void tiled_convolution_3d(int *A, int size_A_x, int size_A_y, int size_A_z,
                         int *B, int size_B_x, int size_B_y, int size_B_z,
                         int *C,
                         int tile_A_x, int tile_A_y, int tile_A_z,
                         int tile_B_x, int tile_B_y, int tile_B_z) {
    // Calculate output dimensions
    int size_C_x = size_A_x - size_B_x + 1;
    int size_C_y = size_A_y - size_B_y + 1;
    int size_C_z = size_A_z - size_B_z + 1;
    
    // Initialize C array elements to 0
    memset(C, 0, size_C_x * size_C_y * size_C_z * sizeof(int));
    
    // Calculate the number of tiles
    int num_tiles_B_x = (size_B_x + tile_B_x - 1) / tile_B_x;
    int num_tiles_B_y = (size_B_y + tile_B_y - 1) / tile_B_y;
    int num_tiles_B_z = (size_B_z + tile_B_z - 1) / tile_B_z;
    
    // Outer loops: iterate over kernel B in tiles
    for (int tz = 0; tz < num_tiles_B_z; tz++) {
        for (int ty = 0; ty < num_tiles_B_y; ty++) {
            for (int tx = 0; tx < num_tiles_B_x; tx++) {
                
                // Calculate the bounds for this tile
                int z_start = tz * tile_B_z;
                int z_end = (tz == num_tiles_B_z - 1) ? size_B_z : (tz + 1) * tile_B_z;
                int y_start = ty * tile_B_y;
                int y_end = (ty == num_tiles_B_y - 1) ? size_B_y : (ty + 1) * tile_B_y;
                int x_start = tx * tile_B_x;
                int x_end = (tx == num_tiles_B_x - 1) ? size_B_x : (tx + 1) * tile_B_x;
                
                // Middle loops: iterate over output elements
                for (int z_out = 0; z_out < size_C_z; z_out++) {
                    for (int y_out = 0; y_out < size_C_y; y_out++) {
                        for (int x_out = 0; x_out < size_C_x; x_out++) {
                            
                            // Inner loops: process current tile
                            for (int z_k = z_start; z_k < z_end; z_k++) {
                                for (int y_k = y_start; y_k < y_end; y_k++) {
                                    for (int x_k = x_start; x_k < x_end; x_k++) {
                                        
                                        // Calculate the indices with kernel reversal for convolution
                                        int kernel_z = size_B_z - 1 - z_k;
                                        int kernel_y = size_B_y - 1 - y_k;
                                        int kernel_x = size_B_x - 1 - x_k;
                                        
                                        // Calculate input indices
                                        int a_z = z_out + z_k;
                                        int a_y = y_out + y_k;
                                        int a_x = x_out + x_k;
                                        
                                        // Calculate flattened indices
                                        int c_index = z_out * size_C_y * size_C_x + y_out * size_C_x + x_out;
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

// Optimize tile sizes by testing different combinations
void optimize_tile_sizes(int *A, int size_A_x, int size_A_y, int size_A_z,
                        int *B, int size_B_x, int size_B_y, int size_B_z,
                        int *C) {
    printf("\n=== Optimizing Tile Sizes ===\n");
    
    int size_C_x = size_A_x - size_B_x + 1;
    int size_C_y = size_A_y - size_B_y + 1;
    int size_C_z = size_A_z - size_B_z + 1;
    int total_size_C = size_C_x * size_C_y * size_C_z;
    
    double best_time = 9999.0;
    int best_tile_A_x = 0, best_tile_A_y = 0, best_tile_A_z = 0;
    int best_tile_B_x = 0, best_tile_B_y = 0, best_tile_B_z = 0;
    
    // Try different tile sizes
    int tile_sizes[] = {2, 4, 8};
    int num_tile_sizes = sizeof(tile_sizes) / sizeof(tile_sizes[0]);
    
    for (int i = 0; i < num_tile_sizes; i++) {
        for (int j = 0; j < num_tile_sizes; j++) {
            for (int k = 0; k < num_tile_sizes; k++) {
                // We'll test with the same tile sizes for both A and B for simplicity
                int tile_A_x = tile_sizes[i];
                int tile_A_y = tile_sizes[j];
                int tile_A_z = tile_sizes[k];
                int tile_B_x = tile_sizes[i];
                int tile_B_y = tile_sizes[j];
                int tile_B_z = tile_sizes[k];
                
                // Ensure tile sizes don't exceed kernel dimensions
                if (tile_B_x > size_B_x) tile_B_x = size_B_x;
                if (tile_B_y > size_B_y) tile_B_y = size_B_y;
                if (tile_B_z > size_B_z) tile_B_z = size_B_z;
                
                int *result = (int *)malloc(total_size_C * sizeof(int));
                
                // Measure execution time
                clock_t start = clock();
                
                tiled_convolution_3d(A, size_A_x, size_A_y, size_A_z,
                                    B, size_B_x, size_B_y, size_B_z,
                                    result,
                                    tile_A_x, tile_A_y, tile_A_z,
                                    tile_B_x, tile_B_y, tile_B_z);
                
                clock_t end = clock();
                double time_taken = ((double)(end - start)) / CLOCKS_PER_SEC;
                
                printf("Tile sizes A: %dx%dx%d, B: %dx%dx%d - Time: %.6f seconds\n",
                       tile_A_x, tile_A_y, tile_A_z, tile_B_x, tile_B_y, tile_B_z, time_taken);
                
                // Update best tile sizes if this configuration is faster
                if (time_taken < best_time) {
                    best_time = time_taken;
                    best_tile_A_x = tile_A_x;
                    best_tile_A_y = tile_A_y;
                    best_tile_A_z = tile_A_z;
                    best_tile_B_x = tile_B_x;
                    best_tile_B_y = tile_B_y;
                    best_tile_B_z = tile_B_z;
                }
                
                free(result);
            }
        }
    }
    
    printf("\nBest tile sizes found:\n");
    printf("A: %dx%dx%d, B: %dx%dx%d - Time: %.6f seconds\n",
           best_tile_A_x, best_tile_A_y, best_tile_A_z, 
           best_tile_B_x, best_tile_B_y, best_tile_B_z, best_time);
}

// Function to run a performance comparison between naive and tiled implementations
void run_performance_comparison(int size_A_x, int size_A_y, int size_A_z,
                              int size_B_x, int size_B_y, int size_B_z,
                              int tile_A_x, int tile_A_y, int tile_A_z,
                              int tile_B_x, int tile_B_y, int tile_B_z) {
    printf("=== 3D Convolution Performance Comparison ===\n\n");
    
    // Calculate output dimensions
    int size_C_x = size_A_x - size_B_x + 1;
    int size_C_y = size_A_y - size_B_y + 1;
    int size_C_z = size_A_z - size_B_z + 1;
    
    // Allocate memory for arrays
    int total_size_A = size_A_x * size_A_y * size_A_z;
    int total_size_B = size_B_x * size_B_y * size_B_z;
    int total_size_C = size_C_x * size_C_y * size_C_z;
    
    int *A = (int *)malloc(total_size_A * sizeof(int));
    int *B = (int *)malloc(total_size_B * sizeof(int));
    int *C_naive = (int *)malloc(total_size_C * sizeof(int));
    int *C_tiled = (int *)malloc(total_size_C * sizeof(int));
    
    // Initialize arrays with random values
    srand(time(NULL));
    init_random_3d_array(A, size_A_x, size_A_y, size_A_z);
    init_random_3d_array(B, size_B_x, size_B_y, size_B_z);
    
    // Print array information
    printf("Input A: %dx%dx%d array\n", size_A_x, size_A_y, size_A_z);
    printf("Kernel B: %dx%dx%d array\n", size_B_x, size_B_y, size_B_z);
    printf("Output C: %dx%dx%d array\n", size_C_x, size_C_y, size_C_z);
    printf("Tile sizes for A: %dx%dx%d\n", tile_A_x, tile_A_y, tile_A_z);
    printf("Tile sizes for B: %dx%dx%d\n\n", tile_B_x, tile_B_y, tile_B_z);
    
    // For smaller arrays, print sample of the input
    if (size_A_x <= 10 && size_A_y <= 10 && size_A_z <= 10) {
        print_3d_array(A, size_A_x, size_A_y, size_A_z, "Input A");
        print_3d_array(B, size_B_x, size_B_y, size_B_z, "Kernel B");
        printf("\n");
    }
    
    // Run naive convolution and measure time
    printf("Running naive 3D convolution...\n");
    clock_t start_naive = clock();
    
    naive_convolution_3d(A, size_A_x, size_A_y, size_A_z,
                        B, size_B_x, size_B_y, size_B_z,
                        C_naive);
    
    clock_t end_naive = clock();
    double time_naive = ((double)(end_naive - start_naive)) / CLOCKS_PER_SEC;
    printf("Naive implementation completed in %.6f seconds\n\n", time_naive);
    
    // Run tiled convolution and measure time
    printf("Running tiled 3D convolution...\n");
    clock_t start_tiled = clock();
    
    tiled_convolution_3d(A, size_A_x, size_A_y, size_A_z,
                        B, size_B_x, size_B_y, size_B_z,
                        C_tiled,
                        tile_A_x, tile_A_y, tile_A_z,
                        tile_B_x, tile_B_y, tile_B_z);
    
    clock_t end_tiled = clock();
    double time_tiled = ((double)(end_tiled - start_tiled)) / CLOCKS_PER_SEC;
    printf("Tiled implementation completed in %.6f seconds\n\n", time_tiled);
    
    // Compare results
    printf("Verifying results...\n");
    int identical = arrays_equal(C_naive, C_tiled, total_size_C);
    
    if (identical) {
        printf("Results match! Both implementations produce the same output.\n\n");
    } else {
        printf("Results don't match! There might be an error in one of the implementations.\n\n");
    }
    
    // For smaller arrays, print sample of the output
    if (size_C_x <= 10 && size_C_y <= 10 && size_C_z <= 10) {
        print_3d_array(C_naive, size_C_x, size_C_y, size_C_z, "Output C (Naive)");
        printf("\n");
    }
    
    // Print performance comparison
    printf("=== Performance Summary ===\n");
    printf("Naive implementation: %.6f seconds\n", time_naive);
    printf("Tiled implementation: %.6f seconds\n", time_tiled);
    
    if (time_naive > time_tiled) {
        double speedup = time_naive / time_tiled;
        printf("Tiled implementation is %.2fx faster!\n", speedup);
    } else if (time_tiled > time_naive) {
        double slowdown = time_tiled / time_naive;
        printf("Tiled implementation is %.2fx slower!\n", slowdown);
    } else {
        printf("Both implementations have similar performance.\n");
    }
    
    // Free allocated memory
    free(A);
    free(B);
    free(C_naive);
    free(C_tiled);
}

// Parse command line arguments
int parse_args(int argc, char **argv, int *size_A_x, int *size_A_y, int *size_A_z,
              int *size_B_x, int *size_B_y, int *size_B_z,
              int *tile_A_x, int *tile_A_y, int *tile_A_z,
              int *tile_B_x, int *tile_B_y, int *tile_B_z,
              int *optimize) {
    
    if (argc >= 10) {
        *size_A_x = atoi(argv[1]);
        *size_A_y = atoi(argv[2]);
        *size_A_z = atoi(argv[3]);
        *size_B_x = atoi(argv[4]);
        *size_B_y = atoi(argv[5]);
        *size_B_z = atoi(argv[6]);
        
        if (argc >= 13) {
            *tile_A_x = atoi(argv[7]);
            *tile_A_y = atoi(argv[8]);
            *tile_A_z = atoi(argv[9]);
            *tile_B_x = atoi(argv[10]);
            *tile_B_y = atoi(argv[11]);
            *tile_B_z = atoi(argv[12]);
        }
        
        if (argc >= 14) {
            *optimize = atoi(argv[13]);
        }
        
        return 1;
    }
    
    return 0;
}

// Get user input for array dimensions and tile sizes
void get_user_input(int *size_A_x, int *size_A_y, int *size_A_z,
                  int *size_B_x, int *size_B_y, int *size_B_z,
                  int *tile_A_x, int *tile_A_y, int *tile_A_z,
                  int *tile_B_x, int *tile_B_y, int *tile_B_z,
                  int *optimize) {
    
    printf("=== 3D Convolution Configuration ===\n\n");
    
    // Get input array dimensions
    printf("Enter dimensions for input array A:\n");
    printf("X dimension: ");
    scanf("%d", size_A_x);
    printf("Y dimension: ");
    scanf("%d", size_A_y);
    printf("Z dimension: ");
    scanf("%d", size_A_z);
    
    // Get kernel dimensions
    printf("\nEnter dimensions for kernel B:\n");
    printf("X dimension: ");
    scanf("%d", size_B_x);
    printf("Y dimension: ");
    scanf("%d", size_B_y);
    printf("Z dimension: ");
    scanf("%d", size_B_z);
    
    // Validate dimensions
    if (*size_B_x > *size_A_x || *size_B_y > *size_A_y || *size_B_z > *size_A_z) {
        printf("Error: Kernel dimensions must be smaller than input dimensions.\n");
        exit(1);
    }
    
    // Ask about optimization
    printf("\nDo you want to optimize tile sizes? (1 for yes, 0 for no): ");
    scanf("%d", optimize);
    
    if (!*optimize) {
        // Get tile sizes if not optimizing
        printf("\nEnter tile sizes for array A:\n");
        printf("X dimension: ");
        scanf("%d", tile_A_x);
        printf("Y dimension: ");
        scanf("%d", tile_A_y);
        printf("Z dimension: ");
        scanf("%d", tile_A_z);
        
        printf("\nEnter tile sizes for kernel B:\n");
        printf("X dimension: ");
        scanf("%d", tile_B_x);
        printf("Y dimension: ");
        scanf("%d", tile_B_y);
        printf("Z dimension: ");
        scanf("%d", tile_B_z);
        
        // Validate tile sizes
        if (*tile_B_x > *size_B_x) *tile_B_x = *size_B_x;
        if (*tile_B_y > *size_B_y) *tile_B_y = *size_B_y;
        if (*tile_B_z > *size_B_z) *tile_B_z = *size_B_z;
    } else {
        // Set default values for optimization
        *tile_A_x = 4;
        *tile_A_y = 4;
        *tile_A_z = 4;
        *tile_B_x = 2;
        *tile_B_y = 2;
        *tile_B_z = 2;
    }
}

int main(int argc, char **argv) {
    // Default values
    int size_A_x = 20, size_A_y = 20, size_A_z = 20;  // Default input size
    int size_B_x = 4, size_B_y = 4, size_B_z = 4;     // Default kernel size
    int tile_A_x = 4, tile_A_y = 4, tile_A_z = 4;     // Default tile size for A
    int tile_B_x = 2, tile_B_y = 2, tile_B_z = 2;     // Default tile size for B
    int optimize = 0;                                 // Don't optimize by default
    
    // Check if command line arguments are provided
    int args_provided = parse_args(argc, argv, &size_A_x, &size_A_y, &size_A_z,
                                  &size_B_x, &size_B_y, &size_B_z,
                                  &tile_A_x, &tile_A_y, &tile_A_z,
                                  &tile_B_x, &tile_B_y, &tile_B_z,
                                  &optimize);
    
    // If no command line arguments, get user input
    if (!args_provided) {
        get_user_input(&size_A_x, &size_A_y, &size_A_z,
                      &size_B_x, &size_B_y, &size_B_z,
                      &tile_A_x, &tile_A_y, &tile_A_z,
                      &tile_B_x, &tile_B_y, &tile_B_z,
                      &optimize);
    }
    
    // Calculate output dimensions
    int size_C_x = size_A_x - size_B_x + 1;
    int size_C_y = size_A_y - size_B_y + 1;
    int size_C_z = size_A_z - size_B_z + 1;
    int total_size_A = size_A_x * size_A_y * size_A_z;
    int total_size_B = size_B_x * size_B_y * size_B_z;
    int total_size_C = size_C_x * size_C_y * size_C_z;
    
    // Allocate memory for arrays
    int *A = (int *)malloc(total_size_A * sizeof(int));
    int *B = (int *)malloc(total_size_B * sizeof(int));
    int *C_naive = (int *)malloc(total_size_C * sizeof(int));
    
    // Initialize arrays with random values
    srand(time(NULL));
    init_random_3d_array(A, size_A_x, size_A_y, size_A_z);
    init_random_3d_array(B, size_B_x, size_B_y, size_B_z);
    
    // If optimization requested, find best tile sizes
    if (optimize) {
        optimize_tile_sizes(A, size_A_x, size_A_y, size_A_z,
                          B, size_B_x, size_B_y, size_B_z,
                          C_naive);
    }
    
    // Run the performance comparison
    run_performance_comparison(size_A_x, size_A_y, size_A_z,
                             size_B_x, size_B_y, size_B_z,
                             tile_A_x, tile_A_y, tile_A_z,
                             tile_B_x, tile_B_y, tile_B_z);
    
    // Free allocated memory
    free(A);
    free(B);
    free(C_naive);
    
    return 0;
} 