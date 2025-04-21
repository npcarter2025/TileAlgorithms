#include <stdio.h>
#include <stdlib.h>

/**
 * Performs 1D cross-correlation between arrays A and B.
 * Assumes size_B <= size_A.
 * 
 * @param A Input array A
 * @param size_A Length of array A
 * @param B Input array B
 * @param size_B Length of array B
 * @param C Output array C (must be pre-allocated with size_A - size_B + 1 elements)
 */
void cross_correlation_1d(int *A, int size_A, int *B, int size_B, int *C) {
    // Initialize C array elements to 0
    for (int k = 0; k < size_A - size_B + 1; k++) {
        C[k] = 0;
    }
    
    // TODO: Implement the cross-correlation by filling in the correct indices
    // Perform cross-correlation
    for (register int i = /* Fill in the correct start index */; i < /* Fill in the correct end condition */; i++) {
        for (register int j = /* Fill in the correct start index */; j < /* Fill in the correct end condition */; j++) {
            // Fill in the correct array access and addition operation
            // C[???] += A[???] * B[???];
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
    // Example arrays
    int size_A, size_B;
    
    // Get array sizes from user
    printf("Enter size of array A: ");
    scanf("%d", &size_A);
    
    printf("Enter size of array B: ");
    scanf("%d", &size_B);
    
    // Validate that size_B <= size_A
    if (size_B > size_A) {
        printf("Error: size_B must be less than or equal to size_A\n");
        return 1;
    }
    
    // Allocate memory for arrays
    int *A = (int*)malloc(size_A * sizeof(int));
    int *B = (int*)malloc(size_B * sizeof(int));
    int *C = (int*)malloc((size_A - size_B + 1) * sizeof(int));
    
    if (!A || !B || !C) {
        printf("Memory allocation failed\n");
        return 1;
    }
    
    // Get array elements from user
    printf("Enter %d elements for array A:\n", size_A);
    for (int i = 0; i < size_A; i++) {
        scanf("%d", &A[i]);
    }
    
    printf("Enter %d elements for array B:\n", size_B);
    for (int i = 0; i < size_B; i++) {
        scanf("%d", &B[i]);
    }
    
    // Print input arrays
    print_array(A, size_A, "A");
    print_array(B, size_B, "B");
    
    // Perform cross-correlation
    cross_correlation_1d(A, size_A, B, size_B, C);
    
    // Print result
    print_array(C, size_A - size_B + 1, "C (result)");
    
    // Free allocated memory
    free(A);
    free(B);
    free(C);
    
    return 0;
} 