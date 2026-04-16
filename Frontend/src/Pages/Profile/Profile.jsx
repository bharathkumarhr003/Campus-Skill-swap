import React from "react";
import "./Profile.css";
import Box from "./Box";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import { toast } from "react-toastify";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Profile = () => {
  const { user, setUser } = useUser();
  const [profileUser, setProfileUser] = useState(null);
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [myBounties, setMyBounties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/user/registered/getDetails/${username}`);
        console.log(data.data);
        setProfileUser(data.data);
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
          if (error.response.data.message === "Please Login") {
            localStorage.removeItem("userInfo");
            setUser(null);
            await axios.get("/auth/logout");
            navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();

    // Fetch analytics if own profile
    if (user && user.username === username) {
      console.log('user.username:', user.username, 'username:', username);
      const getAnalytics = async () => {
        try {
          console.log('Fetching analytics');
          const { data } = await axios.get('/user/analytics');
          console.log('Analytics data:', data.data);
          setAnalytics(data.data);
        } catch (error) {
          console.error('Error fetching analytics', error);
          console.log('Status:', error.response?.status);
          toast.error('Failed to load analytics');
        }
      };
      getAnalytics();

      const getMyBounties = async () => {
        try {
          const { data } = await axios.get('/bounty/my');
          setMyBounties(data.data);
        } catch (error) {
          console.error('Error fetching my bounties', error);
          toast.error('Failed to load your bounties');
        }
      };
      getMyBounties();
    } else {
      console.log('Not own profile or user not set');
    }
  }, [username, user]);

  const convertDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("en-US", { month: "2-digit", year: "numeric" }).replace("/", "-");
    return formattedDate;
  };

  const connectHandler = async () => {
    console.log("Connect");
    try {
      setConnectLoading(true);
      const { data } = await axios.post(`/request/create`, {
        receiverID: profileUser._id,
      });

      console.log(data);
      toast.success(data.message);
      setProfileUser((prevState) => {
        return {
          ...prevState,
          status: "Pending",
        };
      });
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
        if (error.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          await axios.get("/auth/logout");
          navigate("/login");
        }
      }
    } finally {
      setConnectLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="container" style={{ minHeight: "86vh" }}>
        {loading ? (
          <div className="row d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <div className="profile-box">
              <div className="left-div">
                {/* Profile Photo */}
                <div className="profile-photo">
                  <img src={profileUser?.picture} alt="Profile" />
                </div>
                {/* Name */}
                <div className="misc">
                  <h1 className="profile-name" style={{ marginLeft: "2rem" }}>
                    {profileUser?.name}
                  </h1>
                  {/* Rating */}
                  <div className="rating" style={{ marginLeft: "2rem" }}>
                    {/* Rating stars */}
                    <span className="rating-stars">
                      {profileUser?.rating
                        ? Array.from({ length: profileUser.rating }, (_, index) => <span key={index}>⭐</span>)
                        : "⭐⭐⭐⭐⭐"}
                    </span>
                    {/* Rating out of 5 */}
                    <span className="rating-value">{profileUser?.rating ? profileUser?.rating : "5"}</span>
                    
<h5 style={{ color: '#eee59dff', marginTop: '10px', fontWeight: '600' }}>
  🪙 {user.skillCoins} Skill Coins
</h5>
                  </div>
                  {/* Connect and Report Buttons */}
                  {
                    // If the user is the same as the logged in user, don't show the connect and report buttons
                    user?.username !== username && (
                      <div className="buttons">
                        <button
                          className="connect-button"
                          onClick={profileUser?.status === "Connect" ? connectHandler : undefined}
                        >
                          {connectLoading ? (
                            <>
                              <Spinner animation="border" variant="light" size="sm" style={{ marginRight: "0.5rem" }} />
                            </>
                          ) : (
                            profileUser?.status
                          )}
                        </button>
                        <Link to={`/report/${profileUser.username}`}>
                          <button className="report-button">Report</button>
                        </Link>
                        <Link to={`/rating/${profileUser.username}`}>
                          <button className="report-button bg-success">Rate</button>
                        </Link>
                      </div>
                    )
                  }
                </div>
              </div>
              <div className="edit-links">
                {user.username === username && (
                  <Link to="/edit_profile">
                    <button className="edit-button">Edit Profile ✎</button>
                  </Link>
                )}

                {/* Portfolio Links */}
                <div className="portfolio-links">
                  <a
                    href={profileUser?.githubLink ? profileUser.githubLink : "#"}
                    target={profileUser?.githubLink ? "_blank" : "_self"}
                    className="portfolio-link"
                  >
                    <img src="/assets/images/github.png" className="link" alt="Github" />
                  </a>
                  <a
                    href={profileUser?.linkedinLink ? profileUser.linkedinLink : "#"}
                    target={profileUser?.linkedinLink ? "_blank" : "_self"}
                    className="portfolio-link"
                  >
                    <img src="/assets/images/linkedin.png" className="link" alt="LinkedIn" />
                  </a>
                  <a
                    href={profileUser?.portfolioLink ? profileUser.portfolioLink : "#"}
                    target={profileUser?.portfolioLink ? "_blank" : "_self"}
                    className="portfolio-link"
                  >
                    <img src="/assets/images/link.png" className="link" alt="Portfolio" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bio */}
            <h2>Bio</h2>
            <p className="bio">{profileUser?.bio}</p>

            {/* Skills */}
            <div className="skills">
              <h2>Skills Proficient At</h2>
              {/* Render skill boxes here */}
              <div className="skill-boxes">
                {profileUser?.skillsProficientAt.map((skill, index) => (
                  <div className="skill-box" style={{ fontSize: "16px" }} key={index}>
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            {profileUser?.badges && profileUser.badges.length > 0 && (
              <div className="badges">
                <h2>Certified Skills</h2>
                <div className="badge-boxes" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {profileUser.badges.map((badge, index) => (
                    <div key={index} className="badge-item" style={{
                      backgroundColor: '#3bb4a1',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <img src={badge.image} alt={badge.name} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                      <span>{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div className="education">
              <h2>Education</h2>

              <div className="education-boxes">
                {/* Render education boxes here */}
                {profileUser &&
                  profileUser?.education &&
                  profileUser?.education.map((edu, index) => (
                    <Box
                      key={index}
                      head={edu?.institution}
                      date={convertDate(edu?.startDate) + " - " + convertDate(edu?.endDate)}
                      spec={edu?.degree}
                      desc={edu?.description}
                      score={edu?.score}
                    />
                  ))}
              </div>
            </div>

            {/* Projects */}
            {profileUser?.projects && profileUser?.projects.length > 0 && (
              <div className="projects">
                <h2>Projects</h2>

                <div className="project-boxes">
                  {
                    // Render project boxes here
                    profileUser &&
                      profileUser?.projects &&
                      profileUser?.projects.map((project, index) => (
                        <Box
                          key={index}
                          head={project?.title}
                          date={convertDate(project?.startDate) + " - " + convertDate(project?.endDate)}
                          desc={project?.description}
                          skills={project?.techStack}
                        />
                      ))
                  }

                  {/* Render project boxes here */}
                </div>
              </div>
            )}

            {/* Dashboard for own profile */}
            {user && user.username === username && analytics && (
              <div className="dashboard" style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                <h2>My Dashboard</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <h3>Bounty Stats</h3>
                    <Bar
                      data={{
                        labels: ['Posted', 'Completed', 'Assigned'],
                        datasets: [{
                          label: 'Count',
                          data: [analytics.totalPosted, analytics.totalCompleted, analytics.totalAssigned],
                          backgroundColor: ['#fbf1a4', '#3bb4a1', '#013e38'],
                        }],
                      }}
                    />
                  </div>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <h3>Rating Over Time</h3>
                    <Line
                      data={{
                        labels: analytics.ratingsOverTime.map(r => new Date(r.date).toLocaleDateString()),
                        datasets: [{
                          label: 'Rating',
                          data: analytics.ratingsOverTime.map(r => r.score),
                          borderColor: '#fbf1a4',
                          backgroundColor: 'rgba(251, 241, 164, 0.2)',
                        }],
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <p><strong>Average Rating:</strong> {analytics.averageRating.toFixed(1)} ⭐</p>
                  <p><strong>Total Earnings:</strong> 🪙 {analytics.earnings} Skill Coins</p>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <h3>My Bounties</h3>
                  {myBounties.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {myBounties.map(bounty => (
                        <div key={bounty._id} style={{ backgroundColor: '#333', padding: '1rem', borderRadius: '8px' }}>
                          <h4>{bounty.title}</h4>
                          <p>Status: {bounty.status}</p>
                          <p>Reward: 🪙 {bounty.reward} Skill Coins</p>
                          <p>Progress: {bounty.progress}%</p>
                          {bounty.assignedTo && <p>Assigned to: {bounty.assignedTo.name}</p>}
                          <Button variant="primary" onClick={() => navigate(`/bounty/${bounty._id}`)}>
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No bounties posted yet.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
