import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button"; // Button'annu import maadi
import { Link } from "react-router-dom";
// import "./BountyCard.css"; // ERROR FIX: Ee CSS file'annu kelagade serisidini

/* ERROR FIX: Nanu CSS code'annu direct'aagi ee file'nalli ondu <style> tag'nalli haakthiddini.
  Idarinda "Could not resolve ./BountyCard.css" error baralla.
*/
const style = `
.bounty-card-container {
  width: 100%;
  max-width: 300px;
  margin: 1rem;
  background-color: #3a3a3a;
  color: #fbf1a4;
  border: 1px solid #555;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.bounty-card-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.bounty-title {
  font-family: "Josefin Sans", sans-serif;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
}

.bounty-coins {
  font-size: 1.1rem;
  font-weight: 500;
  color: #fbf1a4;
  margin-bottom: 1rem !important;
}

.bounty-description {
  color: #e0e0e0;
  font-size: 0.9rem;
  height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.bountyskills {
  margin-top: 1rem;
}

.bountyskills h6 {
  font-size: 0.8rem;
  color: #ccc;
  text-transform: uppercase;
}

.bountyskill-boxes {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.bountyskill-box {
  background-color: #555;
  border-radius: 5px;
  padding: 3px 8px;
}

.skill {
  font-size: 0.8rem;
  color: #f0f0f0;
}

.bounty-view-button {
  width: 100%;
  margin-top: 1rem;
  background-color: #fbf1a4;
  color: #333;
  border: none;
  font-weight: 600;
}

.bounty-view-button:hover {
  background-color: #e6d98a;
  color: #000;
}
`;

// Ee component 'bounty' data'vannu props'aagi thegedukollutte
const BountyCard = ({ bountyId, title, description, tags, skillCoins }) => {
  return (
    <>
      {/* Nanu CSS'annu illi haakthiddini */}
      <style>{style}</style>
      <Card className="bounty-card-container">
        <Card.Body>
          {/* Navu illi "title" toristhivi */}
          <Card.Title className="bounty-title">{title}</Card.Title>

          {/* Navu illi "skillCoins" toristhivi */}
          <Card.Subtitle className="bounty-coins mb-2">
            🪙 {skillCoins} Skill Coins
          </Card.Subtitle>

          {/* Navu illi "description" toristhivi */}
          <Card.Text className="bounty-description">{description}</Card.Text>

          {/* Navu illi "tags" (skills) toristhivi */}
          <div className="bountyskills">
            <h6>Skills Required:</h6>
            <div className="bountyskill-boxes">
              {tags && tags.length > 0 ? (
                tags.map((skill, index) => (
                  <div key={index} className="bountyskill-box">
                    <span className="skill">{skill}</span>
                  </div>
                ))
              ) : (
                <p>No specific skills listed.</p>
              )}
            </div>
          </div>

          {/* Navu illi "View Details" button'annu toristhivi */}
          <Link to={`/bounty/${bountyId}`}>
            <Button variant="primary" className="bounty-view-button">
              View Details & Apply
            </Button>
          </Link>
        </Card.Body>
      </Card>
    </>
  );
};

export default BountyCard;