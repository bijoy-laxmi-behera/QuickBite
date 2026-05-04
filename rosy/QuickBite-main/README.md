# 🍽️ QuickBite

### A Full-Stack Online Food Ordering Platform

QuickBite is a scalable and modern full-stack food ordering application designed to deliver a seamless user experience for browsing restaurants, placing orders, and managing deliveries. The platform follows industry-standard architecture with a responsive frontend and a secure RESTful backend.

---

## 📌 Overview

QuickBite enables customers to explore a wide range of restaurants, customize their orders, and track them efficiently. The system is built with a focus on performance, usability, and maintainability.

---

## ✨ Key Features

### 👤 Customer Module

* Secure authentication using JWT
* Browse restaurants and menus
* Add items to cart and place orders
* Manage delivery addresses
* Mark favorites for quick access
* View order history

### 🛠️ Admin Module

* Restaurant and menu management (CRUD operations)
* Order management system
* Image upload and storage via Cloudinary
* Centralized data handling

---

## 🧱 Architecture

The application follows a **client-server architecture**:

* **Frontend**: Handles UI/UX and user interactions
* **Backend**: Manages business logic and APIs
* **Database**: Stores users, orders, and product data

---

## 🧑‍💻 Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose ODM)
* JSON Web Tokens (JWT)

### Integrations

* Cloudinary (Media Storage)
* Multer (File Upload Handling)

---

## 📂 Project Structure

```
QuickBite/
│
├── frontend/                 # Client-side application
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── assets/
│
├── backend/                 # Server-side application
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
├── .env                     # Environment variables
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/QuickBite.git
cd QuickBite
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_key
CLOUD_API_SECRET=your_cloudinary_secret
```

Run the backend server:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 API Highlights

| Module    | Endpoint                       | Description      |
| --------- | ------------------------------ | ---------------- |
| Auth      | `/api/auth/register`           | Register user    |
| Auth      | `/api/auth/login`              | Login user       |
| Customer  | `/api/customers/me`            | Get profile      |
| Orders    | `/api/orders`                  | Create order     |
| Favorites | `/api/customers/me/favourites` | Manage favorites |

---

## 🔒 Security Practices

* Password hashing using bcrypt
* Token-based authentication (JWT)
* Protected API routes
* Environment variable management

---

## 🚀 Future Enhancements

* Real-time order tracking (WebSockets / Socket.io)
* Online payments (Stripe / Razorpay integration)
* Role-based access control (RBAC)
* Progressive Web App (PWA) support
* Advanced analytics dashboard for admins

---

## 📸 Screenshots

> Add UI screenshots or GIFs here to demonstrate functionality

---

## 🤝 Contributing

Contributions are welcome. Please follow standard Git workflow:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Rojalin Mohanty**
Master of Computer Applications (MCA)
Aspiring Full-Stack Developer

---

## ⭐ Acknowledgements

This project was developed as part of a full-stack learning journey, focusing on building real-world scalable applications.

---
