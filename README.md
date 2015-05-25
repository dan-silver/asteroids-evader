# asteroids-evader
Uses machine learning to avoid collisions with asteroids

## How it works
#### Simulation

The simulation runs in a loop where a ship travels east and potentially collides with an asteroid.  Sensors attached to the ship detect collisions with the asteroid and change color on contact.
![screenshot](https://raw.githubusercontent.com/dan-silver/asteroids-evader/master/screenshot.png)

The simulation ends either when the ship reaches the right side of the window, or it hits an asteroid.  At that point, the following information is sent to the server to be stored.
 * Ids of sensors that were activated
 * Simulation result, true if there was a collision and false otherwise

#### Building the model
