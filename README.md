# AshaAssist - Digital Healthcare Platform

AshaAssist is a comprehensive digital platform that connects ASHA (Accredited Social Health Activist) workers with families in their communities, facilitating better healthcare service delivery and management.

## 🌟 Features

### 👥 User Module (Families & Individuals)
- **Authentication**: Google Sign-In + Standard Registration/Login
- **Beneficiary Categories**: Maternity Care & Palliative Care support
- **Health Profile Management**: Personal health profiles with category-specific details
- **Service Requests**: Home visits, medical supplies, life event notifications
- **Health Records**: Access to personal health history and reports
- **Dashboard**: Overview of visits, services, and health notifications
- **Feedback System**: Rate and provide feedback on ASHA worker services

### 🏥 ASHA Worker Module
- **Request Management**: Approve/reject service requests from families
- **Data Management**: Maintain health records, vaccination tracking, vital statistics
- **Supply Distribution**: Manage and track supply deliveries in real-time
- **Health Communication**: Post blogs, schedules, and community announcements
- **Calendar Integration**: Schedule management for visits and events
- **Digital Records**: MCP cards, vaccination records, health updates

### 👨‍💼 Admin Module
- **Review & Verification**: Approve vital statistics and records
- **Content Management**: Manage health content and announcements
- **ASHA Management**: Manage worker profiles and accounts
- **Statistics & Reports**: Ward-level analytics and reporting
- **System Oversight**: Monitor platform usage and performance

## 🛠 Tech Stack

- **Frontend**: React.js with TypeScript, CSS3, React Router
- **Backend**: Flask (Python) with RESTful APIs
- **Database**: MongoDB for flexible document storage
- **Authentication**: JWT tokens + Google OAuth integration
- **Styling**: Custom CSS with modern design patterns
- **State Management**: React Context API
- **Form Handling**: React Hook Form with validation

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

### 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd AshaAssist
```

2. **Install root dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install --legacy-peer-deps
cd ..
```

4. **Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

5. **Set up environment variables**

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

**Frontend (.env)**
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

6. **Start MongoDB**
```bash
# On Windows
mongod

# On macOS (with Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

7. **Start the application**

**Option 1: Using PowerShell script (Windows)**
```powershell
.\start.ps1
```

**Option 2: Manual startup**
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm start
```

**Option 3: Using root package.json**
```bash
npm run dev
```

### 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
AshaAssist/
├── frontend/                 # React TypeScript application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── context/        # React Context providers
│   │   ├── services/       # API service functions
│   │   ├── styles/         # CSS stylesheets
│   │   └── App.tsx         # Main App component
│   ├── package.json
│   └── .env
├── backend/                 # Flask Python API
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
├── start.ps1              # Windows startup script
├── package.json           # Root package configuration
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=ashaassist
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_NAME=AshaAssist
REACT_APP_VERSION=1.0.0
```

## 🎯 User Registration Flow

1. **Landing Page**: Overview of platform features and benefits
2. **Registration**: Choose user type (Family/Individual, ASHA Worker, Admin)
3. **Beneficiary Category**: Select care type (Maternity or Palliative) for families
4. **Profile Setup**: Complete personal and health information
5. **Dashboard Access**: Access personalized dashboard based on user type

## 🔐 Authentication System

### **User Registration**
- **Open Registration**: Only available for families/individuals
- **Real-time Validation**: Email, password strength, phone number validation
- **Care Categories**: Maternity Care and Palliative Care options

### **Pre-defined Accounts**
For realistic healthcare scenarios, ASHA workers and administrators have pre-defined accounts:

#### **ASHA Worker Account**
- **Role**: Community Health Activist for Ward 1
- **Access**: Pre-assigned by health department
- **Contact**: Local health department for credentials

#### **Administrator Account**
- **Role**: Panchayat Health Representative for Ward 1
- **Access**: Pre-assigned by health department
- **Contact**: Local health department for credentials

> **Security Note**: Credentials are not publicly displayed and must be obtained through proper channels.

### **Security Features**
- **JWT Tokens**: Secure session management
- **Role-based Access**: Different interfaces for different user types
- **Password Security**: Encrypted password storage with bcrypt
- **Real-time Validation**: Form validation while typing

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive layout for tablets
- **Desktop Experience**: Full-featured desktop interface
- **Cross-Browser**: Compatible with modern browsers

## 🚦 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Health Check
- `GET /api/health` - API health status

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (when implemented)
cd backend
python -m pytest
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# The build folder will contain the production-ready files
```

### Environment Setup
- Set `FLASK_ENV=production` in backend
- Configure production MongoDB instance
- Set up proper SSL certificates
- Configure reverse proxy (nginx/Apache)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/AshaAssist/issues) page
2. Ensure all prerequisites are installed
3. Verify MongoDB is running
4. Check environment variable configuration
5. Review console logs for error messages

## 🙏 Acknowledgments

- ASHA workers for their dedication to community healthcare
- Healthcare professionals who inspired this platform
- Open source community for the amazing tools and libraries