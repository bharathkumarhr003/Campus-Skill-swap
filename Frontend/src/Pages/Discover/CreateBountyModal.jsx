import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { toast } from "react-toastify";
import "./bountyModal.css";

const CreateBountyModal = ({ show, handleClose, refreshBounties }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    tags: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        reward: Number(formData.reward),
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      await axios.post("/bounty", payload);

      toast.success("Bounty Posted Successfully! 🎉");
      refreshBounties();
      handleClose();
      setFormData({ title: "", description: "", reward: "", tags: "" });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to post bounty");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="bounty-overlay">
      <div className="bounty-container">
        <div className="bounty-header">
          <h3>Post a New Bounty</h3>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Task Title</Form.Label>
            <Form.Control
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reward (Skill Coins)</Form.Label>
            <Form.Control
              type="number"
              name="reward"
              value={formData.reward}
              onChange={handleChange}
              required
              disabled={loading}
              min={1}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tags (comma separated)</Form.Label>
            <Form.Control
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>

          <div className="btn-row">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
  type="submit"
  variant="warning"
  disabled={loading}
  onClick={handleSubmit}
>
  {loading ? "Posting..." : "Post Bounty 🚀"}
</Button>

          </div>
        </Form>
      </div>
    </div>
  );
};
console.log("Axios baseURL:", axios.defaults.baseURL);

export default CreateBountyModal;
