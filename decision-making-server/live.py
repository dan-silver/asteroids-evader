# This server gets pings to localhost:5000/ with sensor data and responds with the
# prediction of a collision occurring.

import numpy as np
from numpy import cumsum as sum_split
from sklearn.metrics import accuracy_score
from sklearn.svm import SVC
from StringIO import StringIO
import pdb
import cPickle

from datetime import timedelta
from flask import Flask, make_response, request, current_app
from functools import update_wrapper

app = Flask(__name__)

with open('../classifier.pkl', 'rb') as fid:
    clf = cPickle.load(fid)

    @app.route("/")
    def index():
      data = request.args.get('data', '')
      return str(clf.predict([data.split(',')])[0])

    if __name__ == "__main__":
        app.run()