# 🏦 Butter Money

This full-stack application allows Butter Money to efficiently process customer documents. The app provides a user-friendly dashboard for uploading, viewing, editing, and managing customer documents, ensuring a smooth and streamlined document processing experience.

---

## 🚀 Setup Instructions

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### **2. Install Dependencies**

➡️ **Backend Dependencies**
```bash
cd backend
npm install
```

➡️ **Frontend Dependencies**
```bash
cd ../frontend
npm install
```

### **3. Configure Environment Variables**

Create a `.env` file in the backend directory.

➡️ **Backend .env**  
Create a `.env` file in the backend folder:
```env
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
FRONTEND_URL=your_frontend_url"
```

### **4. Set Up the Database**
- Create a PostgreSQL database.
- Run Prisma migrations to set up the schema:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### **5. Start the Backend Server**
```bash
cd backend
tsc -b
node dist\index.js
```

### **6. Start the Frontend Server**
```bash
cd frontend
npm run dev
```

### **7. Access the Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

---

## ✅ Features Implemented

### 🔐 Authentication
- User signup & login with JWT-based authentication.

### 📂 PDF Management
- Upload PDF files from the dashboard.
- View list of uploaded PDFs.
- View and Edit extracted PDF content.
- Download PDFs directly from the dashboard.

### 📝 Editing
- Edit extracted text directly from the dashboard and save changes.

### ⚙️ User Dashboard
- Centralized dashboard for managing all uploaded files and extracted content.

---

## 🛠️ Technologies Used

### Frontend:
- Vite – Fast build tool
- React – Frontend framework
- TypeScript – Type-safe JavaScript
- Tailwind CSS + Shadcn – Styling framework
- React-pdf – Display and Render PDF files

### Backend:
- Express.js – Node.js web framework
- Prisma – ORM for database access
- JWT – Authentication
- Multer – File uploads
- pdf-parse – Extract text and metadata

### Database:
- PostgreSQL

---

## 💡 Challenges Faced and Solutions

1. **PDF Files Not Displaying in Dashboard**  
   - **Challenge:** After uploading PDFs, the files were not being displayed on the dashboard due to incorrect file path and MIME type issues.  
   - **Solution:** Configured `express.static()` correctly to serve files from the `/uploads` directory and ensured proper MIME type handling in the frontend.   

2. **CORS Errors Between Frontend and Backend**  
   - **Challenge:** The frontend couldn't communicate with the backend due to CORS policy restrictions.  
   - **Solution:** Enabled CORS with some add on's in the backend to allow communication from different origins.  

3. **PDF Viewer Not Displaying Content**  
   - **Challenge:** The PDF viewer was not displaying content due to incorrect MIME type and file path issues.  
   - **Solution:** Ensured the correct MIME type (`application/pdf`) and used the correct file path in the `iframe src` attribute.  

4. **Backend Not Detecting Uploaded Files**  
   - **Challenge:** The backend was failing to detect uploaded files due to misconfiguration in Multer and file permissions.  
   - **Solution:** Ensured Multer was correctly configured and files were saved with appropriate read and write permissions.  


## Usage Guide

1. Open the frontend URL in your browser.
2. Sign up or log in to access the dashboard.
3. Upload a PDF file using the "Upload" button.
4. View, edit, or download the file from the dashboard.
