import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    try {
        // Grab the token from the user's cookies
        const token = req.cookies.token;

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized. Please Login Again' });
        }

        // Verify the token is real and hasn't been tampered with
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the secure user ID to the request so the controller can use it
        req.body.userId = decoded.id;

        // Pass control to the next function (the controller)
        next();
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export default userAuth;