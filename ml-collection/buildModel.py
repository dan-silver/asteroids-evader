import numpy as np
from numpy import cumsum as sum_split
from sklearn.metrics import accuracy_score
from sklearn.svm import SVC
from StringIO import StringIO
import pdb
import cPickle

def percentage_split(array, percentages):
    cdf = sum_split(percentages)
    assert cdf[-1] == 1.0
    stops = map(int, cdf * len(array))
    return [array[a:b] for a, b in zip([0]+stops, stops)]

# 0,1,1,1,1,1,1,1,1,1,0
data = np.genfromtxt('../data.csv', delimiter=',')

train_data, test_data = percentage_split(data, [0.8, 0.2])

determine_is_pos = lambda x: x[0] == True

train_labels = map(determine_is_pos, train_data)
train_features = train_data[:, 1:10].astype(np.float)

print "{}% positive samples".format(len(filter(lambda x: x, train_labels)) / float(len(train_labels)) *100)

test_labels = map(determine_is_pos, test_data)
test_features = test_data[:, 1:10].astype(np.float)


clf = SVC(verbose=True, cache_size=2*1000)
print clf

clf.fit(train_features, train_labels)

pred = clf.predict(test_features)
accuracy = accuracy_score(pred, test_labels) * 100
print "accuracy: {}".format(accuracy)

with open('classifier.pkl', 'wb') as fid:
    cPickle.dump(clf, fid)   



# grid search


# clf = SVC(verbose=True, cache_size=8000)
# # clf.fit(train_features, train_labels)

# from sklearn import svm, grid_search, datasets
# parameters = {'C': [1, 10, 100, 1000], 'gamma': [0, 0.001, 0.0001], 'kernel': ['rbf']}

# clf_ = grid_search.GridSearchCV(clf, parameters)
# clf_.fit(train_features, train_labels)


# pred = clf_.predict(test_features)
# accuracy = accuracy_score(pred, test_labels) * 100
# print "accuracy: {}".format(accuracy)
# print clf_
# print "Best parameters set found on development set:"
# print clf_.best_estimator_


