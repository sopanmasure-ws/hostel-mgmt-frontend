# Hostel Management System

A comprehensive React-based hostel management system that allows students to sign up, register, browse available hostels, and manage their hostel applications.

## Features

### 🔐 Authentication
- **Sign In**: Students can sign in using email/PNR number and password
- **Register**: New students can register with:
  - Full Name
  - PNR Number
  - Email
  - Gender (Male/Female/Other)
  - Password (with confirmation)

### 🏨 Hostel Booking
- **Browse Hostels**: View available hostels filtered by student gender
- **Hostel Details**: View detailed information about each hostel including:
  - Hostel Admin name
  - Seats available
  - Price per month
  - Required documents
  - Description
- **Application Form**: Submit hostel applications with:
  - Year in college
  - Caste category
  - Date of birth
  - Branch/Stream
  - Automatic fields (Name, Email, PNR)

### 📋 Application Management
- **Track Applications**: View all submitted hostel applications
- **Application Status**: Check real-time status:
  - **Pending**: Application under review
  - **Accepted**: Application approved with room number and floor details
  - **Rejected**: Application rejected with reason

### 🏫 College Details
- View college information on the dashboard
- College name: Tech College of Engineering
- Location: New Delhi, India
- Affiliation: University of Delhi

### 🎨 User Interface
- **Header**: Logo, title, navigation buttons (Home, About, Contact), and user profile
- **Footer**: College name and copyright information
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Light Theme**: Soothing light color palette throughout the application

## Tech Stack

- **Frontend Framework**: React 19.2.0
- **State Management**: Redux (@reduxjs/toolkit)
- **Routing**: React Router DOM 6.21.0
- **Build Tool**: Vite 7.2.4
- **Styling**: CSS3 with light theme color palette

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── Layout.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── SignIn.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── BookHostel.jsx
│   ├── HostelDetails.jsx
│   ├── ApplicationForm.jsx
│   ├── Applications.jsx
│   ├── About.jsx
│   └── Contact.jsx
├── redux/              # Redux store and slices
│   ├── store.js
│   ├── authSlice.js
│   ├── hostelSlice.js
│   └── applicationSlice.js
├── styles/             # CSS files
│   ├── global.css
│   ├── header.css
│   ├── footer.css
│   ├── layout.css
│   ├── auth.css
│   ├── home.css
│   ├── dashboard.css
│   ├── hostel.css
│   ├── hostel-details.css
│   ├── application-form.css
│   ├── applications.css
│   ├── about.css
│   └── contact.css
├── utils/              # Utility functions
├── App.jsx            # Main app component with routing
├── main.jsx           # Entry point with Redux Provider
└── index.css          # Base styles
```

## Redux State Structure

### Auth Slice
- `user`: Current logged-in user data
- `isAuthenticated`: Authentication status
- `loading`: Loading state
- `error`: Error messages

### Hostel Slice
- `hostels`: Array of all available hostels
- `selectedHostel`: Currently selected hostel
- `filteredHostels`: Hostels filtered by gender
- `applicationForm`: Application form data

### Application Slice
- `applications`: Array of submitted applications
- `newApplicationId`: Counter for new application IDs

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Color Palette (Light Theme)

- **Primary Color**: #4a90e2 (Blue)
- **Secondary Color**: #f5a623 (Orange)
- **Success Color**: #7ed321 (Green)
- **Danger Color**: #d0021b (Red)
- **Light Background**: #f8f9fa
- **White**: #ffffff
- **Text Dark**: #333333
- **Text Light**: #666666
- **Border Color**: #e0e0e0

## User Flow

1. **Landing Page** → Home page with information and sign in/register buttons
2. **Authentication** → Sign in or register
3. **Dashboard** → View college details and choose action
4. **Book Hostel** → Browse available hostels (filtered by gender)
5. **Hostel Details** → View hostel information and required documents
6. **Application Form** → Fill and submit application
7. **Applications** → Track application status

## Features Highlights

✅ Gender-based hostel filtering
✅ Real-time application status tracking
✅ Responsive design
✅ Light color theme for reduced eye strain
✅ Protected routes for authenticated users
✅ Redux state management for scalability
✅ Form validation
✅ Mock data with sample hostels and applications

## Sample Test Credentials

You can use any email and password (minimum 6 characters) to sign in and register in the demo.

Example:
- Email: student@college.edu
- Password: password123

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Backend API integration
- Payment gateway for hostel fees
- Admin panel for hostel management
- Email notifications
- SMS alerts
- Document upload functionality
- Room allocation algorithm
- Feedback and rating system
- Real-time chat support

## License

This project is created for educational purposes.

## Support

For any issues or questions, please contact: support@hostel.college
Phone: +91 1234567890
