import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  User, 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  Download, 
  Trash2, 
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  School,
  ClipboardList,
  Globe,
  LogIn,
  UserPlus,
  LogOut,
  Mail,
  Lock,
  MapPin,
  Phone,
  BookOpen,
  MessageSquare
} from 'lucide-react';

// --- YOUR FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyA624_MFdmAHoMiS1eH2taAn7pjQK-srWk",
  authDomain: "dps-admission-tracker.firebaseapp.com",
  projectId: "dps-admission-tracker",
  storageBucket: "dps-admission-tracker.firebasestorage.app",
  messagingSenderId: "995022033480",
  appId: "1:995022033480:web:685359eac01cd352edfe7d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// For Production, we use a static appId or an environment variable
const appId = "dps-tracker-prod";

const ROLES = { USER: 'user', ADMIN: 'admin' };
const ADMIN_EMAIL = "DPSadmission@dps.com";

// App Logo URL
const APP_LOGO = "https://scontent.fktm17-1.fna.fbcdn.net/v/t39.30808-6/454941913_122282415704198023_2128913926838848419_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=L6u4T9wT_x4Q7kNvgFv0R2c&_nc_oc=AdhO8Q3f4Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q&_nc_zt=23&_nc_ht=scontent.fktm17-1.fna&_nc_gid=A_R9Q8R9Q8R9Q8R9Q8R9Q8R&oh=00_AYC9Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q8R9Q&oe=66E1D9B5";

const ASIAN_COUNTRIES = ["Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China", "Cyprus", "Georgia", "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar (Burma)", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Russia", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"];

const LogoImage = ({ className = "h-8 w-8" }) => {
  const [error, setError] = useState(false);
  if (error || !APP_LOGO) return <div className={`${className} bg-blue-600 rounded-lg flex items-center justify-center`}><School className="text-white h-3/4 w-3/4" /></div>;
  return <img src={APP_LOGO} alt="DPS Logo" className={`${className} object-contain rounded-lg`} onError={() => setError(true)} />;
};

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="md:col-span-2 flex items-center space-x-3 py-4 border-b border-slate-50 mb-2 mt-4 first:mt-0">
    <div className="p-2 bg-slate-900 rounded-lg text-white"><Icon size={16} /></div>
    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
  </div>
);

const InputField = ({ label, id, type = "text", required = true, placeholder = "", value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} required={required} placeholder={placeholder} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-800" value={value} onChange={onChange} />
  </div>
);

const TextAreaField = ({ label, id, placeholder = "", value, onChange }) => (
  <div className="md:col-span-2 space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <textarea rows="3" placeholder={placeholder} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-800" value={value} onChange={onChange} />
  </div>
);

const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-black transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>{icon}<span>{label}</span></button>
);

const MobileNavButton = ({ active, onClick, icon }) => (
  <button onClick={onClick} className={`p-2.5 rounded-xl transition-all ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}>{icon}</button>
);

const AuthScreen = ({ showStatus }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [inputId, setInputId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let email = inputId;
    if (inputId.toLowerCase() === 'dpsadmission') email = 'DPSadmission@dps.com';
    else if (!inputId.includes('@')) email = `${inputId}@dps.com`;
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        showStatus('success', 'Staff registration successful!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showStatus('success', 'Welcome to DPS Tracker.');
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') showStatus('error', 'Account exists. Please login.');
      else showStatus('error', 'Authentication failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        <div className="inline-block bg-white p-1 rounded-3xl shadow-2xl mb-4 overflow-hidden"><LogoImage className="h-24 w-24 md:h-32 md:w-32" /></div>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase">DPS Tracker</h1>
      </div>
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        <h2 className="text-2xl font-black text-slate-900 mb-6">{isRegistering ? 'Register' : 'Staff Login'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Staff ID" id="id" value={inputId} onChange={e => setInputId(e.target.value)} />
          <InputField label="Password" id="pw" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button disabled={loading} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl mt-2 flex items-center justify-center space-x-3">{loading ? <Loader2 className="animate-spin" /> : <LogIn />}<span className="uppercase tracking-widest text-xs">{isRegistering ? 'Register' : 'Login'}</span></button>
        </form>
        <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-6 text-xs font-black text-blue-600">{isRegistering ? 'Login Instead' : 'Create Account'}</button>
      </div>
    </div>
  );
};

const UserDashboard = ({ submissions, setView, deleteSubmission }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div><h1 className="text-2xl md:text-4xl font-black text-slate-900">Dashboard</h1><p className="mt-1 text-slate-500 text-sm font-medium">Your personal inquiry logs.</p></div>
      <button onClick={() => setView('form')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black flex items-center justify-center space-x-3 shadow-xl active:scale-95 text-[10px] md:text-sm uppercase tracking-widest"><PlusCircle size={18} /><span>New Enquiry</span></button>
    </div>
    {submissions.length === 0 ? (
      <div className="bg-white rounded-[2rem] border p-10 text-center"><ClipboardList size={40} className="mx-auto text-slate-200 mb-4" /><h3 className="text-xl font-black text-slate-900">No Records</h3></div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {submissions.map(sub => (
          <div key={sub.id} className="bg-white rounded-2xl border shadow-sm p-6 relative">
            <button onClick={() => deleteSubmission(sub.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-600"><Trash2 size={16} /></button>
            <div className="flex items-center space-x-3 mb-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><User size={20} /></div><div className="min-w-0"><h4 className="font-black text-slate-900 text-base truncate">{sub.formData?.studentName}</h4><p className="text-blue-600 font-black text-[9px] uppercase">{sub.formData?.nationality}</p></div></div>
            <div className="space-y-2 mb-4 text-xs">
              <div className="flex justify-between items-center px-2 py-1 bg-slate-50 rounded-lg"><span className="text-[9px] text-slate-400 font-black uppercase">Class</span><span className="font-black text-slate-900">{sub.formData?.admissionSought}</span></div>
              <p className="text-slate-500 truncate flex items-center gap-2"><MapPin size={12}/> {sub.formData?.address}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${sub.formData?.admitted === 'Yes' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{sub.formData?.admitted === 'Yes' ? 'Admitted' : 'Inquiry'}</div>
              <span className="text-[9px] text-slate-300 font-bold">{sub.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const EnquiryForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ staffCode: '', studentName: '', parentGuardianName: '', dateOfVisit: new Date().toISOString().split('T')[0], address: '', contactNo: '', nationality: 'India', currentSchool: '', currentClass: '', admissionSought: '', questionUnanswered: '', parentsFeedback: '', enquiryDetail: '', registered: 'No', admitted: 'No' });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };
  const handleChange = (id, value) => setFormData(prev => ({ ...prev, [id]: value }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[2rem] border shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-6 md:p-10 text-white flex items-center justify-between">
          <div><h2 className="text-2xl md:text-4xl font-black">New Enquiry</h2><p className="text-slate-400 text-sm mt-1">DPS Admission System</p></div>
          <div className="bg-white p-1 rounded-2xl overflow-hidden shadow-xl"><LogoImage className="h-14 w-14 md:h-20 md:w-20" /></div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <SectionTitle icon={ShieldCheck} title="Admin Details" />
          <InputField label="Staff Code" id="staffCode" value={formData.staffCode} onChange={e => handleChange('staffCode', e.target.value)} />
          <InputField label="Date" id="dateOfVisit" type="date" value={formData.dateOfVisit} onChange={e => handleChange('dateOfVisit', e.target.value)} />
          <SectionTitle icon={User} title="Student & Guardian" />
          <InputField label="Student Name" id="studentName" value={formData.studentName} onChange={e => handleChange('studentName', e.target.value)} />
          <InputField label="Guardian Name" id="parentGuardianName" value={formData.parentGuardianName} onChange={e => handleChange('parentGuardianName', e.target.value)} />
          <InputField label="Contact" id="contactNo" type="tel" value={formData.contactNo} onChange={e => handleChange('contactNo', e.target.value)} />
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nationality</label><select className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-bold" value={formData.nationality} onChange={e => handleChange('nationality', e.target.value)}>{ASIAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="md:col-span-2"><InputField label="Address" id="address" value={formData.address} onChange={e => handleChange('address', e.target.value)} /></div>
          <SectionTitle icon={BookOpen} title="Academics" />
          <InputField label="Current School" id="currentSchool" value={formData.currentSchool} onChange={e => handleChange('currentSchool', e.target.value)} />
          <InputField label="Current Class" id="currentClass" value={formData.currentClass} onChange={e => handleChange('currentClass', e.target.value)} />
          <InputField label="Class Seeking" id="admissionSought" value={formData.admissionSought} onChange={e => handleChange('admissionSought', e.target.value)} />
          <SectionTitle icon={MessageSquare} title="Remarks" />
          <TextAreaField label="Teacher Qs" id="questionUnanswered" value={formData.questionUnanswered} onChange={e => handleChange('questionUnanswered', e.target.value)} />
          <TextAreaField label="Parents Feedback" id="parentsFeedback" value={formData.parentsFeedback} onChange={e => handleChange('parentsFeedback', e.target.value)} />
          <TextAreaField label="Details" id="enquiryDetail" value={formData.enquiryDetail} onChange={e => handleChange('enquiryDetail', e.target.value)} />
          <SectionTitle icon={ClipboardList} title="Status" />
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered?</label><select className="w-full px-5 py-4 rounded-xl border bg-slate-50 font-bold" value={formData.registered} onChange={e => handleChange('registered', e.target.value)}><option>No</option><option>Yes</option></select></div>
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admitted?</label><select className="w-full px-5 py-4 rounded-xl border bg-slate-50 font-bold" value={formData.admitted} onChange={e => handleChange('admitted', e.target.value)}><option>No</option><option>Yes</option></select></div>
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-10 border-t mt-6"><button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest text-xs">Save</button><button type="button" onClick={onCancel} className="px-10 py-4 border-2 text-slate-400 font-black rounded-2xl uppercase tracking-widest text-xs">Discard</button></div>
        </form>
      </div>
    </div>
  );
};

const AdminPanel = ({ submissions, deleteSubmission }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const filtered = useMemo(() => {
    let res = [...submissions];
    if (search) res = res.filter(s => (s.formData?.studentName?.toLowerCase() || '').includes(search.toLowerCase()) || (s.formData?.staffCode?.toLowerCase() || '').includes(search.toLowerCase()));
    if (filter !== 'All') res = res.filter(s => s.formData?.admitted === filter);
    return res.sort((a, b) => b.createdAt - a.createdAt);
  }, [submissions, search, filter]);

  const exportCSV = () => {
    const headers = ['Staff', 'Student', 'Parent', 'Date', 'Phone', 'Class', 'Admitted'];
    const rows = filtered.map(s => [s.formData?.staffCode, s.formData?.studentName, s.formData?.parentGuardianName, s.formData?.dateOfVisit, s.formData?.contactNo, s.formData?.admissionSought, s.formData?.admitted]);
    const csvContent = [headers, ...rows].map(e => e.map(v => `"${v || ''}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' })));
    link.setAttribute("download", `dps_records.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div><h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Master Records</h1></div>
        <button onClick={exportCSV} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black flex items-center justify-center space-x-3 shadow-2xl text-xs uppercase tracking-widest"><Download size={18} /><span>Export CSV</span></button>
      </div>
      <div className="bg-white p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} /><input type="text" placeholder="Search..." className="w-full pl-12 pr-6 py-3.5 rounded-xl bg-slate-50 outline-none text-sm font-bold" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="w-full md:w-auto bg-slate-50 border px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest" value={filter} onChange={e => setFilter(e.target.value)}><option value="All">All</option><option value="Yes">Admitted</option><option value="No">Pending</option></select>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden shadow-2xl"><div className="overflow-x-auto"><table className="w-full text-left border-collapse min-w-[600px]"><thead><tr className="bg-slate-900 text-white"><th className="px-6 py-4 font-black uppercase text-[9px]">Staff</th><th className="px-6 py-4 font-black uppercase text-[9px]">Student</th><th className="px-6 py-4 font-black uppercase text-[9px] text-center">Status</th><th className="px-6 py-4 font-black uppercase text-[9px] text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(row => (<tr key={row.id} className="hover:bg-blue-50/30 transition-colors group"><td className="px-6 py-4 font-black text-blue-600 font-mono text-base">{row.formData?.staffCode}</td><td className="px-6 py-4"><div><p className="font-black text-slate-900 text-base leading-tight">{row.formData?.studentName}</p><p className="text-[9px] font-black text-slate-400 uppercase">{row.formData?.admissionSought} • {row.formData?.nationality}</p></div></td><td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${row.formData?.admitted === 'Yes' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-300'}`}>{row.formData?.admitted === 'Yes' ? 'Admitted' : 'Pending'}</span></td><td className="px-6 py-4 text-right"><button onClick={() => deleteSubmission(row.id)} className="p-2 text-slate-200 hover:text-rose-600 transition-all"><Trash2 size={18} /></button></td></tr>))}</tbody></table></div></div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); 
  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          const profileRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'settings', 'profile');
          const profileSnap = await getDoc(profileRef);
          const isSystemAdmin = currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            if (isSystemAdmin && data.role !== ROLES.ADMIN) {
              await updateDoc(profileRef, { role: ROLES.ADMIN });
              setUserProfile({ ...data, role: ROLES.ADMIN });
            } else setUserProfile(data);
          } else {
            const newProfile = { uid: currentUser.uid, email: currentUser.email, role: isSystemAdmin ? ROLES.ADMIN : ROLES.USER, createdAt: new Date().toISOString() };
            await setDoc(profileRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (e) { console.error(e); }
      } else { setUser(null); setUserProfile(null); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const submissionsRef = collection(db, 'artifacts', appId, 'public', 'data', 'submissions');
    const unsubscribe = onSnapshot(submissionsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() || new Date() }));
      setSubmissions(data);
    });
    return () => unsubscribe();
  }, [user]);

  const showStatus = (type, message) => { setStatus({ type, message }); setTimeout(() => setStatus({ type: '', message: '' }), 6000); };
  const handleLogout = () => signOut(auth).then(() => { setView('dashboard'); showStatus('success', 'Logged out.'); });
  const deleteSubmission = async (id) => { try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'submissions', id)); showStatus('success', 'Deleted.'); } catch (e) { showStatus('error', 'Denied.'); } };
  const handleSubmission = async (formData) => { try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'), { userId: user.uid, userEmail: user.email, formData, createdAt: serverTimestamp() }); showStatus('success', 'Saved.'); setView('dashboard'); } catch (e) { showStatus('error', 'Failed.'); } };

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900"><Loader2 className="w-12 h-12 text-blue-500 animate-spin" /></div>;
  if (!user) return <AuthScreen showStatus={showStatus} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => setView('dashboard')}><LogoImage className="h-9 w-9" /><span className="ml-2 text-lg font-black text-slate-800">DPS Tracker</span></div>
          <div className="hidden md:flex ml-8 space-x-2">
            <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={18}/>} label="Dashboard" />
            <NavButton active={view === 'form'} onClick={() => setView('form')} icon={<PlusCircle size={18}/>} label="New Enquiry" />
            {userProfile?.role === ROLES.ADMIN && <NavButton active={view === 'admin'} onClick={() => setView('admin')} icon={<ShieldCheck size={18}/>} label="Records" />}
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 bg-slate-50 rounded-lg"><LogOut size={18} /></button>
        </div>
        <div className="md:hidden flex justify-around border-t py-2">
           <MobileNavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={20}/>} />
           <MobileNavButton active={view === 'form'} onClick={() => setView('form')} icon={<PlusCircle size={20}/>} />
           {userProfile?.role === ROLES.ADMIN && <MobileNavButton active={view === 'admin'} onClick={() => setView('admin')} icon={<ShieldCheck size={20}/>} />}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {status.message && <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 border shadow-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}><AlertCircle size={18}/><span className="font-semibold text-sm">{status.message}</span></div>}
        {view === 'dashboard' && <UserDashboard submissions={submissions.filter(s => s.userId === user?.uid)} setView={setView} deleteSubmission={deleteSubmission} />}
        {view === 'form' && <EnquiryForm onSubmit={handleSubmission} onCancel={() => setView('dashboard')} />}
        {view === 'admin' && userProfile?.role === ROLES.ADMIN && <AdminPanel submissions={submissions} deleteSubmission={deleteSubmission} />}
      </main>
    </div>
  );
};

export default App;