# Quick Start Guide - Hostel Management System

## 🚀 Getting Started

### Step 1: Navigate to Project Directory
```bash
cd /home/smasure/wishtreeUpskilling/react-project/hostel-management-system
```

### Step 2: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 3: Start Development Server
```bash
npm run dev
```

The application will be available at: **http://localhost:5173**

## 📝 Testing the Application

### 1. Home Page
- Visit the home page to see features and options
- Click "Sign In" or "Register" to get started

### 2. Registration (Try First Time)
- Click "Register" button
- Fill in all required fields:
  - Full Name: e.g., "John Doe"
  - PNR Number: e.g., "12345"
  - Email: e.g., "john@college.edu"
  - Gender: Select Male/Female/Other
  - Password: At least 6 characters
  - Confirm Password: Must match password
- Click "Register" button
- You'll be redirected to Sign In page

### 3. Sign In
- Use the email/PNR and password you registered with
- Click "Sign In"
- You'll be redirected to Dashboard

### 4. Dashboard
- View college details
- See two main options:
  - **Book Hostel**: Browse available hostels
  - **My Applications**: Track your applications

### 5. Book Hostel
- View all hostels available for your gender
- Click "View Details" on any hostel card
- Review hostel information and required documents
- Click "Apply Now"

### 6. Application Form
- Fill in academic and personal details:
  - Year in College
  - Branch
  - Date of Birth
  - Caste Category
- Click "Submit Application"
- Application will be added to your applications list

### 7. View Applications
- Click "My Applications" on dashboard
- See all submitted applications
- Check status: Pending, Accepted, or Rejected
- For accepted applications: View room number and floor
- For rejected applications: View rejection reason

## 🎨 Sample Data

### Pre-loaded Hostels
1. **Paradise Hostel** (Male)
   - Admin: Mr. Raj Kumar
   - Seats: 5
   - Price: ₹3000/month

2. **Sunshine Girls Hostel** (Female)
   - Admin: Mrs. Priya Singh
   - Seats: 3
   - Price: ₹2500/month

3. **Tech Hostel** (Male)
   - Admin: Mr. Vikram Patel
   - Seats: 8
   - Price: ₹3500/month

4. **Lotus Girls Hostel** (Female)
   - Admin: Mrs. Anjali Sharma
   - Seats: 2
   - Price: ₹4000/month

### Sample Application Statuses
- Some pre-loaded applications show different statuses (Pending, Accepted, Rejected)

## 🔗 Navigation Guide

| Page | URL | Requirement |
|------|-----|-------------|
| Home | `/` | Public |
| Sign In | `/signin` | Public |
| Register | `/register` | Public |
| About | `/about` | Public |
| Contact | `/contact` | Public |
| Dashboard | `/dashboard` | Authenticated |
| Book Hostel | `/book-hostel` | Authenticated |
| Hostel Details | `/hostel-details/:id` | Authenticated |
| Application Form | `/application-form/:id` | Authenticated |
| My Applications | `/applications` | Authenticated |

## 🎯 Key Features to Test

1. ✅ **Gender-based Filtering**: Male students see male hostels, female students see female hostels
2. ✅ **Form Validation**: Try submitting empty forms to see validation messages
3. ✅ **Protected Routes**: Try accessing `/dashboard` without signing in - you'll be redirected
4. ✅ **Application Status Tracking**: Submit multiple applications and track their status
5. ✅ **Responsive Design**: Try resizing the browser window to see responsive layout
6. ✅ **Light Theme**: Consistent light color scheme throughout the app

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will use the next available port. Check the terminal output for the actual URL.

### Styling Not Showing
Ensure all CSS files are being loaded. Check the browser console for any CSS loading errors.

### Redux Not Working
Make sure Redux Provider is correctly set up in `main.jsx` and the store is properly configured.

## 📚 Component Hierarchy

```
App (with Routes)
├── Layout
│   ├── Header
│   ├── Main Content (Page Component)
│   └── Footer
└── Various Pages (Home, Dashboard, etc.)
```

## 🛠️ Build Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm lint
```

## 💡 Tips

- Use browser DevTools to inspect Redux state: Install Redux DevTools browser extension
- Check Console for any error messages
- All data is stored in Redux state (not persistent - refreshing clears data)
- Each new page load creates a fresh state

## 📞 Support

For detailed documentation, see `PROJECT_DOCUMENTATION.md`

Enjoy exploring the Hostel Management System! 🎓
