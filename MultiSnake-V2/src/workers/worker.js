// worker.js
const { parentPort, workerData } = require('worker_threads');

// Extract the required data from the workerData object
const { room, tick } = workerData;

// Perform the room's tick operation
function performRoomTick() {
    room.tick();
}

// Handle messages received from the main thread
parentPort.on('message', (message) => {
  if (message === 'tick') {
    performRoomTick();
    parentPort.postMessage('tick complete');
  }
});
