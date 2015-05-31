# asteroids-evader
Uses machine learning to avoid collisions with asteroids

## How it works
#### Simulation

The simulation runs in a loop where a ship travels east and potentially collides with an asteroid.  Sensors attached to the ship change color on contact.

![screenshot](https://raw.githubusercontent.com/dan-silver/asteroids-evader/master/screenshot.png)

The simulation ends either when the ship reaches the right side of the window, or it hits an asteroid.  At that point, the following information is sent to the server to be stored.
 * Ids of sensors that were activated
 * Simulation result, true if there was a collision and false otherwise

#### Training the collision detection model

Use any server to serve the html and js files.  If you have python installed, SimpleHTTPServer is an easy option.

```bash
cd web-simulation
python -m SimpleHTTPServer
# Serving HTTP on 0.0.0.0 port 8000 ...

```
Open http://localhost:8000/ in a web browser and the simulation should automatically run in an infinite loop.

To save the simulation results, start the node server.
```bash
cd data-collection-server
node receiveData.js
# Data collection server listening at http://0.0.0.0:3000

```
The simulation should now be sending data to the node server.
