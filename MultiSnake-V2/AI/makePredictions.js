const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const moveMap = {
  up: [1, 0, 0, 0],
  down: [0, 1, 0, 0],
  left: [0, 0, 1, 0],
  right: [0, 0, 0, 1],
  none: [0,0,0,0]
};
var moveFromIndex = Object.keys(moveMap);
// Load the exported model

const modelJsonPath = path.resolve(__dirname, 'm/model.json');

console.log(modelJsonPath);
var model = false;

async function loadModel() {
  model = await tf.loadLayersModel(`file://${modelJsonPath}`);
}
// Create a function to make predictions
loadModel();


function makePredictions(matrix) {
  if (!model) {
    return ["up", [0, 0, 0, 0], 0.0];
  } else {
    const flattenedBoards = [];
    // Flatten the input matrix into a 1D array
    var flattenedMatrix = matrix.flat();

    // Create a TensorFlow tensor from the flattened matrix
    const inputTensor = tf.tensor2d([flattenedMatrix], [1, flattenedMatrix.length]);

    // Perform prediction using the loaded model
    const predictions = model.predict(inputTensor).arraySync()[0];

    // Return the predictions (direction first, then the array, then the percent of sureness that the direction is correct)
    const predictedIndex = indexOfMax(predictions)[0];
    const predictedMove = moveFromIndex[predictedIndex];
    const confidence = predictions[predictedIndex];
    var toReturn =  [predictedMove, predictions, confidence];
    return toReturn;
  }
}
function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  let max = arr[0];
  let maxIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return [maxIndex,max];
}

module.exports = makePredictions;
