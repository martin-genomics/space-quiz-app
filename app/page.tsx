'use client';
import React, { useState } from 'react';

// --- Type Definitions ---

// Define the shape of an individual answer option
interface AnswerOption {
  answerText: string;
  isCorrect: boolean;
}

// Define the shape of a quiz question
interface Question {
  questionText: string;
  answerOptions: AnswerOption[];
}

// --- Main App Component ---
export default function Page() {
  // State to hold the current question index
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  // State to hold the user's score
  const [score, setScore] = useState<number>(0);
  // State to track if the quiz has ended
  const [showScore, setShowScore] = useState<boolean>(false);
  // State to track the user's selected answer for the current question
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  // State to track if an answer has been submitted for the current question
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  // State to hold the LLM-generated explanation for the correct answer
  const [explanation, setExplanation] = useState<string>('');
  // State to track if the explanation is currently being loaded
  const [isLoadingExplanation, setIsLoadingExplanation] = useState<boolean>(false);
  // State to hold dynamically generated questions
  const [dynamicQuestion, setDynamicQuestion] = useState<Question | null>(null);
  // State to track if a dynamic question is being loaded
  const [isLoadingDynamicQuestion, setIsLoadingDynamicQuestion] = useState<boolean>(false);

  // Array of quiz questions and answers (initial hardcoded questions)
  const initialQuestions: Question[] = [
    {
      questionText: 'What is the largest planet in our solar system?',
      answerOptions: [
        { answerText: 'Mars', isCorrect: false },
        { answerText: 'Jupiter', isCorrect: true },
        { answerText: 'Earth', isCorrect: false },
        { answerText: 'Saturn', isCorrect: false },
      ],
    },
    {
      questionText: 'Which galaxy is our solar system a part of?',
      answerOptions: [
        { answerText: 'Andromeda Galaxy', isCorrect: false },
        { answerText: 'Triangulum Galaxy', isCorrect: false },
        { answerText: 'Milky Way Galaxy', isCorrect: true },
        { answerText: 'Whirlpool Galaxy', isCorrect: false },
      ],
    },
    {
      questionText: 'What is the name of the first human to walk on the Moon?',
      answerOptions: [
        { answerText: 'Buzz Aldrin', isCorrect: false },
        { answerText: 'Yuri Gagarin', isCorrect: false },
        { answerText: 'Neil Armstrong', isCorrect: true },
        { answerText: 'Michael Collins', isCorrect: false },
      ],
    },
    {
      questionText: 'How many planets are in our solar system?',
      answerOptions: [
        { answerText: '7', isCorrect: false },
        { answerText: '8', isCorrect: true },
        { answerText: '9', isCorrect: false },
        { answerText: '10', isCorrect: false },
      ],
    },
    {
      questionText: 'What is a "shooting star" actually?',
      answerOptions: [
        { answerText: 'A star falling from the sky', isCorrect: false },
        { answerText: 'A comet', isCorrect: false },
        { answerText: 'A meteoroid burning up in the atmosphere', isCorrect: true },
        { answerText: 'A distant galaxy', isCorrect: false },
      ],
    },
  ];

  // Combine initial questions with a dynamic question if it exists
  const questions: Question[] = dynamicQuestion ? [...initialQuestions, dynamicQuestion] : initialQuestions;

  // Function to fetch an explanation from the Gemini API
  const fetchExplanation = async (questionText: string, correctAnswerText: string): Promise<void> => {
    setIsLoadingExplanation(true);
    setExplanation(''); // Clear previous explanation
    try {
      const chatHistory = [{ role: "user", parts: [{ text: `Explain concisely why '${correctAnswerText}' is the correct answer to the question '${questionText}'.` }] }];
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will automatically provide the API key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const text: string = result.candidates[0].content.parts[0].text;
        setExplanation(text);
      } else {
        setExplanation('Could not fetch explanation.');
      }
    } catch (error) {
      console.error('Error fetching explanation:', error);
      setExplanation('Failed to load explanation due to an error.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  // Function to generate a new space question using the Gemini API
  const generateNewQuestion = async (): Promise<void> => {
    setIsLoadingDynamicQuestion(true);
    setDynamicQuestion(null); // Clear previous dynamic question
    setShowScore(false); // Hide score screen while generating
    try {
      const chatHistory = [{
        role: "user",
        parts: [{
          text: `Generate a new, unique multiple-choice quiz question about space, with four answer options. One of the options must be correct. Provide the output in a JSON format like this:
            {
              "questionText": "Your question here?",
              "answerOptions": [
                {"answerText": "Option A", "isCorrect": false},
                {"answerText": "Option B", "isCorrect": true},
                {"answerText": "Option C", "isCorrect": false},
                {"answerText": "Option D", "isCorrect": false}
              ]
            }`
        }]
      }];

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              "questionText": { "type": "STRING" },
              "answerOptions": {
                "type": "ARRAY",
                "items": {
                  "type": "OBJECT",
                  "properties": {
                    "answerText": { "type": "STRING" },
                    "isCorrect": { "type": "BOOLEAN" }
                  },
                  "propertyOrdering": ["answerText", "isCorrect"]
                }
              }
            },
            "propertyOrdering": ["questionText", "answerOptions"]
          }
        }
      };
      const apiKey = ""; // Canvas will automatically provide the API key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const jsonString: string = result.candidates[0].content.parts[0].text;
        const newQuestion: Question = JSON.parse(jsonString);
        setDynamicQuestion(newQuestion);
        // Set currentQuestion to the new dynamic question's index (which will be the last one)
        setCurrentQuestion(initialQuestions.length);
        setScore(score); // Keep existing score if generating mid-quiz, or reset if from score screen
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
        setExplanation('');
      } else {
        console.error('Could not generate new question:', result);
      }
    } catch (error) {
      console.error('Error generating new question:', error);
    } finally {
      setIsLoadingDynamicQuestion(false);
    }
  };

  // Function to handle answer click
  const handleAnswerClick = (isCorrect: boolean, selectedOptionText: string): void => {
    setSelectedAnswer(isCorrect);
    setAnswerSubmitted(true); // Mark that an answer has been submitted

    // Find the correct answer text for the current question
    const currentQuestionData: Question = questions[currentQuestion];
    const correctAnswerOption: AnswerOption | undefined = currentQuestionData.answerOptions.find(opt => opt.isCorrect);

    if (isCorrect) {
      setScore(score + 1); // Increment score if correct
    }
    // Fetch explanation for the correct answer if it exists
    if (correctAnswerOption) {
      fetchExplanation(currentQuestionData.questionText, correctAnswerOption.answerText);
    }
  };

  // Function to move to the next question
  const handleNextQuestion = (): void => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(null); // Reset selected answer for the next question
      setAnswerSubmitted(false); // Reset submitted state
      setExplanation(''); // Clear explanation for the next question
    } else {
      setShowScore(true); // Show score if all questions are answered
      setDynamicQuestion(null); // Clear dynamic question when quiz ends
    }
  };

  // Function to restart the quiz
  const handleRestartQuiz = (): void => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setExplanation('');
    setDynamicQuestion(null); // Ensure dynamic question is cleared on restart
  };

  const currentQuestionData: Question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4 font-inter">
      <div className="bg-white  backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-lg border border-white border-opacity-20 transform transition-all duration-300 hover:scale-105"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        {isLoadingDynamicQuestion ? (
          <div className="text-center text-white text-xl animate-pulse">
            Generating a new space question...
          </div>
        ) : showScore ? (
          // Display score screen
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quiz Completed!</h2>
            <p className="text-xl md:text-2xl mb-6">
              You scored {score} out of {questions.length} correct answers.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={handleRestartQuiz}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
              >
                Restart Quiz
              </button>
              <button
                onClick={generateNewQuestion}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
              >
                ✨ Generate New Question
              </button>
            </div>
          </div>
        ) : (
          // Display current question
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="text-sm font-semibold text-white text-opacity-80 mb-2">
                Question {currentQuestion + 1}/{questions.length}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-4">
                {currentQuestionData.questionText}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {currentQuestionData.answerOptions.map((answerOption: AnswerOption, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(answerOption.isCorrect, answerOption.answerText)}
                  disabled={answerSubmitted} // Disable buttons after an answer is submitted
                  className={`
                    w-full text-left p-4 rounded-xl text-lg
                    ${answerSubmitted ? (
                      answerOption.isCorrect
                        ? 'bg-green-600 text-white' // Correct answer when submitted
                        : selectedAnswer !== null && !answerOption.isCorrect && selectedAnswer === false && (
                          (answerOption.answerText === currentQuestionData.answerOptions.find(opt => opt.isCorrect)?.answerText)
                            ? 'bg-green-600 text-white' // Show correct answer if selected answer was wrong
                            : (answerOption.answerText === currentQuestionData.answerOptions[index].answerText && !answerOption.isCorrect && selectedAnswer === false)
                              ? 'bg-red-600 text-white' // Show selected incorrect answer
                              : 'bg-white bg-opacity-5 text-white text-opacity-80' // Default for other options
                        )
                    ) : 'bg-white bg-opacity-5 hover:bg-green-400 text-white text-opacity-80 cursor-pointer'}
                    font-medium transition-all duration-200 ease-in-out transform
                    ${answerSubmitted ? 'opacity-80' : 'hover:scale-[1.02] active:scale-[0.98]'}
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75
                  `}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >

                  {answerOption.answerText}
                </button>
              ))}
            </div>
            {answerSubmitted && (
              <div className="mt-6">
                {isLoadingExplanation ? (
                  <div className="text-center text-white text-sm animate-pulse">
                    Loading explanation...
                  </div>
                ) : (
                  explanation && (
                    <div className="bg-white bg-opacity-15 p-4 rounded-xl text-white text-opacity-90 text-sm mb-4"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <h4 className="font-bold text-base mb-2">Explanation:</h4>
                      <p>{explanation}</p>
                    </div>
                  )
                )}
                <button
                  onClick={handleNextQuestion}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 self-end"
                >
                  {currentQuestion + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
};