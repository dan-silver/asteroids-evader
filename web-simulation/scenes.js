function loadScenes() {
  Q.scene("collision-training", function(stage) {
    scene = "collision-training"
    //set the ship on the left side heading right
    stage.insert(new Q.Ship({
      x: Q.width * 0.05,
      y: Q.height/2,
      angle: 90,
      vx: SHIP_VELOCITY_X
    }));

    //set the asteroid horizontally in the middle, randomize vertical postition
    stage.insert(new Q.Asteroid({
      size: 50,
      x: Q.width/2,
      y: getRandom(0, Q.height)
    }));

    //add the sensors after the ship starts moving
    setTimeout(function() {
      getShip().addSensors()
    }, 75)
  });

  Q.scene("free-movement", function(stage) {
    scene = "free-movement"
    //set the ship on the left side heading right
    stage.insert(new Q.Ship({
      x: Q.width * 0.05,
      y: Q.height/2,
      angle: 90,
      vx: 0
    }));

    //set the asteroid in the center
    stage.insert(new Q.Asteroid({
      size: 50,
      x: Q.width/2,
      y: Q.height/2
    }));

    //add the sensors after the ship starts moving
    setTimeout(function() {
      getShip().addSensors()
    }, 75)
  });
}