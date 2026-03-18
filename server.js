import exp from 'express'
import {connect} from 'mongoose'
import {config} from 'dotenv'
import cookieParser from 'cookie-parser'
import { userRoute } from './APIs/UserAPI.js'
import { authorRoute } from './APIs/AuthorAPI.js'
import { adminRoute } from './APIs/AdminAPI.js'
import { commonRouter } from './APIs/CommonAPI.js'
import cors from 'cors'

config()

const app = exp()

// ── CORS ──────────────────────────────────────────────────────────────────────
// Must be the FIRST middleware, BEFORE routes.
// No trailing slash on the Vercel origin — the browser sends an exact origin string.
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://capstone-frontend-olive.vercel.app"   // ← removed trailing slash
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}

app.use(cors(corsOptions))

// Explicitly answer all pre-flight OPTIONS requests BEFORE any route handler.
app.options('*', cors(corsOptions))

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(exp.json())
app.use(cookieParser())

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/user-api',   userRoute)
app.use('/author-api', authorRoute)
app.use('/admin-api',  adminRoute)
app.use('/common-api', commonRouter)

// ── DB + Server ───────────────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL)
    console.log("DB connected successfully")
    // Render injects PORT automatically; fallback to 4000 for local dev
    app.listen(process.env.PORT || 4000, () => console.log(`Server started on port ${process.env.PORT || 4000}`))
  } catch (err) {
    console.log("DB connection failed", err)
  }
}

connectDB()

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  console.log("Invalid path:", req.url)
  res.status(404).json({ message: req.url + " is an invalid path" })
})

// ── Error handling middleware ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.log("Error name:", err.name)
  console.log("Error code:", err.code)
  console.log("Full error:", err)

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error occurred", error: err.message })
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "error occurred", error: err.message })
  }

  const errCode   = err.code     ?? err.cause?.code          ?? err.errorResponse?.code
  const keyValue  = err.keyValue ?? err.cause?.keyValue       ?? err.errorResponse?.keyValue

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0]
    const value = keyValue[field]
    return res.status(409).json({ message: "error occurred", error: `${field} "${value}" already exists` })
  }

  if (err.status) {
    return res.status(err.status).json({ message: "error occurred", error: err.message })
  }

  res.status(500).json({ message: "error occurred", error: "Server side error" })
})



app.use((err, req, res, next) => {

  console.log("Error name:", err.name);
  console.log("Error code:", err.code);
  console.log("Full error:", err);

  // mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //HANDLE CUSTOM ERRORS
  if (err.status) {
    return res.status(err.status).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // default server error
  res.status(500).json({
    message: "error occurred",
    error: "Server side error",
  });
});