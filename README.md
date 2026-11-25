# ☕ BackedByChai

> *Turning caffeine into code, breaking down hard problems, and building in the open.*

Welcome to my developer corner! I'm on a journey of continuous learning—translating curiosity, raw effort, and a constant flow of hot chai into clean, efficient software.

---

## 🧭 About The Journey

`#backedbychai` is my personal philosophy:
- **Consistency over intensity:** Showing up every day, writing code, and learning from errors.
- **Learn in public:** Documenting what works, what breaks, and why.
- **Deep fundamentals:** Moving past surface-level tutorials to understand how systems operate under the hood.

---

## 🏗️ Backend Architecture (`BackedByChai` API)

A Node.js, Express 5, and MongoDB (Mongoose) backend featuring user registration, JWT-ready authentication models, password hashing, and local-to-Cloudinary media upload pipelines.

### Tech Stack
- **Runtime & Framework:** Node.js (ESM), Express `^5.3.0`
- **Database & ODM:** MongoDB Atlas, Mongoose `^9.12.0`, `mongoose-aggregate-paginate-v2`
- **Media Handling:** Multer `^2.5.0` (disk temp storage) + Cloudinary `^2.11.0`
- **Security & Utilities:** `bcrypt`, `jsonwebtoken`, `cors`, `cookie-parser`, `dotenv`

### Project Structure

```text
src/
├── index.js                      # Entry point: loads env, connects MongoDB, starts Express server
├── app.js                        # Express app setup (CORS, JSON/URL-encoded parsers, static, cookies, routes)
├── constants.js                  # App constants (DB_NAME = "haji")
├── db/
│   └── index.js                  # Mongoose connection helper
├── models/
│   ├── user.model.js             # User schema, bcrypt pre-save hook, JWT & password methods
│   └── video.model.js            # Video schema with aggregate pagination plugin
├── routers/
│   └── user.routers.js           # /api/v1/user routes + Multer field middleware
├── controllers/
│   └── user.controllers.js       # registerUser controller
├── middlewares/
│   └── multer.middleware.js      # Multer diskStorage saving uploads to ./public/temp
└── utils/
    ├── asyncHandler.js           # Promise wrapper for async route handlers
    ├── ApiError.js               # Standardized Error subclass
    ├── ApiResponse.js            # Standardized JSON response wrapper
    └── cloudinary.js             # Uploads local temp file to Cloudinary and deletes local copy
```

---

### 🚦 Express Middleware & Routes

**Global Middleware ([`src/app.js`](src/app.js)):**
- `cors({ origin: process.env.CORS_ORIGIN, credentials: true })`
- `express.json({ limit: "16kb" })` & `express.urlencoded({ extended: true, limit: "16kb" })`
- `express.static("public")`
- `cookieParser()`

**User Routes ([`src/routers/user.routers.js`](src/routers/user.routers.js)):** Mounted at `/api/v1/user`

| Method | Endpoint | Middleware | Controller | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/user/register` | `upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }])` | `registerUser` | Validates fields, checks duplicate `username`/`email`, uploads `avatar` (required) and `coverImage` (optional) to Cloudinary, hashes password, and creates the user. |

---

### 🗄️ Mongoose Schemas

#### 1. `User` ([`src/models/user.model.js`](src/models/user.model.js))
| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `username` | `String` | Required, unique, lowercase, trimmed, indexed |
| `email` | `String` | Required, unique, trimmed |
| `fullName` | `String` | Required, trimmed, indexed |
| `avatar` | `String` | Required (Cloudinary URL) |
| `coverImage` | `String` | Optional (Cloudinary URL) |
| `watchHistory` | `[ObjectId]` | References `Video` |
| `password` | `String` | Required; hashed with `bcrypt` (`10` salt rounds) in `pre("save")` hook |
| `refreshToken` | `String` | Stores refresh token |
| `timestamps` | `Boolean` | Auto-generates `createdAt` & `updatedAt` |

**Instance Methods:**
- `isPasswordCorrect(password)` — Compares plaintext password against hashed `password` via `bcrypt.compare`.
- `generateAccessToken()` — Signs JWT with `_id`, `email`, `username`, `fullName` using `ACCESS_TOKEN_SECRET` & `ACCESS_TOKEN_EXPIRY`.
- `generateRefreshToken()` — Signs JWT with `_id` using `REFRESH_TOKEN_SECRET` & `REFRESH_TOKEN_EXPIRY`.

#### 2. `Video` ([`src/models/video.model.js`](src/models/video.model.js))
| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `videoFile` | `String` | Required (Cloudinary URL) |
| `thumbnail` | `String` | Required (Cloudinary URL) |
| `title` | `String` | Required |
| `description` | `String` | Required |
| `duration` | `Number` | Required |
| `views` | `Number` | Default `0` |
| `isPublished` | `Boolean` | Default `true` |
| `owner` | `ObjectId` | References `User` |
| `timestamps` | `Boolean` | Auto-generates `createdAt` & `updatedAt` |

*Plugins:* `mongoose-aggregate-paginate-v2` attached for paginated aggregation queries.

---

### 🖼️ Multer & Cloudinary Media Handling

```text
Client (multipart/form-data)
   │
   ▼
Multer (src/middlewares/multer.middleware.js)
   │  Saves temporary file to ./public/temp/<originalname>
   ▼
Controller (src/controllers/user.controllers.js)
   │  Passes req.files paths to uploadOnCloudinary()
   ▼
Cloudinary Utility (src/utils/cloudinary.js)
   ├── Success ──► Deletes local temp file (fs.unlinkSync) & returns Cloudinary response (.url)
   └── Failure ──► Deletes local temp file (fs.unlinkSync) & returns null
```

---

### 🚀 Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure `.env`:**
   ```env
   PORT=8000
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET=your_access_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_secret
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. **Start the dev server:**
   ```bash
   npm run dev
   ```

---

### 🧪 API Testing Examples (Postman & cURL)

#### Postman (`POST /api/v1/user/register`)
1. Method: **`POST`**
2. URL: `http://localhost:8000/api/v1/user/register`
3. Body: Select **`form-data`**:
   - `fullName` (`Text`): `John Doe`
   - `username` (`Text`): `johndoe`
   - `email` (`Text`): `john@example.com`
   - `password` (`Text`): `Secret123`
   - `avatar` (`File`): Select an image file *(required)*
   - `coverImage` (`File`): Select an image file *(optional)*

#### cURL
```bash
curl -X POST http://localhost:8000/api/v1/user/register \
  -F "fullName=John Doe" \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "password=Secret123" \
  -F "avatar=@/path/to/avatar.jpg" \
  -F "coverImage=@/path/to/cover.jpg"
```

---

## 🛠️ Current Focus & Learning Roadmap

Here is what I'm actively working on and diving into:

```text
  [Core Concepts] ──────► [Tools & Systems] ──────► [Production Builds]
         │                         │                          │
   Data Structures            Git & SSH Flow            Scalable APIs
    & System Logic            Linux / Terminal           Clean Architectures
