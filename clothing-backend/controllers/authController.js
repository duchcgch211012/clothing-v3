import User from "../models/UserModels.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const publicUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  phone: user.phone,
  address: user.address,
})

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET environment variable")
  }

  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  )
}

export const register = async (req, res) => {
  try {
    const username = req.body.username?.trim()
    const email = req.body.email?.trim().toLowerCase()
    const { password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json("Missing fields")
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json("Email already exists")
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({
      username,
      email,
      password: hashed,
    })

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      data: publicUser(user),
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ success: false, message: "Server error while registering" })
  }
}

export const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase()
    const { password } = req.body

    if (!email || !password) {
      return res.status(400).json("Missing fields")
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json("User not found")

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json("Wrong password")

    const token = signToken(user)

    res.json({
      token,
      user: publicUser(user),
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ success: false, message: "Server error while logging in" })
  }
}
