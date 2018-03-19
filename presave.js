var H5PPresave = H5PPresave || {};

H5PPresave['H5P.ArithmeticQuiz'] = function (content, finished) {
    var score = 0;

    if( typeof content === 'object' && content.hasOwnProperty('maxQuestions')){
        score = content.maxQuestions;
    }

    if( isNaN(score) || score < 0){
        throw {
            name: 'InvalidMaxScore Error',
            message: "Could not calculate the max score for this content. The max score is assumed to be 0. Contact your administrator if this isn’t correct."
        };
    }

    finished({maxScore: score});
};
