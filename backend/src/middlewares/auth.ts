// middlewares/auth.ts
import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User from "../models/User"

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || ""

    console.log("Auth header present:", !!authHeader)

    if (!authHeader) {
      console.error("Authorization header missing")
      return res.status(401).json({ error: "Not authorized - Missing authorization header" })
    }

    if (!String(authHeader).startsWith("Bearer ")) {
      console.error("Invalid authorization format:", String(authHeader).slice(0, 40))
      return res.status(401).json({ error: "Not authorized - Invalid authorization format" })
    }

    const parts = String(authHeader).split(" ")
    if (parts.length !== 2) {
      console.error("Malformed authorization header")
      return res.status(401).json({ error: "Not authorized - Malformed authorization header" })
    }

    const token = parts[1]

    if (!token || token === "undefined" || token === "null") {
      console.error("Token is empty or invalid:", token)
      return res.status(401).json({ error: "Not authorized - Token is empty" })
    }

    const secret = process.env.JWT_SECRET || "secret"
    let payload: any

    try {
      payload = jwt.verify(token, secret)
    } catch (jwtError: any) {
      console.error("JWT verification failed:", jwtError.message)
      return res.status(401).json({ error: "Not authorized - Invalid or expired token" })
    }

    if (!payload || !payload.id) {
      console.error("JWT payload missing user ID")
      return res.status(401).json({ error: "Not authorized - Invalid token payload" })
    }

    const user = await User.findById(payload.id).select("-password")
    if (!user) {
      console.error("User not found for ID:", payload.id)
      return res.status(401).json({ error: "Not authorized - User not found" })
    }

    req.user = user
    next()
  } catch (err: any) {
    console.error("Auth middleware error:", err.message)
    return res.status(500).json({ error: "Internal server error during authentication" })
  }
}

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin resource" })
  }
  next()
}

export const checkSubscription = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: "Not authorized",
      code: "UNAUTHORIZED"
    })
  }

  if (req.user.subscriptionStatus !== 'paid') {
    return res.status(403).json({ 
      error: "Premium subscription required",
      code: "SUBSCRIPTION_REQUIRED",
      subscriptionStatus: req.user.subscriptionStatus,
      message: "Only paid members can access this feature"
    })
  }

  next()
}
