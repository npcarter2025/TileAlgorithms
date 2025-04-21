#!/bin/bash

# Script to compile and run all convolution and cross-correlation implementations

# Get the absolute path to the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the directory for executables and templates using relative paths
BIN_DIR="bin"
TEMPLATES_DIR="templates"
CROSS_CORR_DIR="cross_correlation"
CONV_1D_DIR="1d_convolution"
CONV_2D_DIR="2d_convolution"
CONV_3D_DIR="3d_convolution"

# Create the bin directory if it doesn't exist
mkdir -p $BIN_DIR

compile_templates() {
    echo "===== Compiling template files ====="

    # Cross-Correlation Templates
    echo "Compiling Cross-Correlation templates..."
    gcc -o $BIN_DIR/naive_cross_correlation_template $TEMPLATES_DIR/cross_correlation_naive.c
    gcc -o $BIN_DIR/tiled_cross_correlation_template $TEMPLATES_DIR/cross_correlation_tiled.c

    # 1D Convolution Templates
    echo "Compiling 1D Convolution templates..."
    gcc -o $BIN_DIR/naive_convolution_template $TEMPLATES_DIR/convolution_naive.c
    gcc -o $BIN_DIR/tiled_convolution_template $TEMPLATES_DIR/convolution_tiled.c

    # 2D Convolution Templates
    echo "Compiling 2D Convolution template..."
    gcc -o $BIN_DIR/convolution_2d_template $TEMPLATES_DIR/convolution_2d_naive.c
    gcc -o $BIN_DIR/tiled_convolution_2d_template $TEMPLATES_DIR/convolution_2d_tiled.c
    
    # 3D Convolution Templates
    echo "Compiling 3D Convolution templates..."
    gcc -o $BIN_DIR/naive_convolution_3d_template $TEMPLATES_DIR/convolution_3d_naive.c
    gcc -o $BIN_DIR/tiled_convolution_3d_template $TEMPLATES_DIR/convolution_3d_tiled.c
    
    echo "===== Template compilation complete ====="
    echo ""
}

compile_complete_implementations() {
    echo "===== Compiling complete implementations ====="

    # Cross-Correlation
    echo "Compiling Cross-Correlation implementations..."
    gcc -o $BIN_DIR/naive_cross_correlation $CROSS_CORR_DIR/naive/cross_correlation.c
    gcc -o $BIN_DIR/tiled_cross_correlation $CROSS_CORR_DIR/tiled/tiled_cross_correlation.c
    gcc -o $BIN_DIR/cross_correlation_comparison $CROSS_CORR_DIR/cross_correlation_comparison.c

    # 1D Convolution
    echo "Compiling 1D Convolution implementations..."
    gcc -o $BIN_DIR/naive_convolution $CONV_1D_DIR/naive/convolution.c
    gcc -o $BIN_DIR/tiled_convolution $CONV_1D_DIR/tiled/tiled_convolution.c
    gcc -o $BIN_DIR/convolution_comparison $CONV_1D_DIR/convolution_comparison.c

    # 2D Convolution
    echo "Compiling 2D Convolution implementations..."
    gcc -o $BIN_DIR/convolution_2d $CONV_2D_DIR/naive/convolution_2d.c
    gcc -o $BIN_DIR/tiled_convolution_2d $CONV_2D_DIR/tiled/tiled_convolution_2d.c
    gcc -o $BIN_DIR/convolution_2d_comparison $CONV_2D_DIR/convolution_2d_comparison.c
    
    # 3D Convolution (when complete implementations are available)
    echo "Compiling 3D Convolution implementations..."
    gcc -o $BIN_DIR/convolution_3d $CONV_3D_DIR/naive/convolution_3d.c
    gcc -o $BIN_DIR/tiled_convolution_3d $CONV_3D_DIR/tiled/tiled_convolution_3d.c
    gcc -o $BIN_DIR/convolution_3d_comparison $CONV_3D_DIR/convolution_3d_comparison.c

    echo "===== Complete implementations compilation complete ====="
    echo ""
}

show_answer_file() {
    local file=$1
    echo "========== ANSWER FILE: $file =========="
    cat "$file"
    echo "========================================="
    echo ""
}

# Function to run cross-correlation with default values
run_cross_correlation_default() {
    # Create a temporary script to feed input to the program
    cat > temp_input.txt << EOF
50000
2000
64
32
EOF
    echo "Running Cross-Correlation Comparison with default values:"
    echo "  - Array A size: 50000"
    echo "  - Array B size: 2000"
    echo "  - Tile A size: 64"
    echo "  - Tile B size: 32"
    echo ""
    $BIN_DIR/cross_correlation_comparison < temp_input.txt
    rm temp_input.txt
}

# Function to run 1D convolution with default values
run_1d_convolution_default() {
    # Create a temporary script to feed input to the program
    cat > temp_input.txt << EOF
50000
2000
64
32
EOF
    echo "Running 1D Convolution Comparison with default values:"
    echo "  - Array A size: 50000"
    echo "  - Array B size: 2000"
    echo "  - Tile A size: 64"
    echo "  - Tile B size: 32"
    echo ""
    $BIN_DIR/convolution_comparison < temp_input.txt
    rm temp_input.txt
}

# Function to run 2D convolution with default values
run_2d_convolution_default() {
    # Create a temporary script to feed input to the program
    cat > temp_input.txt << EOF
500
500
5
5
32
32
EOF
    echo "Running 2D Convolution Comparison with default values:"
    echo "  - Matrix A size: 500x500"
    echo "  - Kernel B size: 5x5"
    echo "  - Tile height: 32"
    echo "  - Tile width: 32"
    echo ""
    $BIN_DIR/convolution_2d_comparison < temp_input.txt
    rm temp_input.txt
}

# Function to run 3D convolution with default values
run_3d_convolution_default() {
    # Create a temporary script to feed input to the program
    cat > temp_input.txt << EOF
20
20
20
4
4
4
4
4
4
2
2
2
0
EOF
    echo "Running 3D Convolution Comparison with default values:"
    echo "  - Input A dimensions: 20x20x20"
    echo "  - Kernel B dimensions: 4x4x4"
    echo "  - Tile A dimensions: 4x4x4"
    echo "  - Tile B dimensions: 2x2x2"
    echo "  - No tile optimization"
    echo ""
    $BIN_DIR/convolution_3d_comparison < temp_input.txt
    rm temp_input.txt
}

# Function to optimize tile size for cross-correlation
optimize_cross_correlation_tiles() {
    echo "===== Optimizing Tile Sizes for Cross-Correlation ====="
    echo "Testing various tile sizes to find the optimal configuration..."
    
    # Define input sizes
    size_A=50000
    size_B=2000
    
    # Define tile sizes to test
    tile_sizes=(16 32 64 128 256)
    
    best_time=999999
    best_tile_A=0
    best_tile_B=0
    
    for tile_A in "${tile_sizes[@]}"; do
        for tile_B in "${tile_sizes[@]}"; do
            # Skip if tile_B is larger than size_B
            if [ $tile_B -gt $size_B ]; then
                continue
            fi
            
            # Create input for this configuration
            cat > temp_input.txt << EOF
$size_A
$size_B
$tile_A
$tile_B
EOF
            
            echo -n "Testing tile_A=$tile_A, tile_B=$tile_B... "
            
            # Capture the output to extract timing information
            output=$($BIN_DIR/cross_correlation_comparison < temp_input.txt)
            
            # Extract the time for tiled implementation
            tiled_time=$(echo "$output" | grep "Tiled implementation" | awk '{print $3}')
            
            echo "Time: $tiled_time seconds"
            
            # Compare and update best time
            if (( $(echo "$tiled_time < $best_time" | bc -l) )); then
                best_time=$tiled_time
                best_tile_A=$tile_A
                best_tile_B=$tile_B
            fi
        done
    done
    
    rm -f temp_input.txt
    
    echo "===== Optimization Results ====="
    echo "Optimal tile sizes for Cross-Correlation:"
    echo "  - Tile A size: $best_tile_A"
    echo "  - Tile B size: $best_tile_B"
    echo "  - Execution time: $best_time seconds"
    
    # Run one more time with the optimal configuration
    cat > temp_input.txt << EOF
$size_A
$size_B
$best_tile_A
$best_tile_B
EOF
    
    echo -e "\nRunning with optimal tile sizes..."
    $BIN_DIR/cross_correlation_comparison < temp_input.txt
    rm -f temp_input.txt
}

# Function to optimize tile size for 1D convolution
optimize_1d_convolution_tiles() {
    echo "===== Optimizing Tile Sizes for 1D Convolution ====="
    echo "Testing various tile sizes to find the optimal configuration..."
    
    # Define input sizes
    size_A=50000
    size_B=2000
    
    # Define tile sizes to test
    tile_sizes=(16 32 64 128 256)
    
    best_time=999999
    best_tile_A=0
    best_tile_B=0
    
    for tile_A in "${tile_sizes[@]}"; do
        for tile_B in "${tile_sizes[@]}"; do
            # Skip if tile_B is larger than size_B
            if [ $tile_B -gt $size_B ]; then
                continue
            fi
            
            # Create input for this configuration
            cat > temp_input.txt << EOF
$size_A
$size_B
$tile_A
$tile_B
EOF
            
            echo -n "Testing tile_A=$tile_A, tile_B=$tile_B... "
            
            # Capture the output to extract timing information
            output=$($BIN_DIR/convolution_comparison < temp_input.txt)
            
            # Extract the time for tiled implementation
            tiled_time=$(echo "$output" | grep "Tiled implementation" | awk '{print $3}')
            
            echo "Time: $tiled_time seconds"
            
            # Compare and update best time
            if (( $(echo "$tiled_time < $best_time" | bc -l) )); then
                best_time=$tiled_time
                best_tile_A=$tile_A
                best_tile_B=$tile_B
            fi
        done
    done
    
    rm -f temp_input.txt
    
    echo "===== Optimization Results ====="
    echo "Optimal tile sizes for 1D Convolution:"
    echo "  - Tile A size: $best_tile_A"
    echo "  - Tile B size: $best_tile_B"
    echo "  - Execution time: $best_time seconds"
    
    # Run one more time with the optimal configuration
    cat > temp_input.txt << EOF
$size_A
$size_B
$best_tile_A
$best_tile_B
EOF
    
    echo -e "\nRunning with optimal tile sizes..."
    $BIN_DIR/convolution_comparison < temp_input.txt
    rm -f temp_input.txt
}

# Function to optimize tile size for 2D convolution
optimize_2d_convolution_tiles() {
    echo "===== Optimizing Tile Sizes for 2D Convolution ====="
    echo "Testing various tile sizes to find the optimal configuration..."
    
    # Define input sizes
    height_A=500
    width_A=500
    height_B=5
    width_B=5
    
    # Define tile sizes to test
    tile_sizes=(8 16 32 64)
    
    best_time=999999
    best_tile_height=0
    best_tile_width=0
    
    for tile_height in "${tile_sizes[@]}"; do
        for tile_width in "${tile_sizes[@]}"; do
            # Create input for this configuration
            cat > temp_input.txt << EOF
$height_A
$width_A
$height_B
$width_B
$tile_height
$tile_width
EOF
            
            echo -n "Testing tile_height=$tile_height, tile_width=$tile_width... "
            
            # Capture the output to extract timing information
            output=$($BIN_DIR/convolution_2d_comparison < temp_input.txt)
            
            # Extract the time for tiled implementation
            tiled_time=$(echo "$output" | grep "Tiled implementation" | awk '{print $3}')
            
            echo "Time: $tiled_time seconds"
            
            # Compare and update best time
            if (( $(echo "$tiled_time < $best_time" | bc -l) )); then
                best_time=$tiled_time
                best_tile_height=$tile_height
                best_tile_width=$tile_width
            fi
        done
    done
    
    rm -f temp_input.txt
    
    echo "===== Optimization Results ====="
    echo "Optimal tile sizes for 2D Convolution:"
    echo "  - Tile height: $best_tile_height"
    echo "  - Tile width: $best_tile_width"
    echo "  - Execution time: $best_time seconds"
    
    # Run one more time with the optimal configuration
    cat > temp_input.txt << EOF
$height_A
$width_A
$height_B
$width_B
$best_tile_height
$best_tile_width
EOF
    
    echo -e "\nRunning with optimal tile sizes..."
    $BIN_DIR/convolution_2d_comparison < temp_input.txt
    rm -f temp_input.txt
}

# Function to optimize tile size for 3D convolution
optimize_3d_convolution_tiles() {
    echo "===== Optimizing Tile Sizes for 3D Convolution ====="
    echo "Testing various tile sizes to find the optimal configuration..."
    
    # Define input sizes
    size_A_x=20
    size_A_y=20
    size_A_z=20
    size_B_x=4
    size_B_y=4
    size_B_z=4
    
    # Create input for optimization
    cat > temp_input.txt << EOF
$size_A_x
$size_A_y
$size_A_z
$size_B_x
$size_B_y
$size_B_z
4
4
4
2
2
2
1
EOF
    
    echo "Running optimization for 3D convolution..."
    $BIN_DIR/convolution_3d_comparison < temp_input.txt
    rm -f temp_input.txt
}

run_template_tests() {
    echo "===== Running Template Implementations ====="
    
    local algorithm=$1
    
    case $algorithm in
        1) # Cross-Correlation Naive
            echo "Running Naive Cross-Correlation Template..."
            $BIN_DIR/naive_cross_correlation_template
            ;;
        2) # Cross-Correlation Tiled
            echo "Running Tiled Cross-Correlation Template..."
            $BIN_DIR/tiled_cross_correlation_template
            ;;
        3) # 1D Convolution Naive
            echo "Running Naive 1D Convolution Template..."
            $BIN_DIR/naive_convolution_template
            ;;
        4) # 1D Convolution Tiled
            echo "Running Tiled 1D Convolution Template..."
            $BIN_DIR/tiled_convolution_template
            ;;
        5) # 2D Convolution Naive
            echo "Running 2D Convolution Template..."
            $BIN_DIR/convolution_2d_template
            ;;
        6) # 2D Tiled Convolution
            echo "Running 2D Tiled Convolution Template..."
            $BIN_DIR/tiled_convolution_2d_template $CONV_2D_DIR/tiled/tiled_convolution_2d.c
            ;;
        7) # 3D Naive Convolution
            echo "Running 3D Naive Convolution Template..."
            $BIN_DIR/naive_convolution_3d_template $CONV_3D_DIR/naive/convolution_3d.c
            ;;
        8) # 3D Tiled Convolution
            echo "Running 3D Tiled Convolution Template..."
            $BIN_DIR/tiled_convolution_3d_template $CONV_3D_DIR/tiled/tiled_convolution_3d.c
            ;;
        *)
            echo "Invalid algorithm selection."
            ;;
    esac
}

give_up_and_show_answer() {
    local algorithm=$1
    
    case $algorithm in
        1) # Cross-Correlation Naive
            echo "Here is the answer for Naive Cross-Correlation:"
            show_answer_file "$CROSS_CORR_DIR/naive/cross_correlation.c"
            ;;
        2) # Cross-Correlation Tiled
            echo "Here is the answer for Tiled Cross-Correlation:"
            show_answer_file "$CROSS_CORR_DIR/tiled/tiled_cross_correlation.c"
            ;;
        3) # 1D Convolution Naive
            echo "Here is the answer for Naive 1D Convolution:"
            show_answer_file "$CONV_1D_DIR/naive/convolution.c"
            ;;
        4) # 1D Convolution Tiled
            echo "Here is the answer for Tiled 1D Convolution:"
            show_answer_file "$CONV_1D_DIR/tiled/tiled_convolution.c"
            ;;
        5) # 2D Convolution Naive
            echo "Here is the answer for 2D Convolution:"
            show_answer_file "$CONV_2D_DIR/naive/convolution_2d.c"
            ;;
        6) # 2D Tiled Convolution
            echo "Here is the answer for 2D Tiled Convolution:"
            show_answer_file "$CONV_2D_DIR/tiled/tiled_convolution_2d.c"
            ;;
        7) # 3D Naive Convolution
            echo "Here is the answer for 3D Naive Convolution:"
            show_answer_file "$CONV_3D_DIR/naive/convolution_3d.c"
            ;;
        8) # 3D Tiled Convolution
            echo "Here is the answer for 3D Tiled Convolution:"
            show_answer_file "$CONV_3D_DIR/tiled/tiled_convolution_3d.c"
            ;;
        *)
            echo "Invalid algorithm selection."
            ;;
    esac
}

# Main function to display the menu and handle user choices
main() {
    echo "========================================="
    echo "Convolution and Cross-Correlation Tester"
    echo "========================================="
    echo ""
    
    # Check if both templates and complete implementations have already been compiled
    templates_compiled=0
    complete_compiled=0
    
    if [ -f "$BIN_DIR/naive_cross_correlation_template" ] && [ -f "$BIN_DIR/naive_convolution_template" ]; then
        templates_compiled=1
    fi
    
    if [ -f "$BIN_DIR/naive_cross_correlation" ] && [ -f "$BIN_DIR/naive_convolution" ]; then
        complete_compiled=1
    fi
    
    # If nothing is compiled yet, compile both templates and implementations
    if [ $templates_compiled -eq 0 ] && [ $complete_compiled -eq 0 ]; then
        compile_templates
        compile_complete_implementations
    fi
    
    # Choose which mode to run
    echo "Choose a mode:"
    echo "1. Template Mode (Practice implementing algorithms)"
    echo "2. Complete Implementations Mode (Run tests with complete algorithms)"
    read -p "Enter choice (1-2): " mode_choice
    echo ""
    
    case $mode_choice in
        1)
            # Make sure templates are compiled
            if [ $templates_compiled -eq 0 ]; then
                compile_templates
            fi
            run_template_mode
            ;;
        2)
            # Make sure complete implementations are compiled
            if [ $complete_compiled -eq 0 ]; then
                compile_complete_implementations
            fi
            run_complete_mode
            ;;
        *)
            echo "Invalid choice. Exiting."
            exit 1
            ;;
    esac
}

# Function to run the complete implementations mode
run_complete_mode() {
    while true; do
        echo "===== Complete Implementations Mode ====="
        echo "Choose an option:"
        echo "1. Run Cross-Correlation Comparison (Default Values)"
        echo "2. Run 1D Convolution Comparison (Default Values)"
        echo "3. Run 2D Convolution Comparison (Default Values)"
        echo "4. Run 3D Convolution Comparison (Default Values)"
        echo "5. Run Cross-Correlation Interactively"
        echo "6. Run 1D Convolution Interactively"
        echo "7. Run 2D Convolution Interactively"
        echo "8. Run 3D Convolution Interactively"
        echo "9. Optimize Cross-Correlation Tile Sizes"
        echo "10. Optimize 1D Convolution Tile Sizes"
        echo "11. Optimize 2D Convolution Tile Sizes"
        echo "12. Optimize 3D Convolution Tile Sizes"
        echo "13. Run All Optimizations"
        echo "0. Return to Main Menu"
        read -p "Enter choice: " complete_choice
        echo ""
        
        case $complete_choice in
            1)
                run_cross_correlation_default
                ;;
            2)
                run_1d_convolution_default
                ;;
            3)
                run_2d_convolution_default
                ;;
            4)
                run_3d_convolution_default
                ;;
            5)
                $BIN_DIR/cross_correlation_comparison
                ;;
            6)
                $BIN_DIR/convolution_comparison
                ;;
            7)
                $BIN_DIR/convolution_2d_comparison
                ;;
            8)
                $BIN_DIR/convolution_3d_comparison
                ;;
            9)
                optimize_cross_correlation_tiles
                ;;
            10)
                optimize_1d_convolution_tiles
                ;;
            11)
                optimize_2d_convolution_tiles
                ;;
            12)
                optimize_3d_convolution_tiles
                ;;
            13)
                optimize_cross_correlation_tiles
                optimize_1d_convolution_tiles
                optimize_2d_convolution_tiles
                optimize_3d_convolution_tiles
                ;;
            0)
                break
                ;;
            *)
                echo "Invalid choice. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
        echo ""
    done
}

# Function for template mode
run_template_mode() {
    while true; do
        echo "===== Template Mode ====="
        echo "Choose an algorithm to practice:"
        echo "1. Naive Cross-Correlation"
        echo "2. Tiled Cross-Correlation"
        echo "3. Naive 1D Convolution"
        echo "4. Tiled 1D Convolution"
        echo "5. 2D Convolution"
        echo "6. 2D Tiled Convolution"
        echo "7. 3D Naive Convolution"
        echo "8. 3D Tiled Convolution"
        echo "0. Return to Main Menu"
        read -p "Enter choice: " template_choice
        echo ""
        
        case $template_choice in
            1)
                run_template $BIN_DIR/naive_cross_correlation_template $CROSS_CORR_DIR/naive/cross_correlation.c
                ;;
            2)
                run_template $BIN_DIR/tiled_cross_correlation_template $CROSS_CORR_DIR/tiled/tiled_cross_correlation.c
                ;;
            3)
                run_template $BIN_DIR/naive_convolution_template $CONV_1D_DIR/naive/convolution.c
                ;;
            4)
                run_template $BIN_DIR/tiled_convolution_template $CONV_1D_DIR/tiled/tiled_convolution.c
                ;;
            5)
                run_template $BIN_DIR/convolution_2d_template $CONV_2D_DIR/naive/convolution_2d.c
                ;;
            6)
                run_template $BIN_DIR/tiled_convolution_2d_template $CONV_2D_DIR/tiled/tiled_convolution_2d.c
                ;;
            7)
                run_template $BIN_DIR/naive_convolution_3d_template $CONV_3D_DIR/naive/convolution_3d.c
                ;;
            8)
                run_template $BIN_DIR/tiled_convolution_3d_template $CONV_3D_DIR/tiled/tiled_convolution_3d.c
                ;;
            0)
                break
                ;;
            *)
                echo "Invalid choice. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
        echo ""
    done
}

# Main script starts here
main 