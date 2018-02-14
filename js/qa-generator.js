/**
 * Defines the H5P.ArithmeticQuiz.QuestionsGenerator class
 */
H5P.ArithmeticQuiz.QuestionsGenerator = (function (ArithmeticType, EquationType) {
  var unknown = ["x", "y", "z", "a", "b"];
  var Fraction = algebra.Fraction;
  var Expression = algebra.Expression;
  var Equation = algebra.Equation;

  // Helper functions for creating wrong alternatives
  function add (question, param) {
    return question.correct + param;
  }
  function subtract (question, param) {
    return question.correct - param;
  }
  function randomInt (question) {
    // Creates random number between correct-10 and correct+10:
    return (question.correct - 10) + Math.floor(Math.random() * 20);
  }
  function randomNum (min = 1, max = 7) {
    // Creates random number between min and max:
    var num = Math.floor(Math.random()*(max-min+1)+min);
    if (num === 0) {
      num = randomNum(min, max);
    }
    return num;
  } 
  function multiply (question, param) {
    if (Math.random() > 0.5) {
      return (question.x+param) * question.y;
    }
    else {
      return (question.y+param) * question.x;
    }
  }
  function divide (question, param) {
    if (Math.random() > 0.5) {
      return Math.floor((question.x + param) / question.y);
    }
    else {
      return Math.floor(question.x / (question.y + param));
    }
  }

  // 
  /**
   * Do a random operation on equation expression
   * @method randomOperation
   * @param  {operations}  array of operations to choose from randomly
   * @param  {expr}  algebra.js expression
   * @param  {useFractions}  use fractions as number
   */
  function randomOperation(operations, expr, useFractions) {
    // get a random operation
    var operation = operations[Math.floor(Math.random() * operations.length)];
    var number = randomNum(1, 7);
    switch (operation) {
      case "/":
        if (number > 0) {
          expr = expr.divide(number);
        }
        break;
      case "*":
        expr = expr.multiply(number);
        break;
      case "+":
        if (useFractions === true) {
          number = new Fraction(randomNum(1, 7), randomNum(3, 7));
        }
        expr = expr.add(number);
        break;
      case "-":
        if (useFractions === true) {
          number = new Fraction(randomNum(1, 7), randomNum(3, 7));
        }
        expr = expr.subtract(number);
        break;
    }
    return expr;
  }

  /**
   * Generates equation type for a question
   * @method generateEquation
   * @param  {item}  variable name of expression
   * @param  {expr}  algebra.js expression
   * @param  {equationType}  type of equation (basic, intermediate, advanced)
   * @param  {useFractions}  use fractions as number
   */
  function generateEquation(item, type, equationType, useFractions) {
    var equation = undefined;
    var solution = undefined;
    var number1 = undefined;
    var operations = undefined;
    
    number1 = randomNum();

    if (useFractions === true) {
      number1 = new Fraction(randomNum(), randomNum(3, 7));
    }

    var expression1 = new Expression(item);
    var expression2 = new Expression(item);

    switch (equationType) {
      case EquationType.BASIC:
        // [ 3x = 12 ]
        expression1 = expression1.multiply(randomNum());
        equation = new Equation(expression1, number1);
        break;
      case EquationType.INTERMEDIATE:
        // [ 4x - 3 = 13 ]
        operations = ["+", "-"];
        expression1 = randomOperation(operations, expression1, useFractions);
        expression1 = expression1.multiply(randomNum(1, 3));
        equation = new Equation(expression1, number1);
        break;
      case EquationType.ADVANCED:
        // [ 5x + 3 = 3x + 15 ]
        operations = ["+", "-"];
        // expression1 = expression1.multiply(item); // Quadratic equations ..
        expression1 = randomOperation(operations, expression1, useFractions);
        expression2 = randomOperation(operations, expression2, useFractions);
        expression1 = expression1.multiply(randomNum());
        expression2 = expression2.multiply(randomNum());
        expression1 = expression1.simplify();
        expression2 = expression2.simplify();
        equation = new Equation(expression1, expression2);
        break;
    }
    try {
      solution = equation.solveFor(item);
    } catch(err) {
      equation = generateEquation(item, type, equationType, useFractions);
      solution = equation.solveFor(item);
    }          
    if ( (solution.toString() === "0") || (solution.toString() === "1")) {
      // rebuild
      equation = generateEquation(item, type, equationType, useFractions);
    }

    return equation;
  }

  /**
   * The alternative generator setup for the different arithmetic types
   * @type {Object}
   */
  var alternativesSetup = {};
  alternativesSetup[ArithmeticType.SUBTRACTION] = alternativesSetup[ArithmeticType.ADDITION] = [
    { weight: 0.15, type: add, param: 10 },
    { weight: 0.15, type: subtract, param: 10 },
    { weight: 0.15, type: add, param: 1 },
    { weight: 0.15, type: subtract, param: 1 },
    { weight: 0.15, type: add, param: 2 },
    { weight: 0.15, type: subtract, param: 2 },
    { weight: 0.10, type: randomInt }
  ];
  alternativesSetup[ArithmeticType.MULTIPLICATION] = [
    { weight: 0.15, type: add, param: 10 },
    { weight: 0.15, type: subtract, param: 10 },
    { weight: 0.15, type: add, param: 1 },
    { weight: 0.15, type: subtract, param: 1 },
    { weight: 0.15, type: multiply, param: 1 },
    { weight: 0.15, type: multiply, param: -1 },
    { weight: 0.10, type: randomInt }
  ];
  alternativesSetup[ArithmeticType.DIVISION] = [
    { weight: 0.15, type: add, param: 10 },
    { weight: 0.15, type: subtract, param: 10 },
    { weight: 0.15, type: add, param: 1 },
    { weight: 0.15, type: subtract, param: 1 },
    { weight: 0.15, type: divide, param: 1 },
    { weight: 0.15, type: divide, param: -1 },
    { weight: 0.10, type: randomInt }
  ];

  /**
   * Utility function that picks a alternative setup based on the weight
   * @method getRandomWeightedAlternativeSetup
   * @param  {H5P.ArithmeticQuiz.ArithmeticType} type
   * @return {Object}
   */
  function getRandomWeightedAlternativeSetup (type) {
    var setups = alternativesSetup[type];

    var i;
    var sum = 0;
    var r = Math.random();
    for (i in setups) {
      sum += setups[i].weight;
      if (r <= sum) {
        return setups[i];
      }
    }

    return setups[0];
  }

  /**
   * Questions generator classes
   * @method QuestionsGenerator
   * @constructor
   * @param  {H5P.ArithmeticQuiz.ArithmeticType}   type
   * @param  {H5P.ArithmeticQuiz.EquationType}   equationType
   * @param  {number}           maxQuestions
   * @param  {boolean}          use fractions in equations
   */
  function QuestionsGenerator(type, equationType, maxQuestions, useFractions) {
    var self = this;
    var questions = [];
    var i, j;

    /**
     * Generates alternative for a question
     * @method generateAlternatives
     * @param  {Object}             question
     */
    function generateAlternatives(question) {
      question.alternatives = [];

      // Generate 5 wrong ones:
      while (question.alternatives.length !== 5) {
        var setup = getRandomWeightedAlternativeSetup(type);
        var alternative = setup.type(question, setup.param);
        // check if alternative is present allready and is not the correct one and is not negative number
        if (alternative !== question.correct && question.alternatives.indexOf(alternative) === -1 && alternative >= 0 && alternative <= 100) {
          question.alternatives.push(alternative);
        }
      }

      // Add correct one
      question.alternatives.push(question.correct);

      // Shuffle alternatives:
      question.alternatives = H5P.shuffleArray(question.alternatives);
    }

    /**
     * Generates alternative for a question
     * @method generateAlternatives
     * @param  {Object}             question
     * @param  {H5P.ArithmeticQuiz.EquationType}   equation type
     * @param  {boolean}          use fractions in equations
     */
    function generateEquationAlternatives(question, equationType, useFractions) {
      question.alternatives = [];
      var equation = undefined;
      // Generate 5 wrong ones:
      while (question.alternatives.length !== 5) {
        equation = generateEquation(question.variable, question.type, equationType, useFractions);
        var solution = equation.solveFor(question.variable).toString();
        
        // check if alternative is present already and is not the correct one
        if (solution !== question.correct && question.alternatives.indexOf(solution) === -1) {
          question.alternatives.push(solution);
        }
      }

      // Add correct one
      question.alternatives.push(question.correct);

      // Shuffle alternatives:
      question.alternatives = H5P.shuffleArray(question.alternatives);
    }
 
    /**
     * Creates textual representation for question
     * @method createTextualQuestion
     * @param  {Object}              question Question Object
     * @return {string}
     */
    function createTextualQuestion(question) {
      switch (type) {
        case ArithmeticType.ADDITION:
          return question.x + " + " + question.y;
        case ArithmeticType.SUBTRACTION:
          return question.x + " − " + question.y;
        case ArithmeticType.MULTIPLICATION:
          return question.x + " × " + question.y;
        case ArithmeticType.DIVISION:
          return question.x + " ÷ " + question.y;
        default:
          return '';
      }
    }

    // Generate questions or equations
    if (equationType !== undefined) {
      // Generate equations
      for (i=50; i>=0; i--) {
        for (j=i; j>=0; j--) {
          var item = unknown[Math.floor(Math.random()*unknown.length)];
          var equation = generateEquation(item, type, equationType, useFractions);
          var solution = equation.solveFor(item);
          questions.push({
            variable: item,
            expression: equation.toString(),
            correct: solution.toString(),
            textual: equation.toString(),
          });
        }
      }
    
    } else {
      // Generate questions
      switch (type) {
        case ArithmeticType.DIVISION:
        case ArithmeticType.MULTIPLICATION:
          for (i=1; i<10; i++) {
            for (j=1; j<10; j++) {
              questions.push({
                x:  type === ArithmeticType.DIVISION ? i * j : i,
                y: j,
                correct: type === ArithmeticType.DIVISION ? (i * j) / j : i * j
              });
            }
          }
          break;
        case ArithmeticType.ADDITION:
        case ArithmeticType.SUBTRACTION:
          for (i=100; i>=0; i--) {
            for (j=i; j>=0; j--) {
              questions.push({
                x: type === ArithmeticType.ADDITION ? i - j : i,
                y: j,
                correct: type === ArithmeticType.ADDITION ? i : i - j
              });
            }
          }
          break;
      }
    }

    // Let's shuffle
    questions = H5P.shuffleArray(questions);

    if (questions.length > maxQuestions) {
      questions = questions.slice(0, maxQuestions);
    }

    // Create alternatives
    for (i = 0; i < questions.length; i++) {
      if (equationType !== undefined) {
        generateEquationAlternatives(questions[i], equationType, useFractions);
      } else {
        generateAlternatives(questions[i]);
        questions[i].textual = createTextualQuestion(questions[i]);
      }
    }

    /**
     * Returns the questions including alternatives and textual representation
     * @public
     * @return {array}
     */
    self.get = function () {
      return questions;
    };
  }

  return QuestionsGenerator;
}(H5P.ArithmeticQuiz.ArithmeticType, H5P.ArithmeticQuiz.EquationType));