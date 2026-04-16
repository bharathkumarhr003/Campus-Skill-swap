import jwt from "jsonwebtoken";

// ✅ THIS IS THE NEW, CORRECTED VERSION
export const generateJWTToken_email = (user) => {
  console.log("\n******** Inside GenerateJWTToken_email Function ********");
  // This version correctly includes the name and picture
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      picture: user.picture
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30m",
    }
  );
};

// This is your original function for registered users - KEEP THIS
export const generateJWTToken_username = (user) => {
  console.log("\n******** Inside GenerateJWTToken_username Function ********");
  const payload = {
    id: user._id,
    username: user.username,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};