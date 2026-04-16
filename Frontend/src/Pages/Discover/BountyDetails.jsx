import React, { useEffect, useState } from "react";
import "./Discover.css";
import "./BountyDetails.css";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import ListGroup from "react-bootstrap/ListGroup";

const BountyDetails = () => {
  const { bountyId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [bounty, setBounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBounty = async () => {
      try {
        const { data } = await axios.get(`/bounty/${bountyId}`);
        setBounty(data.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load bounty");
        toast.error("Failed to load bounty");
      } finally {
        setLoading(false);
      }
    };
    fetchBounty();
  }, [bountyId]);

  const handleClaim = async () => {
    // Check if bounty requires a quiz first
    try {
      setActionLoading(true);
      const quizRes = await axios.get(`/bounty/${bountyId}/quiz`);
      if (quizRes.data.data.required) {
        // Redirect to bounty quiz route
        navigate(`/take-bounty-quiz/${bountyId}`);
        return;
      }

      await axios.patch(`/bounty/${bountyId}/claim`);
      toast.success("Applied successfully");
      window.location.reload();
    } catch (error) {
      console.error('Apply error', error);
      const status = error.response?.status;
      const data = error.response?.data;
      const serverMsg = data?.message || data?.error || JSON.stringify(data) || null;
      const toastMsg = serverMsg ? `Failed to apply: ${serverMsg} (status ${status})` : (error.message || 'Failed to apply');
      toast.error(toastMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const [attemptModalOpen, setAttemptModalOpen] = useState(false);
  const [attemptData, setAttemptData] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [quizConfirmOpen, setQuizConfirmOpen] = useState(false);
  const [quizInfo, setQuizInfo] = useState(null);

  const fetchAndShowAttempt = async (applicant) => {
    try {
      setActionLoading(true);
      const res = await axios.get(`/bounty/${bountyId}/quiz/attempts/${applicant._id}`);
      setAttemptData(res.data.data);
      setSelectedApplicant(applicant);
      setAttemptModalOpen(true);
    } catch (err) {
      toast.error("Failed to fetch attempt");
    } finally {
      setActionLoading(false);
    }
  };

  const approveApplicantDirect = async (applicant) => {
    if (!applicant) return;
    const ok = window.confirm(`Approve ${applicant.name} for this bounty?`);
    if (!ok) return;
    try {
      setActionLoading(true);
      await axios.patch(`/bounty/${bountyId}/approve`, { applicantId: applicant._id });
      toast.success("Applicant approved");
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmApprove = async () => {
    if (!selectedApplicant) return;
    try {
      setActionLoading(true);
      await axios.patch(`/bounty/${bountyId}/approve`, { applicantId: selectedApplicant._id });
      toast.success("Applicant approved");
      setAttemptModalOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      await axios.patch(`/bounty/${bountyId}/complete`);
      toast.success("Bounty completed");
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProgress = async (progress) => {
    try {
      await axios.patch(`/bounty/${bountyId}/progress`, { progress });
      toast.success("Progress updated");
      setBounty({ ...bounty, progress });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update progress");
    }
  };

  const handleRate = (toUserId) => {
    navigate(`/rating?bountyId=${bountyId}&toUserId=${toUserId}`);
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <div className="text-center mt-5"><h3>{error}</h3></div>;
  if (!bounty) return <div className="text-center mt-5"><h3>Bounty not found</h3></div>;

  const isCreator = user?._id === bounty.createdBy._id;
  const isAssigned = user?._id === bounty.assignedTo?._id;
  const hasApplied = bounty.applicants.some(id => id === user?._id);

  return (
    <>
    <div className="discover-page">
      <div className="bounty-details-wrapper">
        <div className="container mt-4">
          <Card className="profile-card bounty-detail-card">
            <Card.Body>
          <Card.Title>{bounty.title}</Card.Title>
          <Card.Subtitle>🪙 {bounty.reward} Skill Coins</Card.Subtitle>
          <Card.Text>{bounty.description}</Card.Text>
          <p>Status: {bounty.status}</p>
          <p>Progress: {bounty.progress}%</p>
          <div>
            <h6>Skills:</h6>
            {bounty.tags.map(tag => <span key={tag} className="badge bg-primary me-1">{tag}</span>)}
          </div>
          <p>Created by: {bounty.createdBy.name}</p>
          {bounty.assignedTo && <p>Assigned to: {bounty.assignedTo.name}</p>}

          {bounty.status === "OPEN" && !isCreator && !hasApplied && (
            <Button onClick={handleClaim} disabled={actionLoading}>
              Apply
            </Button>
          )}

          {bounty.status === "OPEN" && isCreator && bounty.applicants.length > 0 && (
            <div>
              <h6>Applicants:</h6>
              <ListGroup>
                {bounty.applicants.map(app => (
                  <ListGroup.Item key={app._id} className="d-flex justify-content-between align-items-center">
                    <div>{app.name}</div>
                    <div>
                      <Button size="sm" onClick={() => approveApplicantDirect(app)}>Approve</Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          {bounty.status === "IN_PROGRESS" && (isCreator || isAssigned) && (
            <div>
              <input
                type="range"
                min="0"
                max="100"
                value={bounty.progress}
                onChange={(e) => handleUpdateProgress(e.target.value)}
              />
              <Button onClick={handleComplete} disabled={actionLoading}>
                Mark Complete
              </Button>
            </div>
          )}

          {bounty.status === "COMPLETED" && (
            <div>
              {isCreator && bounty.assignedTo && (
                <Button onClick={() => handleRate(bounty.assignedTo._id)}>
                  Rate Helper
                </Button>
              )}
              {isAssigned && (
                <Button onClick={() => handleRate(bounty.createdBy._id)}>
                  Rate Creator
                </Button>
              )}
            </div>
          )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
    <Modal show={attemptModalOpen} onHide={() => setAttemptModalOpen(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Applicant Quiz Result</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {attemptData ? (
          <div>
            <p><strong>Applicant:</strong> {selectedApplicant?.name}</p>
            <p><strong>Score:</strong> {attemptData.score}%</p>
            <p><strong>Status:</strong> {attemptData.passed ? 'Passed' : 'Failed'}</p>
            <p><strong>Submitted:</strong> {new Date(attemptData.createdAt).toLocaleString()}</p>
          </div>
        ) : (
          <p>No attempt found for this applicant.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setAttemptModalOpen(false)}>Close</Button>
        <Button variant="primary" onClick={confirmApprove} disabled={!attemptData || actionLoading}>Confirm Approve</Button>
      </Modal.Footer>
    </Modal>
    <Modal show={quizConfirmOpen} onHide={() => setQuizConfirmOpen(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Pre-qualification Quiz Required</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>This bounty requires a short pre-qualification quiz before applying.</p>
        <p>Questions: <strong>{quizInfo?.questionCount ?? 'up to 10'}</strong></p>
        <p>Passing is required to have your application considered.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setQuizConfirmOpen(false)}>Cancel</Button>
        <Button variant="primary" onClick={() => { setQuizConfirmOpen(false); navigate(`/take-bounty-quiz/${bountyId}`); }}>Take Quiz</Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default BountyDetails;