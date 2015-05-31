# This server gets pings to localhost:5000/ with sensor data and responds with the
# prediction of a collision occurring.

from flask import Flask, request
import cPickle
from flask.ext.cors import CORS

app = Flask(__name__)
cors = CORS(app)


with open('../classifier.pkl', 'rb') as fid:
    clf = cPickle.load(fid)

    @app.route("/")
    def index():
      data = [int(numeric_string) for numeric_string in request.args.get('data', '').split(',')]
      prediction = str(clf.predict([data])[0])
      return prediction
    if __name__ == "__main__":
        app.run(port=5000)