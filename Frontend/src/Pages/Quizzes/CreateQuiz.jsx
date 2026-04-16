import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../util/UserContext';
import ApiCall from '../../util/ApiCall';

const CreateQuiz = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userBadges, setUserBadges] = useState([]);
    const [quizData, setQuizData] = useState({
        title: '',
        skill: '',
        description: '',
        passingScore: 70,
        questions: [
            {
                questionText: '',
                type: 'multiple-choice',
                options: ['', '', '', ''],
                correctAnswer: ''
            }
        ]
    });

    useEffect(() => {
        if (user) {
            fetchUserBadges();
        }
    }, [user]);

    const fetchUserBadges = async () => {
        try {
            const response = await ApiCall({
                url: `/user/registered/getDetails/${user.username}`,
                method: 'GET'
            });
            setUserBadges(response.data.data.badges || []);
        } catch (error) {
            console.error('Error fetching user badges:', error);
        }
    };

    const handleQuizChange = (field, value) => {
        setQuizData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...quizData.questions];
        updatedQuestions[index][field] = value;
        setQuizData(prev => ({
            ...prev,
            questions: updatedQuestions
        }));
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const updatedQuestions = [...quizData.questions];
        updatedQuestions[questionIndex].options[optionIndex] = value;
        setQuizData(prev => ({
            ...prev,
            questions: updatedQuestions
        }));
    };

    const addQuestion = () => {
        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, {
                questionText: '',
                type: 'multiple-choice',
                options: ['', '', '', ''],
                correctAnswer: ''
            }]
        }));
    };

    const removeQuestion = (index) => {
        if (quizData.questions.length > 1) {
            setQuizData(prev => ({
                ...prev,
                questions: prev.questions.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate quiz data
            if (!quizData.title || !quizData.skill || !quizData.questions.length) {
                throw new Error('Please fill in all required fields');
            }

            // Validate questions
            for (let i = 0; i < quizData.questions.length; i++) {
                const q = quizData.questions[i];
                if (!q.questionText || !q.correctAnswer) {
                    throw new Error(`Question ${i + 1} is incomplete`);
                }
                if (q.type === 'multiple-choice' && q.options.some(opt => !opt)) {
                    throw new Error(`Question ${i + 1} has incomplete options`);
                }
            }

            await ApiCall({
                url: '/quiz',
                method: 'POST',
                data: quizData
            });

            navigate('/quizzes');
        } catch (error) {
            console.error('Error creating quiz:', error);
            alert(error.message || 'Error creating quiz');
        } finally {
            setLoading(false);
        }
    };

    const canCreateQuiz = userBadges.some(badge =>
        badge.skill === quizData.skill && badge.name.toLowerCase().includes('expert')
    ) || user?.isAdmin;

    return (
        <Container className="py-4">
            <Card>
                <Card.Header>
                    <h2>Create Skill Assessment Quiz</h2>
                </Card.Header>
                <Card.Body>
                    {!canCreateQuiz && quizData.skill && (
                        <Alert variant="warning">
                            You need expert certification in "{quizData.skill}" or admin privileges to create quizzes for this skill.
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Quiz Title *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={quizData.title}
                                        onChange={(e) => handleQuizChange('title', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Skill *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={quizData.skill}
                                        onChange={(e) => handleQuizChange('skill', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={quizData.description}
                                onChange={(e) => handleQuizChange('description', e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Passing Score (%)</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                max="100"
                                value={quizData.passingScore}
                                onChange={(e) => handleQuizChange('passingScore', parseInt(e.target.value))}
                            />
                        </Form.Group>

                        <h4 className="mb-3">Questions</h4>

                        {quizData.questions.map((question, qIndex) => (
                            <Card key={qIndex} className="mb-3">
                                <Card.Body>
                                    <Row className="mb-3">
                                        <Col md={8}>
                                            <Form.Group>
                                                <Form.Label>Question {qIndex + 1} *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={question.questionText}
                                                    onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Type</Form.Label>
                                                <Form.Select
                                                    value={question.type}
                                                    onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                                                >
                                                    <option value="multiple-choice">Multiple Choice</option>
                                                    <option value="true-false">True/False</option>
                                                    <option value="short-answer">Short Answer</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={1}>
                                            <Button
                                                variant="danger"
                                                onClick={() => removeQuestion(qIndex)}
                                                disabled={quizData.questions.length === 1}
                                                className="mt-4"
                                            >
                                                ×
                                            </Button>
                                        </Col>
                                    </Row>

                                    {question.type === 'multiple-choice' && (
                                        <div className="mb-3">
                                            <Form.Label>Options</Form.Label>
                                            {question.options.map((option, oIndex) => (
                                                <Form.Control
                                                    key={oIndex}
                                                    type="text"
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    className="mb-2"
                                                    required
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <Form.Group>
                                        <Form.Label>Correct Answer *</Form.Label>
                                        {question.type === 'multiple-choice' ? (
                                            <Form.Select
                                                value={question.correctAnswer}
                                                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                                required
                                            >
                                                <option value="">Select correct answer</option>
                                                {question.options.map((option, oIndex) => (
                                                    <option key={oIndex} value={option}>
                                                        {option || `Option ${oIndex + 1}`}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        ) : (
                                            <Form.Control
                                                type={question.type === 'true-false' ? 'select' : 'text'}
                                                as={question.type === 'true-false' ? 'select' : 'input'}
                                                value={question.correctAnswer}
                                                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                                required
                                            >
                                                {question.type === 'true-false' && (
                                                    <>
                                                        <option value="">Select answer</option>
                                                        <option value="true">True</option>
                                                        <option value="false">False</option>
                                                    </>
                                                )}
                                            </Form.Control>
                                        )}
                                    </Form.Group>
                                </Card.Body>
                            </Card>
                        ))}

                        <div className="mb-3">
                            <Button variant="outline-primary" onClick={addQuestion}>
                                Add Question
                            </Button>
                        </div>

                        <div className="d-flex gap-2">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading || !canCreateQuiz}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : 'Create Quiz'}
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/quizzes')}>
                                Cancel
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreateQuiz;