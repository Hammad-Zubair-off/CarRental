import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next)=>{
    const token = req.headers.authorization;
    if(!token){
        return res.json({success: false, message: "not authorized"})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = typeof decoded === 'string' ? decoded : decoded.id

        if(!userId){
            return res.json({success: false, message: "not authorized"})
        }
        req.user = await User.findById(userId).select("-password")
        if(!req.user){
            return res.json({success: false, message: "not authorized"})
        }
        next();
    } catch (error) {
        return res.json({success: false, message: "not authorized"})
    }
}

export const requireOwner = (req, res, next)=>{
    if(req.user?.role !== 'owner'){
        return res.json({success: false, message: "Unauthorized"})
    }
    next();
}
