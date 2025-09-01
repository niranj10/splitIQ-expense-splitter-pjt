SplitIQ: MERN Stack Expense Splitter
This repository contains the complete source code for SplitIQ, a feature-rich expense splitting application inspired by Splitwise. It is structured as a monorepo, containing both the backend API and the frontend web application in separate folders.

Key Features
Full-Stack Application: Built with the MERN stack (MongoDB, Express.js, React, Node.js).

Secure Authentication: User registration and login handled by JWT (JSON Web Tokens).

Group & Expense Management: Create groups, add/remove members, and track expenses.

Advanced Splitting: Supports splitting expenses equally, by exact amounts, or by shares.

Dynamic UI: A responsive frontend built with React, Redux Toolkit for state management, and styled with Tailwind CSS.

Dark Mode: Includes a theme toggle for a better user experience.

CI/CD Ready: The project is structured for easy deployment with automated pipelines on platforms like Vercel and Render.

Project Structure
This repository is a monorepo containing two main projects:

/expense-splitter-backend: The Node.js and Express.js backend API.

/expense-splitter-frontend: The React frontend application.

Please refer to the README file inside each sub-directory for instructions on how to run them locally.

Getting Started
Prerequisites
Node.js (LTS version)

MongoDB (A free MongoDB Atlas cluster is recommended)

A code editor like VS Code

Installation & Setup
Clone the repository:

git clone [https://github.com/your-username/splitiq-project.git](https://github.com/your-username/splitiq-project.git)
cd splitiq-project

Setup the Backend:

cd expense-splitter-backend
npm install
# Create a config/config.env file with your variables (MONGO_URI, JWT_SECRET)
npm start

Setup the Frontend:

cd ../expense-splitter-frontend
npm install
npm start

The frontend will be available at http://localhost:3000 and the backend at http://localhost:5000.
