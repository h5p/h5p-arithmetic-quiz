H5P.BasicArithmeticQuiz.ResultPage = (function ($, UI) {
  /**
   * Creates a ResultPage instance
   *
   * @class
   * @namespace H5P.BasicArithmeticQuiz
   * @augments H5P.EventDispatcher
   *
   * @param  {number} maxScore Max score
   * @param  {Object} t Translation objects
   * @fires H5P.Event
   */
  function ResultPage(maxScore, t){
    H5P.EventDispatcher.call(this);
    var self = this;

    this.$resultPage = $('<div>', {
      'class': 'h5p-baq-result-page'
    });

    this.$feedbackContainer = $('<div>', {
      'class': 'h5p-baq-result-page-feedback'
    }).appendTo(this.$resultPage);

    this.$feedbackContainer.append($('<div>', {
      'class': 'h5p-baq-result-page-header',
      'html': t.resultPageHeader
    }));

    this.$score = $('<div>', {
      'class': 'h5p-baq-result-page-score'
    }).appendTo(this.$feedbackContainer);

    this.$time = $('<div>', {
      'class': 'h5p-baq-result-page-time'
    }).appendTo(this.$feedbackContainer);

    this.$retryButton = UI.createButton({
      text: t.retryButton,
      'class': 'mq-control-button',
      click: function () {
        self.trigger('retry');
      }
    }).appendTo(this.$feedbackContainer);


    /**
     * Creates result page
     *
     * @return {H5P.jQuery}
     */
    this.create = function () {
      return this.$resultPage;
    };


    /**
     * Updates result page
     *
     * @param  {number} score
     * @param  {string} time
     */
    this.update = function (score, time) {
      var percent = Math.ceil((score / maxScore) * 100);
      this.$score.html(H5P.BasicArithmeticQuiz.tReplace(t.scoreOnResultPage, {score: score, maxScore: maxScore}) +
                      ' <span>' + H5P.BasicArithmeticQuiz.tReplace(t.scoreInPercent, {percent: percent}) + '</span>');
      this.$time.html(H5P.BasicArithmeticQuiz.tReplace(t.time, {time: time}));
    };
  }
  ResultPage.prototype = Object.create(H5P.EventDispatcher.prototype);
  ResultPage.prototype.constructor = ResultPage;

  return ResultPage;
  
})(H5P.jQuery, H5P.JoubelUI);
