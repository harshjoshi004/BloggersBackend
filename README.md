﻿# Blog Platform Backend

A full-featured Node.js + Express backend for Bloggers App with MongoDB and Passport.js authentication.

## Features

- **Authentication**: Passport.js with local strategy
- **Session Management**: Express-session with MongoDB store
- **Blog Management**: CRUD operations for blog posts
- **Search & Filter**: Text search and category filtering
- **Input Validation**: Comprehensive validation with express-validator
- **Security**: Password hashing with bcrypt, secure sessions
- **RESTful API**: Clean and organized API endpoints

## API Endpoints

### Authentication
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Blog Posts
- `GET /posts` - Get all posts (with search & filter)
- `GET /posts/:id` - Get single post
- `POST /posts` - Create new post (authenticated)
- `PUT /posts/:id` - Update post (owner only)
- `DELETE /posts/:id` - Delete post (owner only)

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start MongoDB
5. Run the application: `npm run dev`
