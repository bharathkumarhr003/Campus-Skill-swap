import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const TakeBountyQuiz = () => {
    const { bountyId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuiz();
    }, [bountyId]);

    const fetchQuiz = async () => {
        try {
            const res = await axios.get(`/bounty/${bountyId}/quiz`);
            const data = res.data.data;
            if (!data || !data.required) {
                toast.info('No quiz required for this bounty. Applying directly.');
                await axios.patch(`/bounty/${bountyId}/claim`);
                navigate(`/bounty/${bountyId}`);
                return;
            }

            // limit to max 10 questions
            const questions = (data.questions || []).slice(0, 10).map((q, idx) => ({ ...q, _idx: idx }));
            setQuiz({ questions });
        } catch (err) {
            console.error(err);
            toast.error('Failed to load quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (index, selectedIndex) => {
        setAnswers(prev => ({ ...prev, [index]: selectedIndex }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const formatted = Object.entries(answers).map(([k, v]) => ({ questionIndex: Number(k), selectedIndex: Number(v) }));
            const res = await axios.post(`/bounty/${bountyId}/quiz`, { answers: formatted });
            const data = res.data.data; // { attemptId, score, passed }
            setResult(data);

            if (data.passed) {
                // auto apply
                await axios.patch(`/bounty/${bountyId}/claim`);
                toast.success('Quiz passed and application submitted');
                navigate(`/bounty/${bountyId}`);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (<Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}><Spinner animation="border" /></Container>);

    if (!quiz) return (<Container className="py-4"><Alert variant="warning">No quiz available.</Alert></Container>);

    if (result) {
        return (
            <Container className="py-4">
                <Card>
                    <Card.Body className="text-center">
                        <h2>Quiz Results</h2>
                        <h3 className={`mt-3 ${result.passed ? 'text-success' : 'text-danger'}`}>
                            {result.passed ? 'Passed!' : 'Failed'}
                        </h3>
                        <p className="h4">Score: {result.score}%</p>
                        <Button variant="primary" onClick={() => navigate(`/bounty/${bountyId}`)} className="mt-3">Back to Bounty</Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Card>
                <Card.Header>
                    <h2>Pre-qualification Quiz</h2>
                    <p className="mb-0">Answer the following multiple-choice questions to apply.</p>
                </Card.Header>
                <Card.Body>
                    {quiz.questions.map((q, idx) => (
                        <div key={idx} className="mb-4">
                            <h5>{idx + 1}. {q.question}</h5>
                            <Form.Group>
                                {q.options.map((opt, optIdx) => (
                                    <Form.Check
                                        key={optIdx}
                                        type="radio"
                                        name={`q-${idx}`}
                                        label={opt}
                                        value={optIdx}
                                        onChange={() => handleAnswerChange(idx, optIdx)}
                                        checked={answers[idx] === optIdx}
                                    />
                                ))}
                            </Form.Group>
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

export default TakeBountyQuiz;
