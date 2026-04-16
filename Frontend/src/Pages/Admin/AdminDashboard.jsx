import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge as BootstrapBadge, Modal, Form, Alert } from 'react-bootstrap';
import { useUser } from '../../util/UserContext';
import ApiCall from '../../util/ApiCall';

const AdminDashboard = () => {
    const { user } = useUser();
    const [quizzes, setQuizzes] = useState([]);
    const [badges, setBadges] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [badgeForm, setBadgeForm] = useState({
        name: '',
        skill: '',
        description: '',
        criteria: '',
        image: ''
    });

    useEffect(() => {
        if (user?.isAdmin) {
            fetchAdminData();
        }
    }, [user]);

    const fetchAdminData = async () => {
        try {
            const [quizzesRes, badgesRes, reportsRes] = await Promise.all([
                ApiCall({ url: '/quiz/admin/all', method: 'GET' }),
                ApiCall({ url: '/badge', method: 'GET' }),
                ApiCall({ url: '/report', method: 'GET' })
            ]);
            setQuizzes(quizzesRes.data.data);
            setBadges(badgesRes.data.data);
            setReports(reportsRes.data.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuizStatusToggle = async (quizId, currentStatus) => {
        try {
            await ApiCall({
                url: `/quiz/admin/${quizId}/status`,
                method: 'PUT',
                data: { isActive: !currentStatus }
            });
            fetchAdminData(); // Refresh data
        } catch (error) {
            console.error('Error updating quiz status:', error);
        }
    };

    const handleReportStatusUpdate = async (reportId, status, adminNotes) => {
        try {
            await ApiCall({
                url: `/report/${reportId}`,
                method: 'PATCH',
                data: { status, adminNotes }
            });
            fetchAdminData(); // Refresh data
        } catch (error) {
            console.error('Error updating report status:', error);
        }
    };

    const handleCreateBadge = async (e) => {
        e.preventDefault();
        try {
            await ApiCall({
                url: '/badge',
                method: 'POST',
                data: badgeForm
            });
            setShowBadgeModal(false);
            setBadgeForm({ name: '', skill: '', description: '', criteria: '', image: '' });
            fetchAdminData();
        } catch (error) {
            console.error('Error creating badge:', error);
        }
    };

    if (!user?.isAdmin) {
        return (
            <Container className="py-4">
                <Alert variant="danger">
                    Access denied. Admin privileges required.
                </Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h1 className="mb-4">Admin Dashboard - Quiz Management</h1>

            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Total Quizzes</Card.Title>
                            <h2>{quizzes.length}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Active Quizzes</Card.Title>
                            <h2>{quizzes.filter(q => q.isActive).length}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <Button variant="primary" onClick={() => setShowBadgeModal(true)}>
                        Create New Badge
                    </Button>
                </Col>
            </Row>

            <Card className="mb-4">
                <Card.Header>
                    <h3>Quiz Management</h3>
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Skill</th>
                                <th>Created By</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.map((quiz) => (
                                <tr key={quiz._id}>
                                    <td>{quiz.title}</td>
                                    <td>
                                        <BootstrapBadge bg="secondary">{quiz.skill}</BootstrapBadge>
                                    </td>
                                    <td>{quiz.createdBy?.name || 'Unknown'}</td>
                                    <td>
                                        <BootstrapBadge bg={quiz.isActive ? 'success' : 'danger'}>
                                            {quiz.isActive ? 'Active' : 'Inactive'}
                                        </BootstrapBadge>
                                    </td>
                                    <td>
                                        <Button
                                            variant={quiz.isActive ? 'danger' : 'success'}
                                            size="sm"
                                            onClick={() => handleQuizStatusToggle(quiz._id, quiz.isActive)}
                                        >
                                            {quiz.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>
                    <h3>Badge Management</h3>
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Skill</th>
                                <th>Criteria</th>
                            </tr>
                        </thead>
                        <tbody>
                            {badges.map((badge) => (
                                <tr key={badge._id}>
                                    <td>{badge.name}</td>
                                    <td>
                                        <BootstrapBadge bg="info">{badge.skill}</BootstrapBadge>
                                    </td>
                                    <td>{badge.criteria}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>
                    <h3>Report Management</h3>
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Reporter</th>
                                <th>Reported</th>
                                <th>Nature</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report._id}>
                                    <td>{report.reporter?.name} ({report.reporter?.username})</td>
                                    <td>{report.reported?.name} ({report.reported?.username})</td>
                                    <td>{report.nature}</td>
                                    <td>
                                        <BootstrapBadge bg={
                                            report.status === 'pending' ? 'warning' :
                                            report.status === 'under_review' ? 'info' :
                                            report.status === 'resolved' ? 'success' : 'secondary'
                                        }>
                                            {report.status}
                                        </BootstrapBadge>
                                    </td>
                                    <td>
                                        {report.status === 'pending' && (
                                            <>
                                                <Button size="sm" variant="info" onClick={() => handleReportStatusUpdate(report._id, 'under_review', '')}>
                                                    Review
                                                </Button>{' '}
                                                <Button size="sm" variant="success" onClick={() => handleReportStatusUpdate(report._id, 'resolved', 'Resolved by admin')}>
                                                    Resolve
                                                </Button>{' '}
                                                <Button size="sm" variant="secondary" onClick={() => handleReportStatusUpdate(report._id, 'dismissed', 'Dismissed by admin')}>
                                                    Dismiss
                                                </Button>
                                            </>
                                        )}
                                        {report.status === 'under_review' && (
                                            <>
                                                <Button size="sm" variant="success" onClick={() => handleReportStatusUpdate(report._id, 'resolved', 'Resolved after review')}>
                                                    Resolve
                                                </Button>{' '}
                                                <Button size="sm" variant="secondary" onClick={() => handleReportStatusUpdate(report._id, 'dismissed', 'Dismissed after review')}>
                                                    Dismiss
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
            <Modal show={showBadgeModal} onHide={() => setShowBadgeModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Badge</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateBadge}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Badge Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={badgeForm.name}
                                onChange={(e) => setBadgeForm({...badgeForm, name: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Skill</Form.Label>
                            <Form.Control
                                type="text"
                                value={badgeForm.skill}
                                onChange={(e) => setBadgeForm({...badgeForm, skill: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={badgeForm.description}
                                onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Criteria</Form.Label>
                            <Form.Control
                                type="text"
                                value={badgeForm.criteria}
                                onChange={(e) => setBadgeForm({...badgeForm, criteria: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Image URL (optional)</Form.Label>
                            <Form.Control
                                type="url"
                                value={badgeForm.image}
                                onChange={(e) => setBadgeForm({...badgeForm, image: e.target.value})}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowBadgeModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Create Badge
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AdminDashboard;