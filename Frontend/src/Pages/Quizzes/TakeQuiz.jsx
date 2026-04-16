import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import ApiCall from '../../util/ApiCall';

const TakeQuiz = () => {
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            const response = await ApiCall({
                url: `/quiz/${quizId}`,
                method: 'GET'
            });
            setQuiz(response.data.data);
        } catch (error) {
            console.error('Error fetching quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
                questionId,
                answer
            }));

            const response = await ApiCall({
                url: `/assessment/submit/${quizId}`,
                method: 'POST',
                data: { answers: formattedAnswers }
            });

            setResult(response.data.data);
        } catch (error) {
            console.error('Error submitting quiz:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" />
            </Container>
        );
    }

    if (!quiz) {
        return (
            <Container className="py-4">
                <Alert variant="danger">Quiz not found.</Alert>
            </Container>
        );
    }

    if (result) {
        return (
            <Container className="py-4">
                <Card>
                    <Card.Body className="text-center">
                        <h2>Quiz Results</h2>
                        <h3 className={`mt-3 ${result.passed ? 'text-success' : 'text-danger'}`}>
                            {result.passed ? 'Passed!' : 'Failed'}
                        </h3>
                        <p className="h4">Score: {result.assessment.score.toFixed(1)}%</p>
                        {result.badgeAwarded && (
                            <Alert variant="success" className="mt-3">
                                <strong>Congratulations!</strong> You've earned the "{result.badgeAwarded.name}" badge!
                            </Alert>
                        )}
                        <Button variant="primary" onClick={() => navigate('/quizzes')} className="mt-3">
                            Back to Quizzes
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Card>
                <Card.Header>
                    <h2>{quiz.title}</h2>
                    <p className="mb-0">{quiz.description}</p>
                </Card.Header>
                <Card.Body>
                    {quiz.questions.map((question, index) => (
                        <div key={question._id} className="mb-4">
                            <h5>{index + 1}. {question.questionText}</h5>
                            {question.type === 'multiple-choice' && (
                                <Form.Group>
                                    {question.options.map((option, optIndex) => (
                                        <Form.Check
                                            key={optIndex}
                                            type="radio"
                                            name={`question-${question._id}`}
                                            label={option}
                                            value={option}
                                            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                            checked={answers[question._id] === option}
                                        />
                                    ))}
                                </Form.Group>
                            )}
                            {question.type === 'true-false' && (
                                <Form.Group>
                                    <Form.Check
                                        type="radio"
                                        name={`question-${question._id}`}
                                        label="True"
                                        value="true"
                                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                        checked={answers[question._id] === 'true'}
                                    />
                                    <Form.Check
                                        type="radio"
                                        name={`question-${question._id}`}
                                        label="False"
                                        value="false"
                                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                        checked={answers[question._id] === 'false'}
                                    />
                                </Form.Group>
                            )}
                            {question.type === 'short-answer' && (
                                <Form.Group>
                                    <Form.Control
                                        type="text"
                                        placeholder="Your answer"
                                        value={answers[question._id] || ''}
                                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                    />
                                </Form.Group>
                            )}
                        </div>
                    ))}
                </Card.Body>
                <Card.Footer>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
                        className="w-100"
                    >
                        {submitting ? <Spinner animation="border" size="sm" /> : 'Submit Quiz'}
                    </Button>
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default TakeQuiz;