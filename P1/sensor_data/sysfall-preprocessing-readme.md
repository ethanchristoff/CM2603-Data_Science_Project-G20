# SysFall Dataset Preprocessing and Model Implementation

## Overview
Data preprocessing pipeline for the SysFall dataset, preparing it for fall detection analysis.

## Steps

1. Data Cleaning
- Dropped redundant MMA8451Q sensor columns
- Fixed labeling errors in SE14's D07 activity recording
- Created binary labels (1 for falls, 0 for non-falls)

2. Pattern Trimming
- Standardized all sequences to 12 seconds (2400 rows)
- Middle 12 seconds: D01-D05, D17
- First 12 seconds: D06-D16, D18-D19, F01-F15
- Padded groups with <2400 rows by duplicating last row

3. Data Splitting
- Split by subjects into train/validation/test sets
- Training: 60%
- Validation: 20%
- Test: 20%

4. Feature Engineering
- Converted data to 3D matrices (samples × timesteps × features)
- Extracted 1000-timestep informative segments using peak detection
- Applied standard scaling to sensor data

5. Output Files
- X_train.npy, y_train.npy
- X_val.npy, y_val.npy
- X_test.npy, y_test.npy

## Model Implementation

The model implementation is written in the `cnnTuning.ipynb` file.

### CNN Architecture
- Input layer matching preprocessed data shape
- 1D Convolutional layer with variable filters and kernel size
- Batch Normalization
- ReLU activation
- Dropout layer
- Global Average Pooling
- Dense output layer with softmax activation

### Hyperparameter Grid Search
- Filters: [32, 64]
- Kernel size: [3, 5]
- Dropout rate: [0.2, 0.4]
- Batch size: [16, 32]
- Learning rate: [0.001, 0.0005]

### Training
- Optimizer: Adam
- Loss: Sparse Categorical Crossentropy
- Metric: Sparse Categorical Accuracy
- Best model saved based on validation accuracy

## Output Files
- best_cnn.keras (saved in the `Saved Models` directory
