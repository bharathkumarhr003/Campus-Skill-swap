import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../util/UserContext';
import ApiCall from '../../util/ApiCall';

const Quizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userBadges, setUserBadges] = useState([]);
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        fetchQuizzes();
        if (user) {
            fetchUserBadges();
        }
    }, [user]);

    const fetchQuizzes = async () => {
        try {
            const response = await ApiCall({
                url: '/quiz',
                method: 'GET'
            });
            setQuizzes(response.data.data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleTakeQuiz = (quizId) => {
        navigate(`/take-quiz/${quizId}`);
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Skill Assessment Quizzes</h1>
                {(user?.isAdmin || userBadges.length > 0) && (
                    <Button variant="primary" onClick={() => navigate('/create-quiz')}>
                        Create Quiz
                    </Button>
                )}
            </div>
            <Row>
                {quizzes.map((quiz) => (
                    <Col key={quiz._id} md={6} lg={4} className="mb-4">
                        <Card className="h-100">
                            <Card.Body className="d-flex flex-column">
                                <Card.Title>{quiz.title}</Card.Title>
                                <Badge bg="secondary" className="mb-2">{quiz.skill}</Badge>
                                <Card.Text className="flex-grow-1">
                                    {quiz.description}
                                </Card.Text>
                                <div className="mt-auto">
                                    <p className="mb-2">Passing Score: {quiz.passingScore}%</p>
                                    <p className="mb-3">Questions: {quiz.questions.length}</p>
                                    <Button
                                        variant="primary"
                                        onClick={() => handleTakeQuiz(quiz._id)}
                                        className="w-100"
                                    >
                                        Take Quiz
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            {quizzes.length === 0 && (
                <div className="text-center">
                    <p>No quizzes available at the moment.</p>
                </div>
            )}
        </Container>
    );
};

export default Quizzes;