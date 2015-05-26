# This server gets pings to localhost:5000/ with sensor data and responds with the
# prediction of a collision occurring.

from flask import Flask, request
import cPickle

app = Flask(__name__)

with open('../classifier.pkl', 'rb') as fid:
    clf = cPickle.load(fid)

    @app.route("/")
    def index():
      data = request.args.get('data', '')
      return str(clf.predict([data.split(',')])[0])

    if __name__ == "__main__":
        app.run()