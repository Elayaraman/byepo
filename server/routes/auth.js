import express from 'express'
const router = express.Router()

router.post('/signup', (req, res) => {
  // placeholder signup route
  res.json({ success: true, message: 'signup route ready' })
})

router.post('/login', (req, res) => {
  // placeholder login route
  res.json({ success: true, message: 'login route ready' })
})

export default router