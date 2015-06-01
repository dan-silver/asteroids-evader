function getShip() {
  return Q("Ship").first()
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function sendCollisionTrainingData(collision) {
  $.post('http://localhost:' + COLLISION_TRAINING_SERVER_PORT, {
    collision: collision ? 1 : 0,
    sensors: getShip().getActivatedSensors()
  })

  Q.stageScene("collision-training");
}
