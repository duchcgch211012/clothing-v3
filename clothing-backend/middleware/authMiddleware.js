import jwt from "jsonwebtoken"

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

  
    if (!authHeader) {
      return res.status(401).json("No token provided")
    }

  
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json("Invalid token format")
    }

    const token = authHeader.split(" ")[1]


    const decoded = jwt.verify(token, process.env.JWT_SECRET)


    req.user = decoded

    next()

  } catch (error) {
    console.log("Auth error:", error.message)

    return res.status(401).json("Token is not valid or expired")
  }
}