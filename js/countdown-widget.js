/**
 * Defines the H5P.BasicArithmeticQuiz.CountdownWidget class
 */
H5P.BasicArithmeticQuiz.CountdownWidget = (function ($) {

  /**
   * A count down widget
   *
   * @class
   * @augments H5P.EventDispatcher
   * @namespace H5P.BasicArithmeticQuiz
   * @fires H5P.Event
   *
   * @param  {type} seconds Number of seconds to count down
   */
  function CountdownWidget(seconds, t) {
    H5P.EventDispatcher.call(this);
    var originalSeconds = seconds;

    this.$countdownWidget = $('<div>', {
      'class': 'h5p-baq-countdown',
    }).append($('<div>', {
      'class': 'h5p-baq-countdown-inner',
    }).append($('<span>', {
      'class': 'h5p-baq-countdown-text',
      text: seconds
    }), $('<span>', {
      'class': 'h5p-baq-countdown-bg'
    })));

    /**
     * Returns reference to DOM object
     *
     * @return {H5P.jQuery}
     */
    this.create = function () {
      return this.$countdownWidget;
    };


    /**
     * Start countdown
     */
    this.start = function () {
      var self = this;

      if (!self.$countdownWidget.find('.h5p-baq-countdown-bg').hasClass('fuel')) {
        setTimeout(function(){
          self.$countdownWidget.find('.h5p-baq-countdown-bg').addClass('fuel');
        },1);
      }

      if (seconds <= 0) {
        self.trigger('ignition');
        return;
      }

      self.decrement();

      setTimeout(function(){
        self.start();
      }, 1000);
    };


    /**
     * Restart the countdown
     */
    this.restart = function () {
      var self = this;
      seconds = originalSeconds+1;
      self.decrement();
      self.$countdownWidget.find('.h5p-baq-countdown-bg').removeClass('fuel');
      setTimeout(function () {
        self.start();
      }, 600);
    };


    /**
     * Decrement counter
     */
    this.decrement = function () {
      seconds--;
      this.$countdownWidget.find('.h5p-baq-countdown-text').text(seconds === 0 ? t.go : seconds);
    };
  }
  CountdownWidget.prototype = Object.create(H5P.EventDispatcher.prototype);
  CountdownWidget.prototype.constructor = CountdownWidget;

  return CountdownWidget;

})(H5P.jQuery);
