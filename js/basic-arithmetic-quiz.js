var H5P = H5P || {};

/**
 * Defines the H5P.BasicArithmeticQuiz class
 */
H5P.BasicArithmeticQuiz = (function ($, UI) {

  /**
   * Creates a new BasicArithmeticQuiz instance
   *
   * @class
   * @augments H5P.EventDispatcher
   * @namespace H5P
   * @param {Object} options
   * @param {number} id
   */
  function BasicArithmeticQuiz(options, id) {
    H5P.EventDispatcher.call(this);

    var self = this;
    // Extend defaults with provided options
    self.options = $.extend(true, {}, {
      intro: '',
      arithmeticType: 'addition',
      maxQuestions: undefined,
      UI: {
        score: 'Score @score',
        scoreOnResultPage: 'Score: @score / @maxScore',
        scoreInPercent: '(@percent% correct)',
        time: 'Time: @time',
        resultPageHeader: 'Finished!',
        retryButton: 'Retry',
        startButton: 'Start',
        go: 'GO!'
      }
    }, options);
    self.currentWidth = 0;

    self.gamePage = new H5P.BasicArithmeticQuiz.GamePage(self.options.arithmeticType, self.options.maxQuestions, self.options.UI);

    self.introPage = new H5P.BasicArithmeticQuiz.IntroPage(self.options.intro, self.options.UI);
    self.introPage.on('start-game', function(){
      self.introPage.remove();
      self.gamePage.appendTo(self.$container);
      self.gamePage.startCountdown();
    });

    self.on('resize', function() {
      var width = self.$container.width();
      if (width !== self.currentWidth) {
        self.$container.css({
          height: width * 0.6 + 'px'
        });
        self.currentWidth = width;
      }
      self.gamePage.resize();
    });

    /**
     * Attach function called by H5P framework to insert H5P content into page
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function ($container) {
      if (this.$container === undefined) {
        this.$container = $container;
        this.addFont();
        this.$container.addClass('h5p-baq');
        this.introPage.appendTo($container);

        setTimeout(function () {
          H5P.BasicArithmeticQuiz.SoundEffects.setup();
        },1);
      }
    };

    /**
     * Adds fonts from google
     */
    self.addFont = function () {
      window.WebFontConfig = {
        google: { families: [ 'Lato::latin' ] }
      };

      var wf = document.createElement('script');
      wf.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
    };
  }
  // Extends the event dispatcher
  BasicArithmeticQuiz.prototype = Object.create(H5P.EventDispatcher.prototype);
  BasicArithmeticQuiz.prototype.constructor = BasicArithmeticQuiz;


  /**
   * Replaces placeholders in translatables texts
   *
   * @static
   * @param  {type} text description
   * @param  {type} vars description
   * @return {type}      description
   */
  BasicArithmeticQuiz.tReplace = function (text, vars) {
    for (var placeholder in vars) {
      text = text.replace('@'+placeholder, vars[placeholder]);
    }
    return text;
  };

  return BasicArithmeticQuiz;
})(H5P.jQuery, H5P.JoubelUI);
