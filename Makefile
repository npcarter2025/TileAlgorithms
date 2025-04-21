# Makefile for Convolution and Cross-Correlation practice

CC = gcc
CFLAGS = -Wall -O3
BIN_DIR = bin

# Make sure the bin directory exists
$(shell mkdir -p $(BIN_DIR))

# Default target - build everything
all: templates implementations

# Build only template files
templates: $(BIN_DIR)/naive_cross_correlation_template \
           $(BIN_DIR)/tiled_cross_correlation_template \
           $(BIN_DIR)/naive_convolution_template \
           $(BIN_DIR)/tiled_convolution_template \
           $(BIN_DIR)/convolution_2d_template \
           $(BIN_DIR)/tiled_convolution_2d_template \
           $(BIN_DIR)/naive_convolution_3d_template \
           $(BIN_DIR)/tiled_convolution_3d_template

# Build all implementations
implementations: $(BIN_DIR)/naive_cross_correlation \
                 $(BIN_DIR)/tiled_cross_correlation \
                 $(BIN_DIR)/cross_correlation_comparison \
                 $(BIN_DIR)/naive_convolution \
                 $(BIN_DIR)/tiled_convolution \
                 $(BIN_DIR)/convolution_comparison \
                 $(BIN_DIR)/convolution_2d \
                 $(BIN_DIR)/tiled_convolution_2d \
                 $(BIN_DIR)/convolution_2d_comparison \
                 $(BIN_DIR)/convolution_3d \
                 $(BIN_DIR)/tiled_convolution_3d \
                 $(BIN_DIR)/convolution_3d_comparison

# Template targets
$(BIN_DIR)/naive_cross_correlation_template: templates/cross_correlation_naive.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/tiled_cross_correlation_template: templates/cross_correlation_tiled.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/naive_convolution_template: templates/convolution_naive.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/tiled_convolution_template: templates/convolution_tiled.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/convolution_2d_template: templates/convolution_2d_naive.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/tiled_convolution_2d_template: templates/convolution_2d_tiled.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/naive_convolution_3d_template: templates/convolution_3d_naive.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/tiled_convolution_3d_template: templates/convolution_3d_tiled.c
	$(CC) $(CFLAGS) -o $@ $<

# Implementation targets
$(BIN_DIR)/naive_cross_correlation: cross_correlation/naive/cross_correlation.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/tiled_cross_correlation: cross_correlation/tiled/tiled_cross_correlation.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/cross_correlation_comparison: cross_correlation/cross_correlation_comparison.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/naive_convolution: 1d_convolution/naive/convolution.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/tiled_convolution: 1d_convolution/tiled/tiled_convolution.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/convolution_comparison: 1d_convolution/convolution_comparison.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/convolution_2d: 2d_convolution/naive/convolution_2d.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/tiled_convolution_2d: 2d_convolution/tiled/tiled_convolution_2d.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/convolution_2d_comparison: 2d_convolution/convolution_2d_comparison.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/convolution_3d: 3d_convolution/naive/convolution_3d.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/tiled_convolution_3d: 3d_convolution/tiled/tiled_convolution_3d.c
	$(CC) $(CFLAGS) -o $@ $<

$(BIN_DIR)/convolution_3d_comparison: 3d_convolution/convolution_3d_comparison.c
	$(CC) $(CFLAGS) -o $@ $<

# Clean targets
clean:
	rm -f $(BIN_DIR)/*
	rm -f temp_input.txt

clean-templates:
	rm -f $(BIN_DIR)/*_template

clean-implementations:
	rm -f $(BIN_DIR)/naive_cross_correlation
	rm -f $(BIN_DIR)/tiled_cross_correlation
	rm -f $(BIN_DIR)/cross_correlation_comparison
	rm -f $(BIN_DIR)/naive_convolution
	rm -f $(BIN_DIR)/tiled_convolution
	rm -f $(BIN_DIR)/convolution_comparison
	rm -f $(BIN_DIR)/convolution_2d
	rm -f $(BIN_DIR)/tiled_convolution_2d
	rm -f $(BIN_DIR)/convolution_2d_comparison
	rm -f $(BIN_DIR)/convolution_3d
	rm -f $(BIN_DIR)/tiled_convolution_3d
	rm -f $(BIN_DIR)/convolution_3d_comparison

# Phony targets
.PHONY: all templates implementations clean clean-templates clean-implementations 