/**
 * Defines the H5P.BasicArithmeticQuiz.GamePage class
 */
H5P.BasicArithmeticQuiz.GamePage = (function ($, UI, ArithmeticType, QuestionsGenerator) {

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
    self.sliding = false;

    self.$gamepage = $('<div>', {
      'class': 'h5p-baq-game counting-down'
    });

    self.questionsGenerator = new QuestionsGenerator(self.type, self.maxQuestions);
    self.score = 0;
    self.scoreWidget = new ScoreWidget(t);
    self.scoreWidget.appendTo(self.$gamepage);

    self.timer = new H5P.BasicArithmeticQuiz.TimerWidget(t);
    self.timer.appendTo(self.$gamepage);

    self.slider = UI.createSlider();

    self.countdownWidget = new H5P.BasicArithmeticQuiz.CountdownWidget(4, t);
    self.slider.addSlide(self.countdownWidget.create());
    self.countdownWidget.on('ignition', function () {
      self.$gamepage.removeClass('counting-down');
      self.progressbar.setProgress(0);
      self.slider.next();
      self.timer.start();
      self.setActivityStarted();
    });

    // Shuffle quizzes:
    self.quizzes = self.questionsGenerator.get();

    var numQuestions = self.quizzes.length;
    for (var i = 0; i < numQuestions; i++) {
      self.slider.addSlide(self.createSlide(self.quizzes[i]));
    }

    // Create progressbar
    self.progressbar = UI.createProgressbar(numQuestions);
    self.progressbar.appendTo(self.$gamepage);

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
      self.progressbar.next();
    });

    self.slider.on('moved', function () {
      self.sliding = false;
    });

    self.slider.attach(self.$gamepage);
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
   * Resets quiz
   */
  GamePage.prototype.reset = function () {
    this.score = 0;
    this.scoreWidget.update(0);
    this.timer.reset();
    this.$gamepage.find('.reveal-wrong').removeClass('reveal-wrong');
    this.$gamepage.find('.reveal-correct').removeClass('reveal-correct');
    this.$gamepage.addClass('counting-down');
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
      text: question.textual + ' = ?'
    }).appendTo($slide);

    var $alternatives = $('<div>', {
      'class': 'h5p-baq-alternatives'
    });

    var alternatives = [];
    for (var k = 0; k < question.alternatives.length; k++) {
      alternatives.push(new Alternative(question.alternatives[k], question.alternatives[k]===question.correct));
    }
    alternatives.forEach(function (alternative) {
      alternative.appendTo($alternatives);
      alternative.on('answered', function () {

        // Ignore clicks if in the middle of something else:
        if (self.sliding) {
          return;
        }
        self.sliding = true;

        self.triggerXAPI('interacted');

        // Can't play it after the transition end is received, since this is not
        // accepted on iPad. Therefore we are playing it here with a delay instead
        H5P.BasicArithmeticQuiz.SoundEffects.play(alternative.correct ? 'positive-short' : 'negative-short', 300);

        if (alternative.correct) {
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

})(H5P.jQuery, H5P.JoubelUI, H5P.BasicArithmeticQuiz.ArithmeticType, H5P.BasicArithmeticQuiz.QuestionsGenerator);

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
