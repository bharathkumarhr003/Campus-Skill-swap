import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext"; 
import axios from "axios";
import { toast } from "react-toastify";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card"; 
import { Link } from "react-router-dom"; 
import CreateBountyModal from "./CreateBountyModal"; 

// === INTERNAL USER CARD COMPONENT ===
const UserCard = ({ _id, name, username, picture, rating, skillsProficientAt }) => {
  return (
    <Card className="bounty-card-container">
      <Card.Body>
        <Card.Title className="bounty-title">{name}</Card.Title>
        <Card.Subtitle>@{username}</Card.Subtitle>
        <p>Rating: {rating ? rating.toFixed(1) : 'N/A'} ⭐</p>
        <div className="bountyskills">
          <h6>Skills:</h6>
          <div className="bountyskill-boxes">
            {skillsProficientAt?.slice(0, 3).map((skill, index) => (
              <div key={index} className="bountyskill-box">
                <span className="skill">{skill}</span>
              </div>
            ))}
          </div>
        </div>
        <Link to={`/profile/${username}`}>
          <Button variant="primary" className="bounty-view-button" aria-label={`View profile of ${name}`}>
            View Profile
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

// === INTERNAL BOUNTY CARD COMPONENT ===
const BountyCard = ({ _id, title, description, tags, reward }) => {
  return (
    <Card className="bounty-card-container">
      <Card.Body>
        <Card.Title className="bounty-title">{title}</Card.Title>
        <Card.Subtitle className="bounty-coins mb-2">
          🪙 {reward} Skill Coins
        </Card.Subtitle>
        <Card.Text className="bounty-description">{description}</Card.Text>
        <div className="bountyskills">
          <h6>Skills Required:</h6>
          <div className="bountyskill-boxes">
            {tags?.length ? (
              tags.map((skill, index) => (
                <div key={index} className="bountyskill-box">
                  <span className="skill">{skill}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.8rem", color: "#ccc" }}>
                No specific skills listed.
              </p>
            )}
          </div>
        </div>
        <Link to={`/bounty/${_id}`}>
          <Button variant="primary" className="bounty-view-button" aria-label={`View details for bounty ${title}`}>
            View Details & Apply
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

const Discover = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);

  const [showPostModal, setShowPostModal] = useState(false);

  const [forYouBounties, setForYouBounties] = useState([]);
  const [webDevBounties, setWebDevBounties] = useState([]);
  const [mlBounties, setMlBounties] = useState([]);
  const [otherBounties, setOtherBounties] = useState([]);
  const [recommendedBounties, setRecommendedBounties] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);

  const handleShowPostModal = () => setShowPostModal(true);
  const handleClosePostModal = () => setShowPostModal(false);

  const getDiscoverBounties = async () => {
  try {
    setLoading(true);
    const res = await axios.get("/bounty/discover");
    const data = res.data.data;

    setForYouBounties(data.forYou);
    setWebDevBounties(data.webDev);
    setMlBounties(data.ml);
    setOtherBounties(data.others);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load bounties");
  } finally {
    setLoading(false);
  }
};

  const getRecommendations = async () => {
    try {
      const res = await axios.get("/user/recommendations");
      const data = res.data.data;
      setRecommendedBounties(data.recommendedBounties);
      setRecommendedUsers(data.recommendedUsers);
    } catch (err) {
      console.error(err);
      // Don't show error for recommendations
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await axios.get(`/user/registered/getDetails`);
        setUser(data.data);
        localStorage.setItem("userInfo", JSON.stringify(data.data));
      } catch (error) {
        console.log(error);
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      }
    };

    getUser();
    getDiscoverBounties();
    getRecommendations();
  }, [navigate, setUser]);

  return (
    <>
      <style>{`
        .discover-page { display: flex; min-height: 100vh; }
        .content-container { display: flex; flex-grow: 1; width: 100%; }
        .nav-bar { width: 250px; background-color: #2c2c2c; padding: 1.5rem 1rem; height: 100vh; position: sticky; top: 0; display: flex; flex-direction: column; }
        .nav-bar .navlink { color: #ccc; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 0.5rem; font-weight: 500; text-decoration: none; display: center;}
        .nav-bar .navlink:hover { background-color: #3a3a3a; color: #fff; }
        .heading-container { flex-grow: 1; padding: 2rem 3rem; background-color: #1e1e1e; }
        .discover-heading, .discover-heading-h2 { font-family: "Josefin Sans", sans-serif; color: #fbf1a4; margin-top: 2rem; margin-bottom: 1.5rem; }
        .discover-heading-h2 { font-size: 1.75rem; }
        .bounty-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .no-bounties-message { color: #fbf1a4; font-size: 1.25rem; font-weight: 300; }
        
        .bounty-card-container { width: 100%; max-width: 320px; margin: 0; background-color: #2a2a2a; color: #fbf1a4; border: 1px solid #444; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); transition: all 0.3s ease; }
        .bounty-card-container:hover { transform: translateY(-5px); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4); }
        .bounty-title { font-family: "Josefin Sans", sans-serif; color: #ffffff; font-size: 1.25rem; font-weight: 600; }
        .bounty-coins { font-size: 1.1rem; font-weight: 500; color: #fbf1a4; margin-bottom: 1rem !important; }
        .bounty-description { color: #e0e0e0; font-size: 0.9rem; height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
        .bountyskills { margin-top: 1rem; }
        .bountyskills h6 { font-size: 0.8rem; color: #ccc; text-transform: uppercase; }
        .bountyskill-boxes { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
        .bountyskill-box { background-color: #555; border-radius: 5px; padding: 3px 8px; }
        .skill { font-size: 0.8rem; color: #f0f0f0; }
        .bounty-view-button { width: 100%; margin-top: 1rem; background-color: #fbf1a4; color: #333; border: none; font-weight: 600; }
        .bounty-view-button:hover { background-color: #e6d98a; color: #000; }

        @media (max-width: 768px) {
          .discover-page { flex-direction: column; }
          .nav-bar { width: 100%; height: auto; padding: 1rem; position: static; }
          .heading-container { padding: 1rem; }
          .bounty-cards-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
          .discover-heading-h2 { font-size: 1.25rem; }
        }

        @media (max-width: 480px) {
          .bounty-cards-grid { grid-template-columns: 1fr; }
          .nav-bar .navlink { min-width: 120px; font-size: 0.9rem; }
        }
      `}</style>

      <div className="discover-page">
        <div className="content-container">
          <div className="nav-bar">
            <div className="mb-4">
              <Button
                onClick={handleShowPostModal}
                style={{
                  width: "100%",
                  backgroundColor: "#fbf1a4",
                  color: "#000",
                  fontWeight: "bold",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  cursor: "pointer",
                }}
              >
                + Post Bounty
              </Button>
            </div>

            <Nav className="flex-column">
              <Nav.Link href="#for-you" className="navlink">For You</Nav.Link>
              <Nav.Link href="#popular" className="navlink">Popular</Nav.Link>
              <Nav.Link href="#web-development" className="navlink">Web Development</Nav.Link>
              <Nav.Link href="#machine-learning" className="navlink">Machine Learning</Nav.Link>
              <Nav.Link href="#others" className="navlink">Others</Nav.Link>
            </Nav>
          </div>

          <div className="heading-container">
            {loading ? (
              <div className="container d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <>
                {recommendedBounties.length > 0 && (
                  <>
                    <h1 className="discover-heading">Recommended Bounties</h1>
                    <div className="bounty-cards-grid">
                      {recommendedBounties.map((b) => <BountyCard key={b._id} {...b} />)}
                    </div>
                  </>
                )}

                {recommendedUsers.length > 0 && (
                  <>
                    <h2 className="discover-heading-h2">Recommended Users</h2>
                    <div className="bounty-cards-grid">
                      {recommendedUsers.map((u) => <UserCard key={u._id} {...u} />)}
                    </div>
                  </>
                )}

                <h1 id="for-you" className="discover-heading">For You</h1>
                <div className="bounty-cards-grid">
                  {forYouBounties.length ? forYouBounties.map((b) => <BountyCard key={b._id} {...b} />) : <h1 className="no-bounties-message">No bounties to show</h1>}
                </div>

                <h2 id="web-development" className="discover-heading-h2">Web Development</h2>
                <div className="bounty-cards-grid">
                  {webDevBounties.length ? webDevBounties.map((b) => <BountyCard key={b._id} {...b} />) : <h1 className="no-bounties-message">No bounties to show</h1>}
                </div>

                <h2 id="machine-learning" className="discover-heading-h2">Machine Learning</h2>
                <div className="bounty-cards-grid">
                  {mlBounties.length ? mlBounties.map((b) => <BountyCard key={b._id} {...b} />) : <h1 className="no-bounties-message">No bounties to show</h1>}
                </div>

                <h2 id="others" className="discover-heading-h2">Others</h2>
                <div className="bounty-cards-grid">
                  {otherBounties.length ? otherBounties.map((b) => <BountyCard key={b._id} {...b} />) : <h1 className="no-bounties-message">No bounties to show</h1>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <CreateBountyModal
        show={showPostModal}
        handleClose={handleClosePostModal}
        refreshBounties={getDiscoverBounties}
      />
    </>
  );
};

export default Discover;
