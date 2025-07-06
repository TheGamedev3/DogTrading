# Project Structure Overview

This project is split into two main sections:

- **Logic** — handles all server-side logic and database storage.  
- **Site** — handles routing, requests, and rendering pages for the client.

There's also:

- **TestHelpers** — which contains all the shorthand code the mocha and chai tests use to easily access and interact with routes

---

## 💽 Logic

```
Logic/
├── interactions/    (@Chemicals)
├── models/          (@MongooseAPI)
└── seeder/          (@Seeder)
```

### 🏗️ `models` (`@MongooseAPI`)
- Handles all MongoDB logic:
  - Connection setup
  - Schema creation
  - Pagination utilities

### 🧪 `interactions` (`@Chemicals`)
- Defines core objects like:
  - `Dog`
  - `Offer`
  - `Owner`
- Each object contains custom methods and encapsulated behavior.

### 🌱 `seeder` (`@Seeder`)
- Populates the database with test data (dummy accounts and dogs).
- Automatically runs if the database is empty.
- Updates `DB_Info.seeded = true` after seeding completes.

---

## 🌐 Site

```
Site/
├── DOMtools/
├── middlewares/
├── pages/
├── requests/
├── routeMaker/
├── views/
├── app.js
└── launcher.js
```

### 🚀 `launcher.js`
- Bootstraps the app.
- Applies base middleware like:
  - `cookie-parser`
  - `express.json()`

### 🧩 `app.js`
- Central hub where everything comes together:
  - Loads core middleware (e.g., `UserVerifying.js`, `CORS.js`)
  - Injects custom routes from `pages/` and `requests/` into Express.

### 🛡 `middlewares/`
- Contains custom middleware:
  - `CORS.js`: enables safe browser-based requests.
  - `UserVerifying.js`: handles JWT-based session verification.

> ⚠️ Auth-protected routes (like editing your profile) require a valid JWT.

### 🔁 `requests/`
- Contains **backend routes** that:
  - Perform actions (e.g., trading, editing)
  - Return JSON data

### 🖼 `pages/`
- Contains **frontend routes** that:
  - Serve `.ejs` page templates
  - Pass in preloaded server-side data

### 🪟 `views/`
- Contains actual `.ejs` HTML templates rendered by Express.

### ⚙️ `DOMtools/`
- A public folder served to the client.
- Contains helper utilities like `staticHelpers.js` for DOM reactivity (React-inspired, no framework).

### 🔧 `routeMaker/`
- Simplifies route creation via reusable boilerplate functions.

---

## 📤 Request Flow

1. **Page Load**  
   A route in `pages/` loads a `.ejs` file via Express.

2. **Client-side Request**  
   The frontend sends a request (e.g., trade or data fetch) to a route in `requests/`.

3. **Form Feedback & Errors**  
   If the server encounters validation errors:
   - `err_catcher()` returns a breakdown of failed fields.
   - These are shown directly under each field in the form.



# Module Format Note
This project primarily uses CommonJS (CJS) rather than modern ES Modules (ESM).
This decision was made to maintain consistency with the tutorial materials provided in the assignment, which also relied on CommonJS syntax.

As a result, certain dependencies—such as the Mocha and Chai testing frameworks—are pinned to older versions to ensure compatibility with the CJS-based structure.