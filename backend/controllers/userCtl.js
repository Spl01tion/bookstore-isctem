import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const generateTokens = (user) => { // 
    const accessToken = jwt.sign(
        { userId: user?._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "2d" }
    );

    const refreshToken = jwt.sign(
        { userId: user?._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
}

const loginOrSignUp = async (req, res) => {
    const { email, role } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({ role, email });
            await user.save();
        } else {
            user.role = role;
            await user.save();
        }

        const { accessToken, refreshToken } = generateTokens(user.toObject()); // Fixed destructuring

        res.status(200).json({
            user,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}



// --- NEW: The getAllUsers endpoint controller ---
const getAllUsers = async (req, res) => {
    try {
        // 1. Fetch all users from the database.
        // The .select('-password') method explicitly excludes the password field.
        // This is a more robust way than deleting it from the object later.
        const users = await User.find({}).select('-password');

        // 2. Check if any users were found
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }

        // 3. Send the successful response
        res.status(200).json(users);

    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// --- NEW: The createProfile endpoint you requested ---

const createProfile = async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Basic Validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required." });
    }

    try {
        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        // 3. Create a new user with the plain text password (No Hashing)
        const newUser = new User({
            name,
            email,
            password: password, // <-- The password is saved directly as text
        });

        // 4. Save the new user to the database
        await newUser.save();

        // 5. Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(newUser);

        // 6. Prepare user object for response (still important not to send the password)
        const userResponse = newUser.toObject();
        delete userResponse.password;

        // 7. Send the successful response
        res.status(201).json({
            message: "User created successfully!",
            user: userResponse,
            accessToken,
            refreshToken,
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", details: error.message });
        }
        console.error("Error in createProfile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// --- Export both functions ---
export { loginOrSignUp, createProfile, getAllUsers };