DHA Estate Pro
A full-stack real estate platform for property listings in DHA Karachi. Buyers and tenants can explore properties, save favourites, send inquiries, and request viewings. Owners and agents can manage listings and leads, while admins review listings and manage platform users.
Features
- Property search: Filter listings by property type, phase, price, bedrooms, bathrooms, furnishing, and possession status.
- Listing approval: New listings remain pending until an admin approves them.
- Role-based dashboards: Separate permissions and workflows for buyers/tenants, owners, agents, and admins.
- Inquiries and leads: Track inquiries through Pending, Contacted, and Closed.
- Viewing appointments: Request and manage viewings, with server-side checks for overlapping bookings.
- Favourites and directories: Save properties and browse agents, projects, and blog posts.
- Payment sandbox: Record test payments and generate receipt numbers after sandbox confirmation. No live payment gateway is connected.
Tech Stack
Area	Technology
Frontend	React 18, Vite, React Router, Tailwind CSS
Backend	Node.js, Express
Database	MongoDB, Mongoose
Authentication	JWT access and refresh tokens


Getting Started
Requirements
- Node.js 20 or later
- MongoDB Atlas account or a local MongoDB instance
- npm
1. Set up the backend
cd backend
cp .env.example .env
npm install
Update backend/.env with your own configuration. To load the optional demo data and start the API:
npm run seed
npm run dev
The API runs at http://localhost:5000 by default.
2. Set up the frontend
Open another terminal:
cd frontend
npm install
npm run dev
Vite will show the local frontend URL, usually http://localhost:5173.

If needed, set the API URL in frontend/.env:
VITE_API_URL=http://localhost:5000/api
If VITE_API_URL is not set, the frontend uses http://localhost:5000/api by default.
Environment Variables
Backend — backend/.env
Variable	Purpose
PORT	API port; defaults to 5000
MONGODB_URI	MongoDB connection string
DB_NAME	Database name; defaults to dhaestatepro
JWT_SECRET	Secret used to sign access tokens
JWT_REFRESH_SECRET	Secret used to sign refresh tokens
NODE_ENV	Runtime environment, such as development or production


Frontend — frontend/.env
Variable	Purpose
VITE_API_URL	Backend API base URL, including /api


Keep real credentials and secrets in your local .env file or hosting provider's environment settings. Never commit a populated .env file to GitHub. Use .env.example as a template.
User Roles
Role	Main permissions
USER	Browse properties, save favourites, submit inquiries, request viewings, and view own payment records
OWNER	Buyer features plus create and manage own property listings
AGENT	Manage assigned listings, inquiries, and viewings; view listing analytics
ADMIN	Manage users, review listings, and access platform-wide data and analytics


Public registration creates a USER account. Higher-privilege roles must be assigned by an admin.
Listing and Viewing Workflows
Listing approval
1. An owner or agent submits a property.
2. The listing is marked Pending.
3. An admin approves or rejects it.
4. Only approved listings appear in public property pages.
Viewing appointments
Viewings can be requested, confirmed, rescheduled, cancelled, or marked completed. The backend checks for overlapping active bookings for the same property or agent.
Main Pages
- Home and property listings
- Property details
- Agents directory
- Projects and blogs
- Contact page
- User dashboards and profile
- Favourites and inquiries
- Property management and listing verification
- Viewing appointments and payment records
- 404 page
Project Structure
RealStateApp/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   └── middleware/
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── ...
    └── public/
        └── images/
This is a simplified overview; exact folders may vary with the current codebase.
Current Limitations
- Payments use a sandbox flow; a live payment gateway is not integrated.
- Email verification and password reset are not yet implemented.
- Automated API tests for key workflows are planned.
Security Notes
- Authorization is enforced by the backend, not only by hiding frontend controls.
- Do not publish production secrets, real credentials, or private environment files.
- Demo accounts and seeded data are intended for local testing. Change or remove them before any public deployment.
Future Improvements
- Integrate a real payment provider.
- Add email verification and password reset.
- Add automated tests for listing verification, viewing appointments, and payment workflows.
