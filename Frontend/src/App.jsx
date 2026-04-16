import { Route, Routes } from "react-router-dom";
import Footer from "./Components/Footer/Footer";
import Discover from "./Pages/Discover/Discover";
import BountyDetails from "./Pages/Discover/BountyDetails";
import Login from "./Pages/Login/Login";
import Header from "./Components/Navbar/Navbar";
import LandingPage from "./Pages/LandingPage/LandingPage";
import AboutUs from "./Pages/AboutUs/AboutUs";
import Chats from "./Pages/Chats/Chats";
import Report from "./Pages/Report/Report";
import Profile from "./Pages/Profile/Profile";
import NotFound from "./Pages/NotFound/NotFound";
import Register from "./Pages/Register/Register";
import Rating from "./Pages/Rating/Rating";
import EditProfile from "./Pages/EditProfile/EditProfile";
import Quizzes from "./Pages/Quizzes/Quizzes";
import TakeQuiz from "./Pages/Quizzes/TakeQuiz";
import TakeBountyQuiz from "./Pages/Quizzes/TakeBountyQuiz";
import CreateQuiz from "./Pages/Quizzes/CreateQuiz";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import PrivateRoutes from "./util/PrivateRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const App = () => {
  return (
    <>
      <Header />
      <ToastContainer position="top-right" />
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/chats" element={<Chats />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/take-quiz/:quizId" element={<TakeQuiz />} />
          <Route path="/take-bounty-quiz/:bountyId" element={<TakeBountyQuiz />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/bounty/:bountyId" element={<BountyDetails />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about_us" element={<AboutUs />} />
        <Route path="/edit_profile" element={<EditProfile />} />
        <Route path="/report/:username" element={<Report />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/rating" element={<Rating />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
