<h1 align="center">ML Algorithms from Scratch</h1>

<p align="center">
  <b>Six classifiers, written in NumPy, with nothing borrowed from scikit-learn —<br>
  then benchmarked against each other on accuracy, wall time and memory.</b>
</p>

<p align="center">
  <img alt="NumPy" src="https://img.shields.io/badge/NumPy-only-013243?style=flat-square&logo=numpy&logoColor=white">
  <img alt="algorithms" src="https://img.shields.io/badge/algorithms-6-blue?style=flat-square">
  <img alt="lines" src="https://img.shields.io/badge/~290_lines_of_algorithm-2ea44f?style=flat-square">
</p>

---

## Why

`clf.fit(X, y)` is three tokens and hides everything that matters. You can use scikit-learn for
years without knowing why KNN falls apart on unscaled features, why a decision tree stops splitting,
or what the hinge loss's two branches actually do to the weight vector.

The way to find out is to write them. Every algorithm here is implemented from first principles in
NumPy — no `sklearn.linear_model`, no `sklearn.tree` — and then all six are run against the same
dataset and measured on three axes, so the trade-offs between them are visible rather than
asserted.

**The six:** Decision Tree · Random Forest · K-Nearest Neighbours · Logistic Regression · Support
Vector Machine · Naive Bayes.

---

## What is actually implemented

### Decision Tree — recursive splitting on information gain

The largest of the six at 116 lines, and the one the Random Forest is built on.

```python
def _information_gain(self, y, X_column, threshold):
    parent_entropy = self._entropy(y)
    left_idxs, right_idxs = self._split(X_column, threshold)
    n, n_l, n_r = len(y), len(left_idxs), len(right_idxs)
    e_l, e_r = self._entropy(y[left_idxs]), self._entropy(y[right_idxs])
    child_entropy = (n_l/n) * e_l + (n_r/n) * e_r
    return parent_entropy - child_entropy
```

Shannon entropy, **child entropy weighted by subset size** (the weighting is the part people get
wrong — an unweighted average lets a two-sample pure split look better than a two-hundred-sample
mostly-pure one), and the gain is the reduction. `_best_split` searches every feature × every
observed threshold and keeps the maximum.

Three stopping conditions in `_grow_tree`: `max_depth` reached, node is pure, or fewer than
`min_samples_split` samples remain. The node class uses a keyword-only `value` argument
(`*, value=None`) so a leaf can never be constructed by accident with positional arguments — a
small, deliberate piece of API hygiene.

**Feature subsampling is built into the tree, not bolted onto the forest:**

```python
feat_idxs = np.random.choice(n_feats, self.n_features, replace=False)
```

Which is exactly right, and sets up the next one.

### Random Forest — the two sources of decorrelation, both present

```python
def _bootstrap_samples(self, X, y):
    idxs = np.random.choice(n_samples, n_samples, replace=True)   # bagging: rows
    return X[idxs], y[idxs]
```

A forest is only better than a tree if the trees **disagree**, and there are two independent
mechanisms for that:

1. **Bagging** — each tree sees a bootstrap resample of the rows (sampled *with* replacement, so
   ~63% of unique rows per tree).
2. **Feature subsampling** — each *split* considers a random subset of the columns, inherited from
   the tree above.

Implementing only bagging is the common half-measure, and it produces a forest of near-identical
trees whenever one feature dominates. Both are here.

Prediction transposes the `(n_trees, n_samples)` prediction matrix and takes a majority vote:

```python
tree_preds = np.swapaxes(predictions, 0, 1)
predictions = np.array([self._most_common_label(pred) for pred in tree_preds])
```

`np.swapaxes` rather than a Python loop — the vectorised instinct is right.

### SVM — sub-gradient descent on the hinge loss, both branches

```python
y_ = np.where(y <= 0, -1, 1)               # 0/1 labels → -1/+1, which the hinge needs

condition = y_[idx] * (np.dot(x_i, self.w) - self.b) >= 1
if condition:
    self.w -= self.lr * (2 * self.lambda_param * self.w)
else:
    self.w -= self.lr * (2 * self.lambda_param * self.w - np.dot(x_i, y_[idx]))
    self.b -= self.lr * y_[idx]
```

This is the whole of soft-margin SVM in eight lines, and both branches are meaningful:

- **Correctly classified outside the margin** (`y·f(x) ≥ 1`) — only the L2 regularisation term
  applies. The point contributes nothing to the decision boundary; it is not a support vector.
- **Inside the margin or misclassified** — the hinge is active, so the data term
  `−y·x` pushes the hyperplane, and the bias moves too.

That asymmetry *is* the support-vector idea: most points do nothing, and only the ones near the
boundary shape it. Written out, it is obvious; hidden behind `SVC()`, it is invisible.

### The others

**KNN** (29 lines) — Euclidean distance to every training point, `np.argsort`, take `k`, majority
vote. Deliberately naive, and its cost shows up in the timing comparison.

**Logistic Regression** (33 lines) — sigmoid, gradient descent on the log-likelihood, weights and
bias updated by the mean gradient.

**Naive Bayes** (46 lines) — Gaussian likelihood per class per feature, class priors from
frequencies, prediction by argmax of the summed log-probabilities. Summing logs rather than
multiplying probabilities is the numerical-stability point that matters on 13 features.

---

## The benchmark

`main.py` runs all six on the same 80/20 split (`random_state=1234`) and records three things each:

| Axis | How |
|---|---|
| **Accuracy** | `np.sum(predictions == y_test) / len(y_test) * 100` |
| **Time** | `time.time()` around fit + predict |
| **Space** | `sys.getsizeof` over the arrays |

Then three bar charts. The comparison is the point of the project — a single accuracy number tells
you which model won on this dataset, whereas accuracy *against* time and memory tells you which one
you would actually deploy. KNN's shape in particular is instructive: it "trains" instantly and pays
at prediction time, which is the opposite of everything else in the table.

**Dataset:** `heart.csv` — the UCI Cleveland heart disease set, 303 rows × 13 features, target
0/1 and near-balanced.

---

## Repository layout

```
DecisionTree.py         Node + DecisionTree — entropy, information gain, recursive growth
RandomForest.py         bagging + feature subsampling + majority vote
KNN.py                  Euclidean distance, k nearest, vote
LogisticRegression.py   sigmoid + gradient descent
SVM.py                  hinge loss sub-gradient descent
NaiveBayes.py           Gaussian likelihood + class priors
main.py                 runs all six, times them, plots the comparison
heart.csv               303 × 14
requirements.txt
```

## Running it

```bash
git clone https://github.com/Vishal-AS-0407/ml-algorithms-from-scratch.git
cd ml-algorithms-from-scratch
pip install -r requirements.txt
python main.py
```

Fix the dataset path first — see below.

---

## Honest notes

- **`main.py` has a hard-coded absolute path:**

  ```python
  dataset = pd.read_csv("C:\\Users\\visha\\OneDrive\\Desktop\\heart.csv")
  ```

  `heart.csv` is committed at the repo root, so this should be `pd.read_csv("heart.csv")`. As
  written the script does not run on any other machine.

- **The SVM's accuracy is wrong, and by a knowable amount.** `SVM.predict` returns
  `np.sign(approx)` — values in `{-1, 0, +1}` — while `y_test` is in `{0, 1}`. The comparison
  `predictions_svm == y_test` therefore only ever counts the true-positive class, and every
  correctly-classified negative (predicted `-1`, actual `0`) is scored as wrong. The reported SVM
  accuracy is roughly its recall on the positive class, not its accuracy.

  One line fixes it:

  ```python
  def predict(self, X):
      return np.where(np.sign(np.dot(X, self.w) - self.b) <= 0, 0, 1)
  ```

  The `fit` method already does the reverse mapping (`np.where(y <= 0, -1, 1)`); `predict` just
  never maps back.

- **No feature scaling.** This is fine for the tree-based models and actively harmful for KNN,
  Logistic Regression and SVM. `chol` runs to 400 and `oldpeak` to 6, so Euclidean distance is
  effectively "difference in cholesterol", and gradient descent on unscaled features converges
  badly. Standardising would change the ranking in that comparison table substantially — and
  demonstrating that would be a genuinely good addition to the project, since *why scaling matters*
  is exactly the kind of thing writing algorithms from scratch is supposed to teach.

- **`sys.getsizeof` measures the wrong thing.** It returns the size of the data arrays, which are
  identical for every algorithm — so the "space complexity" chart compares six equal numbers. What
  would be interesting is the size of the *fitted model*: a Random Forest of 20 trees against an
  SVM's 13 weights and a bias is a genuine three-orders-of-magnitude difference, and it is the
  comparison the chart is trying to make.

- **Timing is single-run.** Wall clock on one execution, no repeats, no warm-up. Fine for
  order-of-magnitude comparison, not for anything finer.

- **No random seed for the forest.** `np.random.choice` is unseeded in both `_bootstrap_samples`
  and `_grow_tree`, so Random Forest and Decision Tree results vary between runs.

- **The train/test split happens inside the Random Forest timing block**, so its measured time
  includes the split. A few milliseconds; worth moving out.

- **The implementations are correct.** The bugs above are in the *harness* — paths, label mapping,
  measurement — not in the algorithms, which are the part the project is about.
