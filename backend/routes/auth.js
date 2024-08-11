const express = require('express');
const User = require('../models/user');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'this$is@secret';

// create a user using post "api/auth/creatuser". No login required
router.post('/createuser', [
    body('name', 'Enter valid name').isLength({ min: 3 }),
    body('email', 'Enter valid Email').isEmail(),
    body('password', 'Password should alteast 5 character ').isLength({ min: 5 }),
], async (req, res)=>{
    let success = false;
    // if there are errors then return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    // check the user with the same email already exist
    try {
        
    
    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.status(400).json({success, error: "user with this email is already exists"})
    }
     const salt = await bcrypt.genSalt(10);
     secPass = await bcrypt.hash(req.body.password, salt);
    // create a new user
    user= await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
            id: user.id,
            }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
        success= true;
      res.json({success, authtoken})
    //   show error
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error found");
    }
})

// authenticate  a user using post "api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter valid Email').isEmail(),
    body('password', 'Password can not be blank').exists(),
], async (req, res)=>{
    let success =false
    // if there are errors then return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            success= false
            return res.status(400).json({success, error: "Please enter correct email and password"});
        }
            const passwordCompare = await bcrypt.compare(password, user.password);
            if(!passwordCompare){
                success= false
                return res.status(400).json({success, error: "Please enter correct email and password"});
            }

            const data = {
                user: {
                    id: user.id,
                    }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success= true;
              res.json({success, authtoken})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error found");
    }
})

// get loggedin user details using post "api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res)=>{
try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
} catch (error) {
    console.error(error.message);
    res.status(500).send("Error found");    
}
});

module.exports = router