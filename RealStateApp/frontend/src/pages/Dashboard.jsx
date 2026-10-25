import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  Heart, 
  PlusSquare, 
  FileText, 
  Trash, 
  LogOut, 
  Eye, 
  Users, 
  FolderKanban, 
  BarChart3, 
  Edit2, 
  X, 
  Check,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL, API_ORIGIN } from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout, updateProfile } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('profile'); // profile, favorites, add-property, my-properties, leads, admin-users, admin-projects, user-leads

  // Open a specific tab via URL, e.g. /dashboard?tab=favorites from the Header menu
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'favorites') setActiveTab('favorites');
  }, [searchParams]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile update form states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  
  // Property Creation/Edit form states (Agent/Admin)
  const [editPropertyId, setEditPropertyId] = useState(null);
  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');
  const [propPrice, setPropPrice] = useState('');
  const [propArea, setPropArea] = useState('500 Sq. Yd.');
  const [propType, setPropType] = useState('HOUSE');
  const [propStatus, setPropStatus] = useState('BUY');
  const [propBeds, setPropBeds] = useState('4');
  const [propBaths, setPropBaths] = useState('4');
  const [propLoc, setPropLoc] = useState('');
  const [propPhase, setPropPhase] = useState('Phase 6');
  const [propPoss, setPropPoss] = useState('Ready');
  const [propFurn, setPropFurn] = useState('Unfurnished');
  const [propImg1, setPropImg1] = useState('/images/1613977257363-707ba9348227.jpg');
  const [propImg2, setPropImg2] = useState('/images/1600585154340-be6161a56a0c.jpg');
  const [uploadMsg, setUploadMsg] = useState('');

  // Project Creation/Edit form states (Admin)
  const [editProjectId, setEditProjectId] = useState(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLoc, setProjLoc] = useState('');
  const [projPhase, setProjPhase] = useState('Phase 8');
  const [projStatus, setProjStatus] = useState('Under Construction');
  const [projPriceStarting, setProjPriceStarting] = useState('4.5 Crore');
  const [projAreaRange, setProjAreaRange] = useState('250 - 500 Sq. Yd.');
  const [projImg1, setProjImg1] = useState('/images/1545324418-cc1a3fa10c00.jpg');
  const [projIsFeatured, setProjIsFeatured] = useState(false);

  // Operational states for properties, analytics, leads, and users
  const [myProperties, setMyProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]); // for Admin
  const [projects, setProjects] = useState([]); // for Projects CRUD
  const [agentAnalytics, setAgentAnalytics] = useState(null);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [leads, setLeads] = useState([]); // received leads for Agent/Admin
  const [userLeads, setUserLeads] = useState([]); // inquiries submitted by this user
  const [favorites, setFavorites] = useState([]);
  const [users, setUsers] = useState([]); // Admin user management

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated]);

  // Load profile values on reload
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  // Load contextual data based on user role and tab transitions
  const loadDashboardData = async () => {
    if (!token) return;

    try {
      // 1. Load Favorites for User
      if (user?.savedProperties?.length > 0) {
        const favs = [];
        for (const id of user.savedProperties) {
          const res = await fetch(`${API_URL}/properties/${id}`);
          if (res.ok) {
            const data = await res.json();
            favs.push(data.property);
          }
        }
        setFavorites(favs);
      } else {
        setFavorites([]);
      }

      // 2. Load Inquiries Submitted by this user (buyer dashboard aspect)
      const userLeadsRes = await fetch(`${API_URL}/leads/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userLeadsRes.ok) {
        const userLeadsData = await userLeadsRes.json();
        setUserLeads(userLeadsData.leads);
      }

      // 3. Load Agent/Owner contextual data
      if (user?.role === 'AGENT' || user?.role === 'OWNER') {
        const analRes = await fetch(`${API_URL}/properties/analytics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (analRes.ok) {
          const analData = await analRes.json();
          setAgentAnalytics(analData.analytics);
        }

        const propRes = await fetch(`${API_URL}/properties?limit=100&scope=mine`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (propRes.ok) {
          const propData = await propRes.json();
          setMyProperties(propData.properties.filter(p => p.agent?._id === user?._id));
        }

        const leadRes = await fetch(`${API_URL}/leads/agent`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (leadRes.ok) {
          const leadData = await leadRes.json();
          setLeads(leadData.leads);
        }
      }

      // 4. Load Admin contextual data
      if (user?.role === 'ADMIN') {
        const propRes = await fetch(`${API_URL}/properties?limit=100&scope=all`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (propRes.ok) {
          const propData = await propRes.json();
          setAllProperties(propData.properties);
        }

        const leadRes = await fetch(`${API_URL}/leads/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (leadRes.ok) {
          const leadData = await leadRes.json();
          setLeads(leadData.leads);
        }

        const usersRes = await fetch(`${API_URL}/auth/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users);
        }

        const projRes = await fetch(`${API_URL}/projects`);
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(projData.projects);
        }

        const adminAnalRes = await fetch(`${API_URL}/properties/admin-analytics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (adminAnalRes.ok) {
          const adminAnalData = await adminAnalRes.json();
          setAdminAnalytics(adminAnalData.analytics);
        }
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user, activeTab, token]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await updateProfile(profileName, profilePhone);
      setSuccessMsg('Profile details updated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    }
  };

  // Upload a property image file (max 100 KB, enforced server-side too).
  // The file is stored locally under backend/uploads/ and the returned
  // URL becomes the Main Image for the listing.
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg('');
    if (file.size >= 100 * 1024) {
      setUploadMsg(`Image should be less than 100 KB (selected: ${(file.size / 1024).toFixed(1)} KB)`);
      e.target.value = '';
      return;
    }
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const response = await fetch(`${API_URL}/uploads/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename: file.name, data: base64 })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Image upload failed');
      setPropImg1(`${API_ORIGIN}${data.url}`);
      setUploadMsg(`Uploaded (${data.sizeKB} KB). This image is stored locally.`);
    } catch (err) {
      setUploadMsg(err.message || 'Image upload failed');
    }
    e.target.value = '';
  };

  // Admin listing verification (approve / reject with reason).
  const handleVerifyProperty = async (propertyId, verificationStatus, rejectionReason = '') => {
    try {
      const response = await fetch(`${API_URL}/properties/${propertyId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verificationStatus, rejectionReason })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed');
      setAllProperties(prev => prev.map(p => p._id === propertyId ? data.property : p));
      setSuccessMsg(`Listing ${verificationStatus.toLowerCase()} successfully!`);
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed');
    }
  };

  // Property Listing Submission (handles both create and edit/update)
  const handleAddPropertySubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    const endpoint = editPropertyId 
      ? `${API_URL}/properties/${editPropertyId}` 
      : `${API_URL}/properties`;
    
    const method = editPropertyId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: propTitle,
          description: propDesc,
          price: Number(propPrice),
          area: propArea,
          type: propType,
          status: propStatus,
          beds: propBeds ? parseInt(propBeds) : undefined,
          baths: propBaths ? parseInt(propBaths) : undefined,
          location: propLoc,
          phase: propPhase,
          possessionStatus: propPoss,
          furnished: propFurn,
          images: [propImg1, propImg2].filter(Boolean),
          isFeatured: false
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Saving listing failed');
      }

      setSuccessMsg(editPropertyId ? 'Luxury listing updated successfully!' : 'Luxury property listing added successfully!');
      
      // Reset states
      cancelPropertyEdit();
      setActiveTab('my-properties');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  // Populate form fields for property edit
  const startPropertyEdit = (prop) => {
    setEditPropertyId(prop._id);
    setPropTitle(prop.title || '');
    setPropDesc(prop.description || '');
    setPropPrice(prop.price || '');
    setPropArea(prop.area || '500 Sq. Yd.');
    setPropType(prop.type || 'HOUSE');
    setPropStatus(prop.status || 'BUY');
    setPropBeds(prop.beds?.toString() || '');
    setPropBaths(prop.baths?.toString() || '');
    setPropLoc(prop.location || '');
    setPropPhase(prop.phase || 'Phase 6');
    setPropPoss(prop.possessionStatus || 'Ready');
    setPropFurn(prop.furnished || 'Unfurnished');
    setPropImg1(prop.images?.[0] || '');
    setPropImg2(prop.images?.[1] || '');
    setActiveTab('add-property');
  };

  const cancelPropertyEdit = () => {
    setEditPropertyId(null);
    setPropTitle('');
    setPropDesc('');
    setPropPrice('');
    setPropLoc('');
    setPropImg1('/images/1613977257363-707ba9348227.jpg');
    setPropImg2('/images/1600585154340-be6161a56a0c.jpg');
  };

  const handleDeleteProperty = async (propId) => {
    if (!confirm('Are you absolutely sure you want to permanently delete this listing in Karachi DHA?')) return;

    try {
      const response = await fetch(`${API_URL}/properties/${propId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMyProperties(prev => prev.filter(p => p._id !== propId));
        setAllProperties(prev => prev.filter(p => p._id !== propId));
        alert('Listing deleted successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Lead status updates (Mark contacted/Mark resolved)
  const handleLeadStatusChange = async (leadId, nextStatus) => {
    try {
      const response = await fetch(`${API_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (response.ok) {
        setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: nextStatus } : l));
        setUserLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: nextStatus } : l));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin User Role Management
  const handleUserRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_URL}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        alert('User role updated successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update user role');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Delete User
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user profile? All associated listings and leads may be affected.')) return;

    try {
      const response = await fetch(`${API_URL}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        alert('User profile deleted successfully.');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Project CRUD operations (Admin only)
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    const endpoint = editProjectId 
      ? `${API_URL}/projects/${editProjectId}` 
      : `${API_URL}/projects`;
    const method = editProjectId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: projTitle,
          description: projDesc,
          location: projLoc,
          phase: projPhase,
          status: projStatus,
          priceStarting: projPriceStarting,
          areaRange: projAreaRange,
          images: [projImg1].filter(Boolean),
          isFeatured: projIsFeatured
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save project.');
      }

      setSuccessMsg(editProjectId ? 'Project updated successfully!' : 'Project created successfully!');
      cancelProjectEdit();
      // Reload projects list
      const projRes = await fetch(`${API_URL}/projects`);
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData.projects);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while saving project.');
    } finally {
      setLoading(false);
    }
  };

  const startProjectEdit = (proj) => {
    setEditProjectId(proj._id);
    setProjTitle(proj.title || '');
    setProjDesc(proj.description || '');
    setProjLoc(proj.location || '');
    setProjPhase(proj.phase || 'Phase 8');
    setProjStatus(proj.status || 'Under Construction');
    setProjPriceStarting(proj.priceStarting || '');
    setProjAreaRange(proj.areaRange || '');
    setProjImg1(proj.images?.[0] || '');
    setProjIsFeatured(proj.isFeatured || false);
  };

  const cancelProjectEdit = () => {
    setEditProjectId(null);
    setProjTitle('');
    setProjDesc('');
    setProjLoc('');
    setProjPriceStarting('4.5 Crore');
    setProjAreaRange('250 - 500 Sq. Yd.');
    setProjImg1('/images/1545324418-cc1a3fa10c00.jpg');
    setProjIsFeatured(false);
  };

  const handleDeleteProject = async (projId) => {
    if (!confirm('Are you sure you want to delete this off-plan development project?')) return;

    try {
      const response = await fetch(`${API_URL}/projects/${projId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setProjects(prev => prev.filter(p => p._id !== projId));
        alert('Project deleted successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-fade-in text-charcoal">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-charcoal/5 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xxs tracking-[0.2em] font-bold text-primary uppercase">DHA SAAS PORTAL</span>
          <h1 className="text-3xl font-bold font-serif text-charcoal mt-1">Welcome, {user.name}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Role: <span className="text-primary font-bold">{user.role}</span> | Email: {user.email}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={loadDashboardData}
            className="p-2 border border-charcoal/15 bg-white text-charcoal hover:text-primary transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 text-xs font-semibold hover:text-primary uppercase tracking-widest border border-charcoal/15 px-4 py-2 bg-white"
          >
            <LogOut className="w-4 h-4 text-primary" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar navigations vs dynamic Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Tabs */}
        <aside className="bg-white border border-charcoal/5 shadow-luxury p-6 h-fit text-xs font-semibold uppercase tracking-wider text-charcoal space-y-2">
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 border transition-all ${activeTab === 'profile' ? 'bg-primary text-white border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary'}`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Context</span>
          </button>

          <button 
            onClick={() => setActiveTab('favorites')}
            className={`w-full flex items-center space-x-3 px-4 py-3 border transition-all ${activeTab === 'favorites' ? 'bg-primary text-white border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary'}`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Favorites ({favorites.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('user-leads')}
            className={`w-full flex items-center space-x-3 px-4 py-3 border transition-all ${activeTab === 'user-leads' ? 'bg-primary text-white border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary'}`}
          >
            <FileText className="w-4 h-4" />
            <span>My Inquiries ({userLeads.length})</span>
          </button>

          {/* Agent / Owner Specific tabs */}
          {(user.role === 'AGENT' || user.role === 'OWNER') && (
            <>
              <button 
                onClick={() => setActiveTab('my-properties')}
                className={`w-full flex items-center space-x-3 px-4 py-3 border transition-all ${activeTab === 'my-properties' ? 'bg-primary text-white border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Properties ({myProperties.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('add-property')}
                className={`w-full flex items-center space-x-3 px-4 py-3 border transition-all ${activeTab === 'add-property' ? 'bg-primary text-white border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary'}`}
              >
                <PlusSquare className="w-4 h-4" />
                <span>Add Property</span>
              </button>
              <button 
                onClick={() => setActiveTab('leads')}
                className={`w-full flex items-center space-x-3 px-4 py-3 border transition-all ${activeTab === 'leads' ? 'bg-primary text-white border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary'}`}
              >
                <FileText className="w-4 h-4" />
                <span>Received Leads ({leads.length})</span>
              </button>
            </>
          )}

          {/* Admin Specific tabs */}
          {user.role === 'ADMIN' && (
            <>
              <button 
                onClick={() => setActiveTab('my-properties')}
                className={`w-full flex items-center space-x-3 px-4 py-3 border transition-all ${activeTab === 'my-properties' ? 'bg-primary text-white border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overall Listings ({allProperties.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('add-property')}
                className={`w-full flex items-center space-x-3 px-4 py-3 border transition-all ${activeTab === 'add-property' ? 'bg-primary text-white border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary'}`}
              >
                <PlusSquare className="w-4 h-4" />
                <span>Add Global Listing</span>
              </button>
              <button 
                onClick={() => setActiveTab('leads')}
                className={`w-full flex items-center space-x-3 px-4 py-3 border transition-all ${activeTab === 'leads' ? 'bg-primary text-white border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary'}`}
              >
                <FileText className="w-4 h-4" />
                <span>All Inquiry Leads ({leads.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('admin-projects')}
                className={`w-full flex items-center space-x-3 px-4 py-3 border transition-all ${activeTab === 'admin-projects' ? 'bg-primary text-white border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary'}`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>Manage Projects ({projects.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('admin-users')}
                className={`w-full flex items-center space-x-3 px-4 py-3 border transition-all ${activeTab === 'admin-users' ? 'bg-primary text-white border-primary' : 'border-transparent hover:bg-primary/5 hover:text-primary'}`}
              >
                <Users className="w-4 h-4" />
                <span>Manage Users ({users.length})</span>
              </button>
            </>
          )}

        </aside>

        {/* Dynamic Display Panel (3/4 width) */}
        <main className="lg:col-span-3 bg-white border border-charcoal/5 shadow-luxury p-8 min-h-[50vh]">
          
          {successMsg && (
            <div className="bg-primary/5 border border-primary/20 p-4 mb-6 text-center text-xs font-bold text-primary uppercase tracking-widest">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-4 mb-6 text-center text-xs font-bold text-red-600 uppercase tracking-widest">
              {errorMsg}
            </div>
          )}

          {/* ==========================================
              TAB 1: Profile Management
             ========================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-xl border-b pb-2 mb-6">Update Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
                <div className="flex flex-col text-left">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Email (Immutable)</label>
                  <input type="text" disabled value={user.email} className="p-2.5 bg-gray-100 border border-charcoal/10 text-xs focus:outline-none text-gray-500 font-semibold" />
                </div>
                <div className="flex flex-col text-left">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)} 
                    placeholder="Ali Jamil" 
                    className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none" 
                  />
                </div>
                <div className="flex flex-col text-left">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">WhatsApp / Contact Number</label>
                  <input 
                    type="tel" 
                    value={profilePhone} 
                    onChange={(e) => setProfilePhone(e.target.value)} 
                    placeholder="+92 300 1234567" 
                    className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none" 
                  />
                </div>
                <button type="submit" className="btn-primary-dha py-3 px-6 mt-2">
                  Update Profile Details
                </button>
              </form>
            </div>
          )}

          {/* ==========================================
              TAB 2: Favorites Dashboard
             ========================================== */}
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-xl border-b pb-2 mb-6">Saved Favorites Properties</h2>
              {favorites.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No properties added to your favorites drawer yet. Explore properties and click the Heart icon!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map(prop => (
                    <div key={prop._id} className="flex border border-charcoal/5 shadow-luxury p-3 space-x-3 items-center">
                      <img src={prop.images[0]} alt={prop.title} className="w-20 h-20 object-cover shrink-0" />
                      <div className="flex-grow min-w-0">
                        <span className="text-[8px] font-bold text-primary uppercase">{prop.phase}</span>
                        <h4 className="font-serif font-bold text-xs truncate hover:text-primary cursor-pointer">
                          <Link to={`/listings/${prop._id}`}>{prop.title}</Link>
                        </h4>
                        <span className="text-xxs font-bold text-charcoal-light/60 block mt-1">PKR {prop.price.toLocaleString()}</span>
                      </div>
                      <Link to={`/listings/${prop._id}`} className="btn-luxury py-2 px-3 !text-[9px] shrink-0">View</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB: Regular User Submitted Leads / Inquiries
             ========================================== */}
          {activeTab === 'user-leads' && (
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-xl border-b pb-2 mb-6">My Contact Inquiries</h2>
              {userLeads.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  You haven't submitted any inquiry or installment requests yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {userLeads.map(lead => (
                    <div key={lead._id} className="p-5 border border-charcoal/5 shadow-luxury flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1.5 text-xs text-charcoal-light">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 text-white ${lead.status === 'Closed' ? 'bg-green-600' : (lead.status === 'Contacted' ? 'bg-primary' : 'bg-yellow-600')}`}>
                            {lead.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-charcoal">
                          Inquiry regarding:{' '}
                          {lead.propertyId ? (
                            <Link to={`/listings/${lead.propertyId._id}`} className="text-primary hover:underline">
                              {lead.propertyId.title}
                            </Link>
                          ) : lead.projectId ? (
                            <span className="text-primary">Off-Plan Project: {lead.projectId.title}</span>
                          ) : (
                            'General'
                          )}
                        </h4>
                        <div className="text-[11px] text-gray-500 font-semibold">{lead.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 3: Properties Listing Table (Agent/Admin)
             ========================================== */}
          {activeTab === 'my-properties' && (
            <div className="space-y-6">
              {/* Admin Analytics Panel */}
              {user.role === 'ADMIN' && adminAnalytics && (
                <div className="mb-8 space-y-4">
                  <h3 className="font-serif font-bold text-lg text-charcoal border-b pb-2 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>DHA System Analytics Overview</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-none text-center">
                      <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-widest">Total Properties</span>
                      <span className="text-2xl font-bold font-serif text-primary">{adminAnalytics.totalProperties}</span>
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-none text-center">
                      <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-widest">Buy / Rent Listings</span>
                      <span className="text-base font-bold font-serif text-charcoal">{adminAnalytics.buyProperties} / {adminAnalytics.rentProperties}</span>
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-none text-center">
                      <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-widest">Total Inquiries</span>
                      <span className="text-2xl font-bold font-serif text-primary">{adminAnalytics.totalLeads}</span>
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-none text-center">
                      <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-widest">Total Views Logged</span>
                      <span className="text-2xl font-bold font-serif text-primary">{adminAnalytics.totalViews}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center border-b pb-2 mb-6">
                <h2 className="font-serif font-bold text-xl">
                  {user.role === 'ADMIN' ? 'Overall DHA Listings catalog' : 'My Registered Properties'}
                </h2>
                {(user.role === 'AGENT' || user.role === 'OWNER') && agentAnalytics && (
                  <div className="flex space-x-4 text-xxs font-bold uppercase tracking-wider bg-gray-50 border p-2">
                    <div>Views: <span className="text-primary">{agentAnalytics.totalViews}</span></div>
                    <div>Leads: <span className="text-primary">{agentAnalytics.totalLeads}</span></div>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 font-bold uppercase tracking-wider text-charcoal border-b">
                      <th className="p-3">Property Title</th>
                      <th className="p-3">Phase</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Views</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(user.role === 'ADMIN' ? allProperties : myProperties).map(prop => (
                      <tr key={prop._id} className="border-b hover:bg-gray-50/50">
                        <td className="p-3 truncate max-w-[200px] font-semibold">{prop.title}</td>
                        <td className="p-3 font-semibold">{prop.phase}</td>
                        <td className="p-3 font-semibold">PKR {(prop.price / 10000000).toFixed(2)} Crore</td>
                        <td className="p-3 font-semibold">{prop.views || 0}</td>
                        <td className="p-3 font-semibold">{prop.verificationStatus || 'Approved'}</td>
                        <td className="p-3 flex space-x-2">
                          <Link to={`/listings/${prop._id}`} className="p-1.5 border hover:bg-primary hover:text-white transition-colors" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button 
                            onClick={() => startPropertyEdit(prop)}
                            className="p-1.5 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors" 
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProperty(prop._id)}
                            className="p-1.5 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors" 
                            title="Delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                          {user.role === 'ADMIN' && prop.verificationStatus === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleVerifyProperty(prop._id, 'Approved')}
                                className="p-1.5 border border-green-600/30 text-green-700 hover:bg-green-600 hover:text-white transition-colors"
                                title="Approve listing"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  const reason = window.prompt('Rejection reason (optional):', '');
                                  if (reason !== null) handleVerifyProperty(prop._id, 'Rejected', reason);
                                }}
                                className="p-1.5 border border-red-600/30 text-red-700 hover:bg-red-600 hover:text-white transition-colors"
                                title="Reject listing"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: Received Leads / Inquiries (Agent/Admin)
             ========================================== */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-xl border-b pb-2 mb-6">Property Contact Inquiries Received</h2>
              {leads.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No inquiries or WhatsApp callback leads registered yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map(lead => (
                    <div key={lead._id} className="p-5 border border-charcoal/5 shadow-luxury flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1.5 text-xs text-charcoal-light">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 text-white ${lead.status === 'Closed' ? 'bg-green-600' : (lead.status === 'Contacted' ? 'bg-primary' : 'bg-yellow-600')}`}>
                            {lead.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-charcoal">
                          Inquirer: {lead.name}
                        </h4>
                        <div>WhatsApp/Phone: <span className="font-bold">{lead.phone}</span> | Email: {lead.email}</div>
                        <div className="pt-2 italic text-gray-500 font-semibold border-t border-charcoal/5 mt-2">"{lead.message}"</div>
                      </div>

                      {/* Control status */}
                      <div className="flex flex-col justify-between items-end gap-2 shrink-0">
                        {lead.propertyId ? (
                          <div className="text-right text-[10px] font-bold text-primary uppercase">
                            Property: {lead.propertyId.title}
                          </div>
                        ) : lead.projectId ? (
                          <div className="text-right text-[10px] font-bold text-primary uppercase">
                            Project: {lead.projectId.title}
                          </div>
                        ) : null}
                        <div className="flex space-x-1.5 text-xxs font-bold uppercase tracking-wider">
                          <button
                            onClick={() => handleLeadStatusChange(lead._id, 'Contacted')}
                            className="px-2.5 py-1.5 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            Mark contacted
                          </button>
                          <button
                            onClick={() => handleLeadStatusChange(lead._id, 'Closed')}
                            className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white transition-colors"
                          >
                            Mark resolved
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 5: Add Property Listing Form (Agent/Admin)
             ========================================== */}
          {activeTab === 'add-property' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2 mb-6">
                <h2 className="font-serif font-bold text-xl">
                  {editPropertyId ? 'Edit DHA Karachi Property Listing' : 'List A New Karachi DHA Property'}
                </h2>
                {editPropertyId && (
                  <button 
                    onClick={cancelPropertyEdit}
                    className="flex items-center space-x-1 text-xxs font-bold uppercase tracking-widest text-primary hover:underline"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Editing</span>
                  </button>
                )}
              </div>
              
              <form onSubmit={handleAddPropertySubmit} className="space-y-4">
                
                {/* Row 1: Title */}
                <div className="flex flex-col text-left">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Listing Title</label>
                  <input
                    type="text"
                    required
                    value={propTitle}
                    onChange={(e) => setPropTitle(e.target.value)}
                    placeholder="Premium 500 Sq. Yd. Luxury Villa for Sale in DHA Phase 6"
                    className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                  />
                </div>

                {/* Row 2: Description */}
                <div className="flex flex-col text-left">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Detailed Description</label>
                  <textarea
                    rows="4"
                    required
                    value={propDesc}
                    onChange={(e) => setPropDesc(e.target.value)}
                    placeholder="Describe the architectural layout, tile finishes, security details, and neighborhood conveniences..."
                    className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                  />
                </div>

                {/* Row 3: Price, size, type, status */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Asking Price (PKR)</label>
                    <input
                      type="number"
                      required
                      value={propPrice}
                      onChange={(e) => setPropPrice(e.target.value)}
                      placeholder="125000000"
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Dimensions (e.g. 500 Sq Yd)</label>
                    <input
                      type="text"
                      required
                      value={propArea}
                      onChange={(e) => setPropArea(e.target.value)}
                      placeholder="500 Sq. Yd."
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Category</label>
                    <select
                      value={propType}
                      onChange={(e) => setPropType(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs font-semibold focus:outline-none"
                    >
                      <option value="HOUSE">House/Villa</option>
                      <option value="APARTMENT">Apartment</option>
                      <option value="PORTION">Portion</option>
                      <option value="PLOT">Residential Plot</option>
                      <option value="OFFICE">Office</option>
                      <option value="SHOP">Shop</option>
                      <option value="COMMERCIAL">Commercial Unit</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Status</label>
                    <select
                      value={propStatus}
                      onChange={(e) => setPropStatus(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs font-semibold focus:outline-none"
                    >
                      <option value="BUY">For Sale</option>
                      <option value="RENT">For Rent</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Beds, baths, phase, location */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Bedrooms</label>
                    <select
                      value={propBeds}
                      onChange={(e) => setPropBeds(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs font-semibold focus:outline-none"
                    >
                      <option value="">N/A</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Bathrooms</label>
                    <select
                      value={propBaths}
                      onChange={(e) => setPropBaths(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs font-semibold focus:outline-none"
                    >
                      <option value="">N/A</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">DHA Phase</label>
                    <select
                      value={propPhase}
                      onChange={(e) => setPropPhase(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Phase 1">Phase 1</option>
                      <option value="Phase 2">Phase 2</option>
                      <option value="Phase 2 Extension">Phase 2 Extension</option>
                      <option value="Phase 4">Phase 4</option>
                      <option value="Phase 5">Phase 5</option>
                      <option value="Phase 6">Phase 6</option>
                      <option value="Phase 7">Phase 7</option>
                      <option value="Phase 8">Phase 8</option>
                      <option value="DHA City">DHA City</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Location / Street</label>
                    <input
                      type="text"
                      required
                      value={propLoc}
                      onChange={(e) => setPropLoc(e.target.value)}
                      placeholder="Khayaban-e-Bukhari"
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 5: Furnished, possession, image urls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Furnished</label>
                    <select
                      value={propFurn}
                      onChange={(e) => setPropFurn(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Furnished">Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Possession Status</label>
                    <select
                      value={propPoss}
                      onChange={(e) => setPropPoss(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Ready">Ready to Move</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="Off-Plan">Off-Plan</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Main Image URL</label>
                    <input
                      type="text"
                      value={propImg1}
                      onChange={(e) => setPropImg1(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Or Upload Main Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="p-2 bg-white border border-charcoal/10 text-xs focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Image should be less than 100 KB</p>
                    {uploadMsg && <p className="text-[10px] text-primary mt-1">{uploadMsg}</p>}
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Secondary Image URL</label>
                    <input
                      type="text"
                      value={propImg2}
                      onChange={(e) => setPropImg2(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-dha py-3.5 px-8 mt-2 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{editPropertyId ? 'Save & Publish Changes' : 'Save & Publish Listing'}</span>
                </button>

              </form>
            </div>
          )}

          {/* ==========================================
              TAB: Admin Manage Projects (Admin only)
             ========================================== */}
          {activeTab === 'admin-projects' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="font-serif font-bold text-xl">
                  {editProjectId ? 'Edit Off-Plan Project Listing' : 'Manage Off-Plan Projects'}
                </h2>
                {editProjectId && (
                  <button 
                    onClick={cancelProjectEdit}
                    className="flex items-center space-x-1 text-xxs font-bold uppercase tracking-widest text-primary hover:underline"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Editing</span>
                  </button>
                )}
              </div>

              {/* Add/Edit project Form */}
              <form onSubmit={handleProjectSubmit} className="space-y-4 bg-gray-50/50 p-6 border border-charcoal/5">
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-charcoal">
                  {editProjectId ? 'Update Project Info' : 'Publish New Off-Plan Project'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      placeholder="e.g. Creek Vista Ocean Towers"
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Location Details</label>
                    <input
                      type="text"
                      required
                      value={projLoc}
                      onChange={(e) => setProjLoc(e.target.value)}
                      placeholder="e.g. Zone D, Phase 8"
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Description</label>
                  <textarea
                    rows="3"
                    required
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="Describe the overall design, amenities, payment structure, and contractor status..."
                    className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Phase</label>
                    <select
                      value={projPhase}
                      onChange={(e) => setProjPhase(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Phase 8">Phase 8</option>
                      <option value="Phase 6">Phase 6</option>
                      <option value="DHA City">DHA City</option>
                      <option value="Phase 5">Phase 5</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Project Status</label>
                    <select
                      value={projStatus}
                      onChange={(e) => setProjStatus(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Under Construction">Under Construction</option>
                      <option value="Off-Plan Launch">Off-Plan Launch</option>
                      <option value="Excavating Stage">Excavating Stage</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Price Starting</label>
                    <input
                      type="text"
                      required
                      value={projPriceStarting}
                      onChange={(e) => setProjPriceStarting(e.target.value)}
                      placeholder="e.g. 5.5 Crore"
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Area Range</label>
                    <input
                      type="text"
                      required
                      value={projAreaRange}
                      onChange={(e) => setProjAreaRange(e.target.value)}
                      placeholder="e.g. 250 - 500 Sq. Yd."
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="flex flex-col text-left md:col-span-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal-light/60 mb-1">Project Image URL</label>
                    <input
                      type="text"
                      value={projImg1}
                      onChange={(e) => setProjImg1(e.target.value)}
                      className="p-2.5 bg-white border border-charcoal/10 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-4 justify-start">
                    <input
                      type="checkbox"
                      id="projIsFeatured"
                      checked={projIsFeatured}
                      onChange={(e) => setProjIsFeatured(e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <label htmlFor="projIsFeatured" className="text-[10px] font-bold uppercase tracking-widest text-charcoal-light/70 cursor-pointer">
                      Featured Project
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-dha py-3 px-6 text-xs flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{editProjectId ? 'Update Project listing' : 'Publish Project listing'}</span>
                </button>
              </form>

              {/* Projects Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 font-bold uppercase tracking-wider text-charcoal border-b">
                      <th className="p-3">Project Title</th>
                      <th className="p-3">Phase / Location</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Prices starting</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(proj => (
                      <tr key={proj._id} className="border-b hover:bg-gray-50/50">
                        <td className="p-3 font-semibold">{proj.title}</td>
                        <td className="p-3 font-semibold">{proj.location} ({proj.phase})</td>
                        <td className="p-3">
                          <span className="bg-primary/5 text-primary text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider border border-primary/10">
                            {proj.status}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-primary">{proj.priceStarting}</td>
                        <td className="p-3 flex space-x-2">
                          <button 
                            onClick={() => startProjectEdit(proj)}
                            className="p-1.5 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors" 
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(proj._id)}
                            className="p-1.5 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors" 
                            title="Delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 6: Admin Manage Users (Admin only)
             ========================================== */}
          {activeTab === 'admin-users' && (
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-xl border-b pb-2 mb-6">Manage System Accounts</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 font-bold uppercase tracking-wider text-charcoal border-b">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Current Role</th>
                      <th className="p-3">Modify Role</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b hover:bg-gray-50/50">
                        <td className="p-3 font-semibold">{u.name}</td>
                        <td className="p-3 font-semibold">{u.email}</td>
                        <td className="p-3">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 border ${
                            u.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' :
                            u.role === 'AGENT' ? 'bg-primary/5 text-primary border-primary/20' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          {u._id !== user._id ? (
                            <select
                              value={u.role}
                              onChange={(e) => handleUserRoleChange(u._id, e.target.value)}
                              className="p-1.5 bg-white border border-charcoal/10 text-xxs font-bold focus:outline-none"
                            >
                              <option value="USER">Buyer (USER)</option>
                              <option value="OWNER">Owner (OWNER)</option>
                              <option value="AGENT">Consultant (AGENT)</option>
                              <option value="ADMIN">System Admin (ADMIN)</option>
                            </select>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic font-semibold">Self (Protected)</span>
                          )}
                        </td>
                        <td className="p-3">
                          {u._id !== user._id ? (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1.5 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                              title="Delete Account"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic font-semibold">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
