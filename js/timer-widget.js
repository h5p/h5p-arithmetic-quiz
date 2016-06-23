H5P.ArithmeticQuiz.TimerWidget = (function ($) {

  /**
   * Creates a TimerWidget instance
   *
   * @class
   * @namespace H5P.ArithmeticQuiz
   *
   * @param  {type} t Translation object
   */
  function TimerWidget(t) {
    var self = this;

    var totalTime = 0;
    var isRunning = false;
    var timer;
    var startTime = 0;

    var $timer = $('<div>', {
      'class': 'timer',
      'tabindex': '0',
      text: H5P.ArithmeticQuiz.tReplace(t.time, {time: '00:00'})
    });


    /**
     * Humanize time
     *
     * @private
     * @param  {type} seconds Number of seconds to humanize
     * @return {string}       The humanized time
     */
    var humanizeTime = function (seconds) {
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);

      minutes = minutes % 60;
      seconds = Math.floor(seconds % 60);

      var time = '';

      if (hours !== 0) {
        time += hours + ':';

        if (minutes < 10) {
          time += '0';
        }
      }

      if (minutes < 10) {
        time += '0';
      }

      time += minutes + ':';

      if (seconds < 10) {
        time += '0';
      }

      time += seconds;

      return time;
    };


    /**
     * Calculate running time
     *
     * @private
     * @return {number} Running time in seconds
     */
    var getTime = function () {
      return totalTime + (isRunning ? new Date().getTime() - startTime : 0);
    };


    /**
     * Update UI
     *
     * @private
     */
    var update = function () {
      $timer.text(H5P.ArithmeticQuiz.tReplace(t.time, {time: humanizeTime(getTime()/1000)}));

      timer = setTimeout(function(){
        update();
      }, 1000);
    };


    /**
     * Append me to something
     *
     * @param  {H5P.jQuery} $container
     */
    this.appendTo = function ($container) {
      $timer.appendTo($container);
    };


    /**
     * Start the timer
     */
    this.start = function () {
      isRunning = true;
      clearTimeout(timer);
      startTime = new Date().getTime();
      update();
    };


    /**
     * Pause the timer
     *
     * @return {string} The humanized time
     */
    this.pause = function () {
      isRunning = false;
      totalTime += new Date().getTime() - startTime;
      clearTimeout(timer);
      update();

      return humanizeTime(getTime()/1000);
    };


    /**
     * Reset timer
     */
    this.reset = function () {
      clearTimeout(timer);
      isRunning = false;
      totalTime = 0;
      startTime = 0;
      update();
    };


    /**
     * Restart timer
     */
    this.restart = function () {
      this.reset();
      this.start();
    };
  }

  return TimerWidget;

})(H5P.jQuery);
