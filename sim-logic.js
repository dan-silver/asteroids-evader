var NUMBER_OF_SENSORS = 5,
    SHIP_VELOCITY_X   = 50;

var sensorSize = {
  height: 15,
  width: 60,
  distance: 70
}

var sim_data = []

function sendSimData() {
  console.log("sending sim_data to server", sim_data)
  //@todo
}

window.addEventListener("load", function() {
  var Q = window.Q = Quintus({ development: true })
    .include("Sprites, Scenes, Input, 2D, Touch, UI")
    .setup();

  Q.input.keyboardControls();

  Q.gravityX = Q.gravityY = 0;

  Q.SPRITE_SHIP = 1;
  Q.SPRITE_ASTEROID = 4;

  Q.Sprite.extend("VectorSprite", {
    draw: function(ctx) {
      var p = this.p;
      ctx.fillStyle = this.fillColor || "#FFF";

      ctx.beginPath();
      ctx.moveTo(p.points[0][0], p.points[0][1]);
      for (var i = 1;i<p.points.length;i++) {
        ctx.lineTo(p.points[i][0], p.points[i][1]);
      }
      ctx.fill();
    }
  });


  Q.VectorSprite.extend("Sensor", {
    init: function(p) {
      p = this.createShape(p);

      this._super(p, {
        sensor: true
      });
      this.add("2d");
    },
    step: function(dt) {
      var asteroid = Q("Asteroid").first()

      if (Q.collision(this, asteroid)) {
        this.collision = true
        console.log('sensor collision')
      } else {
        this.collision = false
      }

      if (this.collision) {
        this.fillColor = "#DB9A9A"
      } else {
        this.fillColor = "#9ADB9F"
      }

      //reset the collision boolean for the next frame
      this.collision = false
    },

    createShape: function(p) {
      p = p || {};

      var startAmount = p.size;

      //draw a rectangle
      p.points = [
        [0, 0],
        [0, sensorSize.height],
        [sensorSize.width, sensorSize.height],
        [sensorSize.width, 0]
      ];

      p.w = sensorSize.width;
      p.h = sensorSize.height;

      for(var i = 0; i < p.points.length; i++) {
        p.points[i][0] -= p.w/2;
        p.points[i][1] -= p.h/2;
      }

      p.cx = p.w/2;
      p.cy = p.h/2;
      p.angle = 0;
      return p;
    },
  });

  Q.VectorSprite.extend("Ship", {
    init: function(p) {
      this._super(p, {
        type: Q.SPRITE_NONE,
        collisionMask: Q.SPRITE_ASTEROID,
        w: 10,
        h: 20,
        omega: 0,
        omegaDelta: 700,
        maxOmega: 400,
        acceleration: 8,
        points: [ [0, -10 ], [ 5, 10 ], [ -5,10 ]],
        activated: false
      });

      this.add("2d");

      this.activationObject = new Q.Sprite({ x: Q.width/2, y: Q.height/2, w: 100, h: 100 });

      //add sensors
      this.sensors = []

      for (var i = 0; i < NUMBER_OF_SENSORS; i++) {
        this.sensors.push(Q.stage(0).insert(new Q.Sensor({sensorId: i})))
      }
    },

    checkActivation: function() {
      if(!this.stage.search(this.activationObject, Q.SPRITE_ASTEROID)) {
        this.p.activated = true;
      }
    },

    step: function(dt) {
      if(!this.p.activated) {
        return this.checkActivation();
      }

      var p = this.p;
      p.angle += p.omega * dt;
      p.omega *=  1 - 1 * dt;

      if(Q.inputs["right"]) { 
        p.omega += p.omegaDelta * dt;
        if(p.omega > p.maxOmega) { p.omega = p.maxOmega; }
      } else if(Q.inputs["left"]) {
        p.omega -= p.omegaDelta * dt;
        if(p.omega < -p.maxOmega) { p.omega = -p.maxOmega; }
      }

      if(p.angle > 360) { p.angle -= 360; }
      if(p.angle < 0) { p.angle += 360; }

      if(Q.inputs["up"]) {
        var thrustX = Math.sin(p.angle * Math.PI / 180),
            thrustY = -Math.cos(p.angle * Math.PI / 180);

        p.vx += thrustX * p.acceleration;
        p.vy += thrustY * p.acceleration;
      }
      this.updateSensorPositions()

    },

    draw: function(ctx) {
      if(this.p.activated) {
        this._super(ctx);
      }
    },

    updateSensorPositions: function() {
      for (var i=0; i<this.sensors.length; i++) {
        var sensor = this.sensors[i]
        sensor.p.angle = this.p.angle + (i / (this.sensors.length - 1)) * 90 + 45

        sensor.p.x = this.p.x + (sensorSize.distance * Math.sin(sensor.p.angle * Math.PI / 180 - Math.PI / 2))
        sensor.p.y = this.p.y + (sensorSize.distance * Math.cos(sensor.p.angle * Math.PI / 180 + Math.PI / 2))
      }
    },

    reset: function() {
      Q._extend(this.p, {
        x: Q.width/2,
        y: Q.height/2,
        vx: 0,
        vy: 0,
        angle: 0,
        omega: 0,
        activated: false
      });

    }
  });

  Q.VectorSprite.extend("Asteroid", {
    init: function(p) {
      p = this.createShape(p);

      // if(!p.vx) {
      //   p.startAngle = p.startAngle || Math.random()*360;
      //   var speed = Math.random()*100 + 50;
      //   p.vx = Math.cos(p.startAngle)*speed;
      //   p.vy = Math.sin(p.startAngle)*speed;
      // }

      this._super(p, {
        type: Q.SPRITE_ASTEROID,
        collisionMask: Q.SPRITE_SHIP,
        omega: 0
      });
      this.add("2d");

      this.on("hit.sprite",this,"collision");
    },

    collision: function(col) {
      if(col.obj.isA("Ship")) {
        sim_data.push({todo: true})
        sendSimData()
        setupSimulation()
      }
    },

    step: function(dt) {
      this.p.angle += this.p.omega * dt;
    },

    createShape: function(p) {
      var angle = Math.random()*2*Math.PI,
          numPoints = 7 + Math.floor(Math.random()*5),
          minX = 0, maxX = 0,
          minY = 0, maxY = 0,
          curX, curY;

      p = p || {};

      p.points = [];

      var startAmount = p.size;

      for(var i = 0;i < numPoints;i++) {
        curX = Math.floor(Math.cos(angle) * startAmount);
        curY = Math.floor(Math.sin(angle) * startAmount);

        if(curX < minX) minX = curX;
        if(curX > maxX) maxX = curX;

        if(curY < minY) minY = curY;
        if(curY > maxY) maxY = curY;

        p.points.push([curX,curY]);

        startAmount += Math.floor(Math.random()*3);
        angle += (Math.PI * 2) / (numPoints+1);
      };

      maxX += 30;
      minX -= 30;
      maxY += 30;
      minY -= 30;

      p.w = maxX - minX;
      p.h = maxY - minY;

      for(var i = 0;i < numPoints;i++) {
        p.points[i][0] -= minX + p.w/2;
        p.points[i][1] -= minY + p.h/2;
      }

      p.cx = p.w/2;
      p.cy = p.h/2;
      p.angle = angle;
     return p;
   },
  });

  function setupSimulation() {
    var ship = Q("Ship").first()
    var asteroid = Q("Asteroid").items[0]

    //set the ship on the left side heading right
    ship.p.x = Q.width * 0.05;
    ship.p.y = Q.height/2;
    ship.p.angle = 90;
    ship.p.vx = SHIP_VELOCITY_X;

    //set the asteroid horizontally in the middle, randomize vertical postition
    asteroid.p.x = Q.width/2;
    asteroid.p.y = getRandom(0, Q.height);
  }


  Q.scene("level1",function(stage) {
    var player = stage.insert(new Q.Ship());

    stage.insert(new Q.Asteroid({ size: 50 }));

    setupSimulation()

    //code that's run on every frame
    // stage.on("step",function() {
    // });
  });

  Q.stageScene("level1");

  // uncomment the following 2 lines to see rendering bounds
  Q.debug = true;
  Q.debugFill = true
});

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}