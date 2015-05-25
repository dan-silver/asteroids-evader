var SHIP_VELOCITY_X = 50;

var SENSORS = {
  quantity: 10,
  height: 10,
  width: 30,
  distance: 50,
  angle_spread: 125
}

var sim_data = []

function sendSimData(collision) {
  var ship = Q("Ship").first()

  var data = {
    collision: collision,
    activatedSensors: Object.keys(ship.activatedSensors)
  }
  $.post('http://localhost:3000/', data)

  Q.stageScene("level1");
}

window.addEventListener("load", function() {
  var Q = window.Q = Quintus({development: true, autoFocus: false })
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
      for (var i = 1; i<p.points.length; i++) {
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
      var collision = Q.collision(this, Q("Asteroid").first());

      if (collision) {
        this.p.ship.activateSensor(this)
        console.log('collision')
      }

      this.fillColor = collision ? "#DB9A9A" : "#9ADB9F"
    },

    createShape: function(p) {
      p = p || {};

      var startAmount = p.size;

      //draw a rectangle
      p.points = [
        [0, 0],
        [0, SENSORS.height],
        [SENSORS.width, SENSORS.height],
        [SENSORS.width, 0]
      ];

      p.w = SENSORS.width;
      p.h = SENSORS.height;

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
        points: [[0, -10 ], [ 5, 10 ], [ -5,10 ]],
        activated: false
      });

      this.add("2d");
      this.sensors = []

      this.activationObject = new Q.Sprite({ x: 0, y: 0, w: 100, h: 100 });
    },

    addSensors: function() {
      // array of sensor ids that have been activated (only added, not removed)
      this.activatedSensors = {}

      for (var i = 0; i < SENSORS.quantity; i++) {
        this.sensors.push(Q.stage(0).insert(new Q.Sensor({sensorId: i, ship: this})))
      }
    },

    activateSensor: function(sensor) {
      if(!this.p.activated) {
        return this.checkActivation();
      }

      var sensorId = sensor.p.sensorId
      this.activatedSensors[sensorId] = true

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
      this.updateSensorPositions()

      var p = this.p;
      p.angle += p.omega * dt;
      p.omega *=  1 - 1 * dt;

      if(Q.inputs["right"]) {
        p.omega += p.omegaDelta * dt;
        if (p.omega > p.maxOmega) {
          p.omega = p.maxOmega;
        }
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

      if (p.x > Q.width) {
        sendSimData(false)
      }

    },

    draw: function(ctx) {
      if(this.p.activated) {
        this._super(ctx);
      }
    },

    updateSensorPositions: function() {
      for (var i=0; i<this.sensors.length; i++) {
        var sensor = this.sensors[i]
        sensor.p.angle = this.p.angle + (i / (this.sensors.length - 1)) * SENSORS.angle_spread + ((180 - SENSORS.angle_spread)/2)

        sensor.p.x = this.p.x + (SENSORS.distance * Math.sin(sensor.p.angle * Math.PI / 180 - Math.PI / 2))
        sensor.p.y = this.p.y + (SENSORS.distance * Math.cos(sensor.p.angle * Math.PI / 180 + Math.PI / 2))
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
        sendSimData(true)
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

  Q.scene("level1",function(stage) {
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
      Q("Ship").first().addSensors()
    }, 100)
  });

  Q.stageScene("level1");

  // uncomment the following 2 lines to see rendering bounds
  // Q.debug = true;
  // Q.debugFill = true
});

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}