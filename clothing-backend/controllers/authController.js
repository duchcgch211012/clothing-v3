import User from "../models/UserModels.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json("Missing fields")
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json("Email already exists")
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({
      username,
      email,
      password: hashed
    })

    res.json(user)

  } catch (error) {
    res.status(500).json(error.message)
  }
}


export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json("Missing fields")
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json("User not found")

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json("Wrong password")

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({ token, user })

  } catch (error) {
    res.status(500).json(error.message)
  }
}