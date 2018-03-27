var H5PPresave = H5PPresave || {};

H5PPresave['H5P.ArithmeticQuiz'] = function (content, finished) {
  var presave = H5PEditor.Presave;
  var score = 0;

  if (isContentValid()) {
    score = content.maxQuestions;
  }

  presave.validateScore(score);

  if (finished) {
    finished({maxScore: score});
  }

  function isContentValid() {
    return presave.checkNestedRequirements(content, 'content.maxQuestions');
  }
};
