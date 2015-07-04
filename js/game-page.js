/**
 * Defines the H5P.BasicArithmeticQuiz.GamePage class
 */
H5P.BasicArithmeticQuiz.GamePage = (function ($, UI) {

  /**
   * Enum defining the different arithmetic types
   * @readonly
   * @enum {string}
   */
  var ArithmeticType = {
    ADDITION: 'addition',
    SUBTRACTION: 'subtraction',
    MULTIPLICATION: 'multiplication',
    DIVISION: 'division'
  };


  /**
   * Helper for creating quiz content for the different arithmetic types
   *
   * @class
   * @private
   * @param  {type} type Arithmetic type
   */
  function Arithmeticator(type) {

    /**
     * Create the content of a quiz. Randomizes the questions, and makes sure
     * the maxQuestions parameter is taken into account
     *
     * @param  {number} maxQuestions Maximum numver of questions
     * @return {array}              description
     */
    this.createQuiz = function (maxQuestions) {
      var questions = [];
      var i,j;

      switch (type) {
        case ArithmeticType.DIVISION:
        case ArithmeticType.MULTIPLICATION:
          for (i=0; i<10; i++) {
            for (j=0; j<10; j++) {
              questions.push(this.createQuestion(type === ArithmeticType.DIVISION ? i*j : i, j));
            }
          }
          break;
        case ArithmeticType.ADDITION:
        case ArithmeticType.SUBTRACTION:
          for (i=100; i>=0; i--) {
            for (j=i; j>=0; j--) {
              questions.push(this.createQuestion(type === ArithmeticType.ADDITION ? i-j : i, j));
            }
          }
          break;
      }

      // Let's shuffle
      questions = H5P.shuffleArray(questions);

      return questions.length > maxQuestions ? questions.slice(0, maxQuestions) : questions;
    };


    /**
     * Creates a single question and it's correct answer
     *
     * @param  {type} x description
     * @param  {type} y description
     * @return {Object} question An object containing the question and correct answer
     * @return {string} question.q The question
     * @return {number} question.correct The correct answer
     */
    this.createQuestion = function (x, y) {
      switch (type) {
        case ArithmeticType.ADDITION:
          return { q: x + " + " + y, correct: x + y} ;
        case ArithmeticType.SUBTRACTION:
          return { q: x + " - " + y, correct: x - y} ;
        case ArithmeticType.MULTIPLICATION:
          return { q: x + " x " + y, correct: x * y} ;
        case ArithmeticType.DIVISION:
          return { q: x + " / " + y, correct: x / y} ;
        default:
          return {};
      }
    };
  }


  /**
   * Creates a new GamePage instance
   *
   * @class
   * @augments H5P.EventDispatcher
   * @namespace H5P
   * @param  {arithmeticType} type
   * @param  {number} maxQuestions Maximum number of questions
   * @param  {Object} t Object containing translation texts
   * @fires H5P.XAPIEvent
   */
  function GamePage(type, maxQuestions, t) {
    H5P.EventDispatcher.call(this);

    var self = this;
    self.type = type;
    self.maxQuestions = maxQuestions;

    self.$gamepage = $('<div>', {
      'class': 'h5p-baq-game'
    });

    /*self.gridResultsView = new GridResultsView(10,10);
    self.gridResultsView.appendTo(self.$gamepage);
    self.gridResultsView.getCell(5, 5).css({'background': 'blue'});*/

    self.arithmeticator = new Arithmeticator(self.type);
    self.score = 0;
    self.scoreWidget = new ScoreWidget(t);
    self.scoreWidget.appendTo(self.$gamepage);

    self.timer = new H5P.BasicArithmeticQuiz.TimerWidget(t);
    self.timer.appendTo(self.$gamepage);

    self.slider = UI.createSlider();

    self.countdownWidget = new H5P.BasicArithmeticQuiz.CountdownWidget(4, t);
    self.slider.addSlide(self.countdownWidget.create());
    self.countdownWidget.on('ignition', function () {
      self.slider.next();
      self.timer.start();
    });

    // Shuffle quizzes:
    self.quizzes = self.arithmeticator.createQuiz(self.maxQuestions);

    var numQuestions = self.quizzes.length;
    for (var i = 0; i < numQuestions; i++) {
      self.slider.addSlide(self.createSlide(self.quizzes[i]));
    }

    // Add result page:
    self.resultPage = new H5P.BasicArithmeticQuiz.ResultPage(numQuestions, t);
    self.slider.addSlide(self.resultPage.create());

    self.resultPage.on('retry', function () {
      self.reset();
      self.slider.first();
    });

    self.slider.on('last-slide', function () {
      self.resultPage.update(self.score, self.timer.pause());
      self.$gamepage.addClass('result-page');
      self.triggerXAPICompleted(self.score, numQuestions);
    });

    self.slider.on('first-slide', function () {
      self.$gamepage.removeClass('result-page');
    });

    self.slider.on('move', function () {
      setTimeout(function () {
        self.resize();
      }, 0);
    });

    self.slider.attach(self.$gamepage);
    setTimeout(function () {
      self.resize();
    },0);
  }
  GamePage.prototype = Object.create(H5P.EventDispatcher.prototype);
  GamePage.prototype.constructor = GamePage;


  /**
   * Starts the countdown
   */
  GamePage.prototype.startCountdown = function () {
    this.countdownWidget.start();
  };


  /**
   * Handles resizing
   */
  GamePage.prototype.resize = function() {
    this.$gamepage.find('.h5p-baq-alternatives:visible').each(function () {
      var $alternatives = $(this);

      var scaleDown = $alternatives.position().top + $alternatives.height() > $alternatives.parent().height();
      var parentHeight = $alternatives.parent().height();
      var fontSize = parseInt($alternatives.css('fontSize'));
      fontSize = fontSize || 42;


      if (scaleDown) {
        while (fontSize > 10 && $alternatives.position().top + $alternatives.outerHeight() > parentHeight) {
          fontSize -= fontSize * 0.05;
          $alternatives.css({'font-size': fontSize + 'px'});
        }
      }
      else {
        var lastStep;
        while (fontSize < 100 && $alternatives.position().top + $alternatives.outerHeight() < parentHeight) {
          lastStep = fontSize * 0.05;
          fontSize += lastStep;
          $alternatives.css({'font-size': fontSize + 'px'});
        }

        $alternatives.css({'font-size': (fontSize - lastStep) + 'px'});
      }
    });
  };


  /**
   * Resets quiz
   */
  GamePage.prototype.reset = function () {
    this.score = 0;
    this.scoreWidget.update(0);
    this.timer.reset();
    this.$gamepage.find('.reveal-wrong').removeClass('reveal-wrong');
    this.$gamepage.find('.reveal-correct').removeClass('reveal-correct');
    this.countdownWidget.restart();
  };


  /**
   * Creates a question slide
   *
   * @param  {Object} question
   * @param  {string} question.q The question
   * @param  {number} question.correct The correct answer
   * @return {H5P.jQuery} The jquery dom element generated
   */
  GamePage.prototype.createSlide = function (question) {
    var self = this;

    var $slide = $('<div>', {
      'class': 'question-page'
    });

    var $question = $('<div>', {
      'class': 'question',
      text: question.q + ' = ?'
    }).appendTo($slide);

    var $alternatives = $('<div>', {
      'class': 'h5p-baq-alternatives'
    });

    var start = question.correct-3;
    start = start >= 0 ? start : 0;
    var alternatives = [];
    for (var k = start; k < start+6; k++) {
      alternatives.push(new Alternative(k, k===question.correct));
    }
    alternatives = H5P.shuffleArray(alternatives);
    alternatives.forEach(function (alternative) {
      alternative.appendTo($alternatives);
      alternative.on('answered', function () {

        // Can't play it after the transition end is received, since this is not
        // accepted on iPad. Therefore we are playing it here with a delay instead
        H5P.BasicArithmeticQuiz.SoundEffects.play(alternative.correct ? 'positive-short' : 'negative-short', 300);

        if (alternative.correct === true) {
          self.score++;
          self.scoreWidget.update(self.score);
        }

        alternatives.forEach(function (alt) {
          alt.reveal();
        });
        setTimeout(function(){
          self.slider.next();
        }, 800);
      });
    });

    $alternatives.appendTo($slide);
    return $slide;
  };


  /**
   * Append game page to container
   *
   * @param  {H5P.jQuery} $container
   */
  GamePage.prototype.appendTo = function ($container) {
    this.$gamepage.appendTo($container);
  };

  /**
   * Creates a ScoreWidget instance
   *
   * @class
   * @private
   * @param  {Object} t Translation object
   */
  function ScoreWidget(t) {

    var $score = $('<span>', {
      'class': 'h5p-baq-score-widget-number',
      html: 0
    });

    this.$scoreWidget = $('<div>', {
      'class': 'h5p-baq-score-widget',
      html: t.score + ' '
    }).append($score);

    this.scoreElement = $score.get(0);

    this.appendTo = function ($container) {
      this.$scoreWidget.appendTo($container);

      new Odometer({
        el: this.scoreElement
      });
    };

    this.update = function (score) {
      this.scoreElement.innerHTML = score;
    };
  }


  /**
   * Creates an Alternative button instance
   *
   * @class
   * @private
   * @augments H5P.EventDispatcher
   * @fires H5P.Event
   * @param  {number} number Number on button
   * @param  {bool} correct Correct or not
   */
  function Alternative(number, correct) {
    H5P.EventDispatcher.call(this);
    var self = this;

    self.number = number;
    self.correct = correct;

    this.$button = UI.createButton({
      text: number,
      click: function () {
        self.trigger('answered');
      }
    });

    this.reveal = function () {
      this.$button.addClass(this.correct ? 'reveal-correct' : 'reveal-wrong');
    };

    this.appendTo = function ($container) {
      this.$button.appendTo($container);
      return this;
    };
  }
  Alternative.prototype = Object.create(H5P.EventDispatcher.prototype);
  Alternative.prototype.constructor = Alternative;

  return GamePage;

})(H5P.jQuery, H5P.JoubelUI);

/*function GridResultsView(rows, cols) {
  var $grid = $('<table>', {
    'class': 'h5p-baq-grid-results',
    cellspacing: 0,
    cellpadding: 0,
    'border-collapse': 'collapse'
  });

  for (var i = 0; i < rows; i++) {
    var $tr = $('<tr>');
    for (var j = 0; j < rows; j++) {
      $tr.append($('<td>'));
    }
    $grid.append($tr);
  }

  this.appendTo = function ($container) {
    $grid.appendTo($container);
  }

  this.getCell = function (row, col) {
    return $grid.find('tr:nth-child('+row+')').find('td:nth-child('+col+')');
  }
}*/
