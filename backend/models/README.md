# Jaundice Detection Model

## Overview

This directory should contain the pretrained jaundice detection model file.

## Required File

Place your trained model here:
- **Filename**: `jaundice_model.h5`
- **Model Type**: Keras/TensorFlow model
- **Input Shape**: (224, 224, 3) - RGB image
- **Output**: 3 classes with softmax activation

## Model Classes

The model must output predictions for these 3 classes (in order):
1. **Normal** - No jaundice detected
2. **Mild Jaundice** - Moderate jaundice level
3. **Severe Jaundice** - High jaundice level

## Model Architecture Example

Your model should follow this structured output:

```python
model = keras.Sequential([
    # Your architecture layers here (e.g., MobileNetV2 base)
    keras.layers.Dense(3, activation='softmax')  # Output layer
])
```

## Installation

If you don't have a trained model yet, you can create a mock model for testing:

```python
import tensorflow as tf
from tensorflow import keras

# Create a simple untrained model (for testing only!)
model = keras.Sequential([
    keras.layers.Input(shape=(224, 224, 3)),
    keras.layers.Conv2D(32, 3, activation='relu'),
    keras.layers.MaxPooling2D(),
    keras.layers.GlobalAveragePooling2D(),
    keras.layers.Dense(3, activation='softmax')
])

# Save the model
model.save('jaundice_model.h5')
```

**Note**: This mock model will give random predictions. For production use, train a proper model on a medical jaundice dataset.

## Usage

Once `jaundice_model.h5` is placed in this directory, the Flask backend will automatically load it at startup and use it for predictions via the `/api/jaundice/predict` endpoint.

## Training Your Own Model

To train a custom jaundice detection model:

1. **Collect Dataset**: Gather labeled images of baby eyes/skin with jaundice levels
2. **Preprocess**: Resize to 224x224, normalize pixel values
3. **Train**: Use transfer learning with MobileNetV2 or EfficientNet
4. **Validate**: Test on held-out medical data
5. **Save**: Export as `jaundice_model.h5`

## References

- [BiliScreen Research Paper](https://dl.acm.org/doi/10.1145/3130945)
- [MobileNetV2 Documentation](https://keras.io/api/applications/mobilenet/)
- [TensorFlow Model Saving](https://www.tensorflow.org/guide/keras/save_and_serialize)
