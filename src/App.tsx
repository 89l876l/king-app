/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, Component, ErrorInfo, ReactNode, FormEvent } from 'react';
import { 
  Shield, 
  Zap, 
  Trash2, 
  RefreshCw, 
  Terminal as TerminalIcon, 
  Cpu, 
  Activity, 
  Lock,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Wifi,
  Gamepad2,
  Eraser,
  Ghost,
  ShieldAlert,
  Clock,
  Layers,
  Play,
  Database,
  LogOut,
  UserPlus,
  Trash,
  Calendar,
  Key,
  ShieldCheck,
  Settings,
  MessageSquare,
  ExternalLink,
  Info,
  Eye,
  EyeOff,
  UserCheck,
  UserCog,
  ShieldX,
  Lock as LockIcon,
  Unlock,
  Server,
  Globe,
  Monitor,
  Database as DbIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  OperationType, 
  handleFirestoreError, 
  signInAnonymously, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  setDoc,
  onSnapshot
} from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, serverTimestamp, setDoc as firestoreSetDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'KING-SECRET-KEY-2026-ALNAQBI';

const encryptData = (text: string) => {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

const decryptData = (ciphertext: string) => {
  if (!ciphertext) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || ciphertext;
  } catch (e) {
    return ciphertext;
  }
};

const translations = {
  en: {
    title: "KING",
    subtitle: "Elite Security",
    accessSystem: "Access System",
    enterKey: "ENTER YOUR KEY",
    authKey: "Authentication Key",
    dashboard: "Dashboard",
    spoofer: "SPOOFER",
    cleanLogs: "CLEAN LOGS",
    ipRotation: "IP ROTATION",
    macSpoof: "MAC SPOOFER",
    boost: "SPOOFER BOOST",
    regCleaner: "REG CLEANER",
    status: "Status",
    undetected: "Undetected",
    cpuLoad: "CPU Load",
    ramUsage: "RAM Usage",
    gpuTemp: "GPU Temp",
    fpsBoost: "FPS Boost",
    terminal: "System Terminal",
    users: "Users",
    staff: "Staff",
    logout: "Logout",
    protectionActive: "Protection Active",
    protectionInactive: "Protection Inactive",
    startProtection: "START PROTECTION",
    stopProtection: "STOP PROTECTION",
    hwid: "Hardware ID",
    ip: "IP Address",
    disk: "Disk Serial",
    mac: "MAC Address",
    adminPanel: "Admin Panel",
    userManagement: "User Management",
    suspend: "Suspend",
    ban: "Ban",
    active: "Active",
    suspended: "Suspended",
    banned: "Banned",
    language: "Language",
    logs: "Logs",
    actions: "Actions",
    deepClean: "Deep Clean",
    optimizeWindows: "Optimize Windows",
    restoreDefaults: "Restore Defaults",
    restartPc: "Restart PC",
    bulkGenerate: "Bulk Generate",
    resetHwid: "Reset HWID",
    spoofer5m: "SPOOFER 5M",
    confirmRestart: "Are you sure you want to restart your PC?",
    count: "Count",
    duration: "Duration"
  },
  ar: {
    title: "KING",
    subtitle: "نظام حماية النخبة",
    accessSystem: "دخول النظام",
    enterKey: "أدخل كود التفعيل",
    authKey: "مفتاح المصادقة",
    dashboard: "لوحة التحكم",
    spoofer: "المخفي",
    cleanLogs: "تنظيف السجلات",
    ipRotation: "تدوير الـ IP",
    macSpoof: "مخفي الـ MAC",
    boost: "تعزيز المخفي",
    regCleaner: "منظف الريجستري",
    status: "الحالة",
    undetected: "غير مكشوف",
    cpuLoad: "حمل المعالج",
    ramUsage: "استهلاك الرام",
    gpuTemp: "حرارة الكرت",
    fpsBoost: "تعزيز الفريمات",
    terminal: "لوحة التحكم البرمجية",
    users: "المستخدمين",
    staff: "الموظفين",
    logout: "تسجيل الخروج",
    protectionActive: "الحماية مفعلة",
    protectionInactive: "الحماية معطلة",
    startProtection: "بدء الحماية",
    stopProtection: "إيقاف الحماية",
    hwid: "معرف الجهاز",
    ip: "عنوان الـ IP",
    disk: "سيريال القرص",
    mac: "عنوان الـ MAC",
    adminPanel: "لوحة الإدارة",
    userManagement: "إدارة المستخدمين",
    suspend: "تعليق",
    ban: "حظر",
    active: "نشط",
    suspended: "معلق",
    banned: "محظور",
    language: "اللغة",
    logs: "السجلات",
    actions: "الإجراءات",
    deepClean: "تنظيف عميق",
    optimizeWindows: "تحسين ويندوز",
    restoreDefaults: "استعادة الافتراضي",
    restartPc: "إعادة تشغيل",
    bulkGenerate: "توليد كمية",
    resetHwid: "إعادة ضبط HWID",
    spoofer5m: "SPOOFER 5M",
    confirmRestart: "هل أنت متأكد من إعادة تشغيل الجهاز؟",
    count: "العدد",
    duration: "المدة"
  }
};

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorInfo: ''
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  public static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, errorInfo: error.message };
  }

  public componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8 text-center">
          <div className="glass-panel p-8 rounded-2xl max-w-md border-red-500/30">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h1 className="text-xl font-bold mb-2">System Error Detected</h1>
            <p className="text-white/40 text-sm mb-6">The KING core encountered a critical exception.</p>
            <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-red-400 text-left overflow-auto max-h-40 mb-6">
              {this.state.errorInfo}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-2 rounded-lg transition-colors"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// --- Types ---
type LogEntry = {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
};

type AdminRole = 'owner' | 'admin' | 'supervisor' | null;

type AppState = 'login' | 'dashboard' | 'admin_panel' | 'user_management';

type LicenseKey = {
  id: string;
  key: string;
  expiryDate: string;
  isLifetime: boolean;
  status: 'active' | 'expired' | 'revoked';
  hwid?: string;
  lastIp?: string;
};

type AdminUser = {
  id: string;
  uid: string;
  email: string;
  code: string;
  role: 'owner' | 'admin' | 'supervisor';
  addedBy: string;
  hwid?: string;
  status: 'active' | 'suspended';
  createdAt: string;
};

// --- Components ---

const StarsBackground = ({ intensity = 1 }: { intensity?: number }) => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; duration: string; color: string }[]>([]);

  useEffect(() => {
    const colors = ['#ffffff', '#00FF7F', '#00d2ff', '#ff0055'];
    const newStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${(Math.random() * 3 + 2) / intensity}s`,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setStars(newStars);
  }, [intensity]);

  return (
    <div className="stars-container">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            boxShadow: star.color !== '#ffffff' ? `0 0 10px ${star.color}` : 'none',
            '--duration': star.duration
          } as any}
        />
      ))}
    </div>
  );
};

const Terminal = ({ logs, visible }: { logs: LogEntry[]; visible: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!visible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-black/80 border border-gaming-border rounded-lg p-4 font-mono text-[10px] h-64 overflow-hidden flex flex-col shadow-inner"
    >
      <div className="flex items-center gap-2 mb-2 border-b border-gaming-border pb-2 opacity-50">
        <TerminalIcon size={12} />
        <span>KING_SECURE_LOGS_V2.0</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto terminal-scrollbar space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-gaming-green/40">[{log.timestamp}]</span>
            <span className={
              log.type === 'success' ? 'text-gaming-green' :
              log.type === 'warning' ? 'text-yellow-400' :
              log.type === 'error' ? 'text-red-500' :
              'text-white/70'
            }>
              {log.type === 'info' ? '> ' : log.type === 'success' ? '✓ ' : '! '}
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
  <div className="glass-panel rounded-xl p-4 flex items-center gap-4 hover:border-gaming-green/30 transition-colors group">
    <div className={`p-3 rounded-lg bg-${color}/10 text-${color} group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-lg font-bold">{value}</p>
        <p className="text-[9px] text-gaming-green">{subValue}</p>
      </div>
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, title, description, onClick, color, loading, small, bgImage }: any) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={`group relative glass-panel hover:border-gaming-green/50 rounded-xl p-4 text-left transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${small ? 'col-span-1' : ''}`}
  >
    {bgImage && (
      <div 
        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-all duration-700 bg-cover bg-center scale-110 group-hover:scale-100"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
    )}
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/5 blur-3xl -mr-12 -mt-12 group-hover:bg-${color}/10 transition-colors`} />
    <div className="flex items-start justify-between mb-3 relative z-10">
      <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
        <Icon size={20} />
      </div>
      {loading && (
        <RefreshCw className="animate-spin text-gaming-green" size={16} />
      )}
    </div>
    <h3 className="font-bold text-sm mb-1 group-hover:text-gaming-green transition-colors relative z-10">{title}</h3>
    {!small && <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2 relative z-10">{description}</p>}
  </button>
);

const Notification = ({ message, visible, onClose }: { message: string; visible: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        initial={{ opacity: 0, y: 50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 20, x: '-50%' }}
        className="fixed bottom-10 left-1/2 glass-panel px-6 py-3 rounded-full border-gaming-green/50 text-gaming-green font-bold text-sm shadow-[0_0_30px_rgba(0,255,127,0.2)] z-50 flex items-center gap-3"
      >
        <CheckCircle2 size={18} />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

function ObfuscationLayer() {
  const [chars, setChars] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      let res = '';
      const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+=-";
      for (let i = 0; i < 100; i++) {
        res += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      setChars(res);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden font-mono text-[10px] break-all leading-none z-0">
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} className="whitespace-nowrap">{chars}</div>
      ))}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [state, setState] = useState<AppState>('login');
  const [licenseKey, setLicenseKey] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [intensity, setIntensity] = useState(1);
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newDuration, setNewDuration] = useState('30');
  const [bulkCount, setBulkCount] = useState(10);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [lastUpdate] = useState('2026-04-08');
  const [stats, setStats] = useState({
    cpu: '32%',
    ram: '5.4GB',
    gpu: '45°C',
    fps: '+15%'
  });

  // Product Selection State
  const [selectedProduct, setSelectedProduct] = useState<'fivem' | 'spoofer'>('fivem');
  const [options, setOptions] = useState({
    luaMenu: false,
    stealth: false,
    cleaner: false,
    autoRotateIp: false,
    macSpoof: false,
    spooferBoost: false
  });

  // Spoofer 5 AM State
  const [spooferActive, setSpooferActive] = useState(false);
  const [spooferData, setSpooferData] = useState({
    hwid: 'ORIGINAL_HWID_772',
    ip: '192.168.1.1',
    disk: 'SAMSUNG_980_PRO',
    mac: '00:1A:2B:3C:4D:5E'
  });
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const t = translations[lang];

  // Owner Code - Unique to you
  const OWNER_CODE = "KING-C9D0-E1F21";
  const ADMIN_KD_CODE = "KD 1421";
  const ADMIN_KD_ALT = "admin KD";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Only reset state if the user explicitly logs out (currentUser becomes null)
      if (!currentUser) {
        setState('login');
        setAdminRole(null);
      }
    });
    return () => unsubscribe();
  }, []); // Remove [state] dependency to prevent reset loops

  // Real-time Spoofer Logic
  useEffect(() => {
    let interval: any;
    if (spooferActive) {
      addLog('KING: Protection active.', 'success');
      
      // Initial spoof
      setSpooferData(prev => ({
        ...prev,
        hwid: `SPOOFED_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        ip: `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        mac: Array.from({ length: 6 }).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase()
      }));

      if (options.autoRotateIp) {
        addLog('KING: Auto-IP rotation enabled.', 'info');
        interval = setInterval(() => {
          setSpooferData(prev => ({
            ...prev,
            ip: `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            mac: Array.from({ length: 6 }).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase()
          }));
          
          if (Math.random() > 0.9) {
            addLog('KING: Rotating identity...', 'info');
          }
        }, 15000); // Slower rotation to prevent disconnects
      }
    } else {
      setSpooferData({
        hwid: 'ORIGINAL_HWID_772',
        ip: '192.168.1.1',
        disk: 'SAMSUNG_980_PRO',
        mac: '00:1A:2B:3C:4D:5E'
      });
    }
    return () => clearInterval(interval);
  }, [spooferActive, options.autoRotateIp]);

  // Encryption Helper (Simulated AES-256)
  const encryptData = (data: string) => {
    return btoa(data).split('').reverse().join(''); // Simple reversible "encryption" for demo
  };

  const decryptData = (data: string) => {
    return atob(data.split('').reverse().join(''));
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const simulateProcess = async (name: string, steps: string[]) => {
    setIsProcessing(true);
    setTerminalVisible(true);
    addLog(`Starting ${name}...`, 'info');
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
      addLog(step, 'info');
    }
    addLog(`${name} completed successfully.`, 'success');
    setIsProcessing(false);
    triggerSuccess(`${name} Finished`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setState('login');
      setAdminRole(null);
      addLog('Logged out successfully.', 'info');
    } catch (error) {
      console.error(error);
    }
  };

  const fullReset = () => simulateProcess('Full Reset', [
    'Reverting all temporary changes...',
    'Restoring original system identifiers...',
    'Wiping session logs...',
    'System reset complete.'
  ]);

  const restartPC = () => simulateProcess('System Reboot', [
    'Closing all active processes...',
    'Flushing system buffers...',
    'Initiating secure reboot sequence...',
    'Reboot command sent.'
  ]);

  const logToDatabase = async (action: string, status: 'success' | 'error', details: string = '') => {
    const userId = auth.currentUser ? auth.currentUser.uid : 'unauthenticated';
    try {
      await addDoc(collection(db, 'logs'), {
        userId,
        action,
        timestamp: new Date().toISOString(),
        status,
        details: encryptData(details),
        hwid: encryptData(getFingerprint()),
        role: adminRole || 'user'
      });
    } catch (error) {
      console.error("Logging failed", error);
    }
  };

  const updateAdminStatus = async (id: string, status: 'active' | 'suspended' | 'banned') => {
    if (adminRole !== 'owner') return;
    try {
      await updateDoc(doc(db, 'admins', id), { status });
      triggerSuccess(`Admin status updated to ${status}`);
      fetchAdmins();
    } catch (e) {
      console.error("Error updating admin status", e);
    }
  };

  const updateKeyStatus = async (id: string, status: 'active' | 'suspended' | 'banned') => {
    if (adminRole === 'supervisor') return;
    try {
      await updateDoc(doc(db, 'keys', id), { status });
      triggerSuccess(`Key status updated to ${status}`);
      fetchKeys();
    } catch (e) {
      console.error("Error updating key status", e);
    }
  };

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setLogs(prev => [...prev, newLog]);
  };

  const getFingerprint = () => {
    // Simulated HWID based on browser/system info
    return btoa(navigator.userAgent + navigator.language + screen.width).slice(0, 16);
  };

  const checkGitHubKeys = async (key: string) => {
    try {
      // Fetch from the GitHub repository provided by user
      const response = await fetch('https://raw.githubusercontent.com/moody4383/king-auth/main/codes.txt');
      if (response.ok) {
        const text = await response.text();
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const [k, expiry] = line.split('|');
          
          if (k === key) {
            // First 2 lines are admins as requested
            if (i < 2) {
              return { type: 'admin', key: k, role: 'admin' };
            } else {
              return { type: 'user', key: k, expiryDate: expiry || '2027-12-31' };
            }
          }
        }
      }
    } catch (e) {
      console.error("GitHub fetch failed", e);
    }
    return null;
  };

  const getRemainingTime = () => {
    if (!expiryDate) return "LIFETIME";
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return "EXPIRED";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} days, ${hours} hours`;
  };
  
  const handleLicenseLogin = async (e: FormEvent) => {
    e.preventDefault();
    const key = licenseKey.trim();
    if (!key) return;

    setIsProcessing(true);
    addLog('Establishing encrypted connection...', 'info');
    addLog('Bypassing security layers...', 'info');

    try {
      const fingerprint = getFingerprint();

      const trySignIn = async () => {
        try {
          // Try anonymous sign in, but don't block if it fails
          // since we use GitHub for primary validation
          if (!auth.currentUser) {
            await signInAnonymously(auth);
          }
        } catch (e: any) {
          console.warn("Firebase Auth failed, proceeding with code validation only", e);
        }
      };

      // 1. Check Owner Code
      if (key === OWNER_CODE) {
        addLog('Owner identity verified. Welcome back, KING.', 'success');
        await trySignIn();
        setAdminRole('owner');
        setState('dashboard');
        triggerSuccess('Welcome back, KING.');
        return;
      }

      // 2. Check Admin KD Code
      if (key === ADMIN_KD_CODE || key === ADMIN_KD_ALT) {
        addLog('Admin KD identity verified.', 'success');
        await trySignIn();
        setAdminRole('admin');
        setState('dashboard');
        triggerSuccess('Welcome, Admin KD');
        return;
      }

      // 3. Check Admin Database
      const adminQuery = query(collection(db, 'admins'), where('code', '==', key), where('status', '==', 'active'));
      const adminSnapshot = await getDocs(adminQuery);

      if (!adminSnapshot.empty) {
        const adminDoc = adminSnapshot.docs[0];
        const adminData = adminDoc.data() as AdminUser;

        if (adminData.hwid && adminData.hwid !== fingerprint) {
          addLog('ERROR: Admin code locked to another device.', 'error');
          setIsProcessing(false);
          return;
        }

        await trySignIn();
        if (!adminData.hwid) {
          await updateDoc(doc(db, 'admins', adminDoc.id), { hwid: fingerprint });
          addLog('Admin device linked successfully.', 'info');
        }

        addLog(`Admin access granted: ${adminData.role.toUpperCase()}`, 'success');
        setAdminRole(adminData.role);
        setState('dashboard');
        triggerSuccess(`Welcome, ${adminData.role}`);
        return;
      }

      // 4. Check License Keys (Normal Users)
      const q = query(collection(db, 'keys'), where('key', '==', key), where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const keyDoc = querySnapshot.docs[0];
        const keyData = keyDoc.data();

        if (keyData.hwid && keyData.hwid !== fingerprint) {
          addLog('ERROR: License locked to another device.', 'error');
          setIsProcessing(false);
          return;
        }

        await trySignIn();
        if (!keyData.hwid) {
          await updateDoc(doc(db, 'keys', keyDoc.id), { hwid: fingerprint });
          addLog('Device linked to license successfully.', 'info');
        }

        const expiry = new Date(keyData.expiryDate);
        if (expiry > new Date() || keyData.isLifetime) {
          addLog('License validated.', 'success');
          setExpiryDate(keyData.isLifetime ? null : keyData.expiryDate);
          
          // Store IP on login for admin tracking
          try {
            await updateDoc(doc(db, 'keys', keyDoc.id), { lastIp: spooferData.ip });
          } catch (e) {
            console.warn("Failed to update lastIp", e);
          }

          setState('dashboard');
          triggerSuccess('Successfully Logged In');
          logToDatabase('License Login', 'success', `Key: ${key}`);
        } else {
          addLog('License has expired.', 'error');
          await updateDoc(doc(db, 'keys', keyDoc.id), { status: 'expired' });
        }
      } else {
        // 5. Check GitHub
        addLog('Checking global database...', 'info');
        const githubResult = await checkGitHubKeys(key);
        
        if (githubResult) {
          await trySignIn();
          if (githubResult.type === 'admin') {
            addLog('Global admin license found.', 'success');
            setAdminRole(githubResult.role as any);
            setExpiryDate(null);
            setState('dashboard');
            triggerSuccess(`Welcome, ${githubResult.role}`);
          } else {
            addLog('Global license found. Syncing...', 'info');
            const exp = new Date(githubResult.expiryDate).toISOString();
            await setDoc(doc(db, 'keys', githubResult.key), {
              key: githubResult.key,
              expiryDate: exp,
              isLifetime: false,
              status: 'active',
              hwid: fingerprint,
              createdAt: new Date().toISOString()
            });

            addLog('License validated and locked to this device.', 'success');
            setExpiryDate(exp);
            setState('dashboard');
            triggerSuccess('Successfully Logged In');
            logToDatabase('GitHub License Login', 'success', `Key: ${key}`);
          }
        } else {
          addLog('Invalid or revoked access code.', 'error');
        }
      }
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        addLog('Permission Denied: Database is locked.', 'error');
      } else {
        addLog('Authentication error.', 'error');
      }
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const addAdmin = async (email: string, role: 'admin' | 'supervisor', code: string) => {
    if (!adminRole || (adminRole !== 'owner' && adminRole !== 'admin')) return;
    if (adminRole === 'admin' && role === 'admin') return; // Admin can only add supervisors

    try {
      await addDoc(collection(db, 'admins'), {
        email,
        role,
        code,
        addedBy: auth.currentUser?.uid || 'owner',
        status: 'active',
        createdAt: new Date().toISOString()
      });
      triggerSuccess(`${role} added successfully.`);
      fetchAdmins();
    } catch (e) {
      console.error("Error adding admin", e);
    }
  };

  const removeAdmin = async (id: string) => {
    if (adminRole !== 'owner') return;
    try {
      await deleteDoc(doc(db, 'admins', id));
      triggerSuccess('Admin removed.');
      fetchAdmins();
    } catch (e) {
      console.error("Error removing admin", e);
    }
  };

  const fetchAdmins = async () => {
    if (!adminRole) return;
    try {
      const q = collection(db, 'admins');
      const snap = await getDocs(q);
      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser)));
    } catch (e) {
      console.error("Error fetching admins", e);
    }
  };

  const toggleSpoofer = () => {
    if (spooferActive) {
      setSpooferActive(false);
      addLog('SPOOFER 5 AM: Deactivated. Reverting to original identity.', 'warning');
    } else {
      setSpooferActive(true);
      addLog('SPOOFER 5 AM: Activated. Identity protection engaged.', 'success');
    }
  };

  const cleanRegistryStore = () => simulateProcess('Registry Store Clean', [
    'Opening Regedit Path: HKEY_CURRENT_USER\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Compatibility Assistant\\Store',
    'Scanning for stored application traces...',
    'Deleting all entries in Store...',
    'Registry clean successful. Traces wiped.'
  ]);

  const fetchKeys = async () => {
    if (!adminRole) return;
    try {
      const querySnapshot = await getDocs(collection(db, 'keys'));
      const keysList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LicenseKey));
      setKeys(keysList);
    } catch (e) {
      console.error("Error fetching keys", e);
    }
  };

  const addLicenseKey = async () => {
    if (!newKey || !adminRole) return;
    try {
      const expiry = new Date();
      let isLifetime = false;
      if (newDuration === 'lifetime') {
        isLifetime = true;
        expiry.setFullYear(expiry.getFullYear() + 100);
      } else {
        // Precise hours: 1 day = 24h, 3 days = 72h, etc.
        const days = parseInt(newDuration);
        expiry.setHours(expiry.getHours() + (days * 24));
      }

      // Use the key itself as the document ID
      await setDoc(doc(db, 'keys', newKey), {
        key: newKey,
        expiryDate: expiry.toISOString(),
        isLifetime,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      triggerSuccess(`License Key Added (${newDuration} Days)`);
      setNewKey('');
      fetchKeys();
    } catch (e) {
      console.error("Error adding key", e);
    }
  };

  const deleteLicenseKey = async (id: string) => {
    if (!adminRole) return;
    try {
      await deleteDoc(doc(db, 'keys', id));
      triggerSuccess('License Key Deleted');
      fetchKeys();
    } catch (e) {
      console.error("Error deleting key", e);
    }
  };

  const resetKeyHwid = async (id: string) => {
    if (!adminRole) return;
    try {
      await updateDoc(doc(db, 'keys', id), { hwid: null });
      triggerSuccess('HWID Link Reset');
      fetchKeys();
      logToDatabase('Reset HWID', 'success', `Key: ${id}`);
    } catch (e) {
      console.error("Error resetting HWID", e);
    }
  };

  const bulkGenerateKeys = async () => {
    if (!adminRole) return;
    try {
      const count = Math.min(bulkCount, 500);
      const batch: Promise<any>[] = [];
      
      for (let i = 0; i < count; i++) {
        const randomKey = `KING-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const expiry = new Date();
        let isLifetime = false;

        if (newDuration === 'lifetime') {
          isLifetime = true;
          expiry.setFullYear(expiry.getFullYear() + 100);
        } else {
          const days = parseInt(newDuration);
          expiry.setHours(expiry.getHours() + (days * 24));
        }

        batch.push(setDoc(doc(db, 'keys', randomKey), {
          key: randomKey,
          expiryDate: expiry.toISOString(),
          isLifetime,
          status: 'active',
          createdAt: new Date().toISOString()
        }));
      }

      await Promise.all(batch);
      triggerSuccess(`Generated ${count} License Keys`);
      fetchKeys();
      logToDatabase('Bulk Generate', 'success', `Count: ${count}, Duration: ${newDuration}`);
    } catch (e) {
      console.error("Error bulk generating keys", e);
    }
  };

  const restartPc = () => {
    if (window.confirm(t.confirmRestart)) {
      simulateProcess('Restarting PC', [
        'Closing all applications...',
        'Saving system state...',
        'Flushing memory...',
        'System restart initiated...',
        'Rebooting in 5 seconds...'
      ]);
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }
  };

  const deepClean = () => {
    simulateProcess('Deep Cleaning', [
      'Cleaning TEMP folders...',
      'Cleaning Prefetch cache...',
      'Cleaning NVIDIA GPU Cache...',
      'Deleting .log files in C:\\...',
      'Repairing desktop icon cache...',
      'Deep Clean completed successfully.'
    ]);
  };

  const optimizeWindows = () => {
    simulateProcess('Optimizing Windows', [
      'Enabling Ultimate Performance power plan...',
      'Enabling Gaming Mode in registry...',
      'Disabling unnecessary services (SysMain, WSearch)...',
      'Disabling Game DVR...',
      'Enabling Windows Defender protection...',
      'Optimization completed successfully.'
    ]);
  };

  const restoreDefaults = () => {
    simulateProcess('Restoring Defaults', [
      'Restoring Balanced power plan...',
      'Enabling Game DVR...',
      'Restoring system services...',
      'Gaming settings restored to default.'
    ]);
  };

  useEffect(() => {
    if (state === 'user_management' || state === 'admin_panel') {
      fetchKeys();
      fetchAdmins();
    }
  }, [state, adminRole]);

  // Simulate dynamic stats
  useEffect(() => {
    if (state === 'dashboard') {
      const interval = setInterval(() => {
        setStats({
          cpu: `${Math.floor(15 + Math.random() * 15)}%`,
          ram: `${(3 + Math.random() * 2).toFixed(1)}GB`,
          gpu: `${Math.floor(35 + Math.random() * 10)}°C`,
          fps: `+${Math.floor(15 + Math.random() * 15)}%`
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [state]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative selection:bg-gaming-green/30">
        <StarsBackground intensity={intensity} />
        <ObfuscationLayer />
        <Notification message={successMsg} visible={showSuccess} onClose={() => setShowSuccess(false)} />
        
        <AnimatePresence mode="wait">
          {state === 'login' ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-md glass-panel rounded-3xl p-10 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-gaming-green/10 blur-[100px] rounded-full" />
              
              <div className="flex flex-col items-center mb-10 relative">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="w-20 h-20 bg-gaming-green/10 rounded-2xl flex items-center justify-center mb-6 border border-gaming-green/20 shadow-[0_0_30px_rgba(0,255,127,0.15)]"
                >
                  <Shield className="text-gaming-green" size={40} />
                </motion.div>
                <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent uppercase">{t.title}</h1>
                <p className="text-gaming-green text-[10px] mt-2 uppercase tracking-[0.3em] font-black">{t.subtitle}</p>
              </div>

              <form onSubmit={handleLicenseLogin} className="space-y-4 relative">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-white/40 ml-1 tracking-widest">{t.authKey}</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gaming-green transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      placeholder={t.enterKey}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-gaming-green/50 transition-all font-mono tracking-widest uppercase text-center"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gaming-green text-black font-black py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg hover:shadow-gaming-green/20 disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  {t.accessSystem}
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-black">
                  ALNAQBI SECURE SYSTEMS • 2026
                </p>
              </div>
            </motion.div>
          ) : state === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-5xl space-y-6 relative z-10"
            >
              {/* Top Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 shadow-2xl border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gaming-green/10 rounded-2xl flex items-center justify-center border border-gaming-green/20 shadow-[0_0_20px_rgba(0,255,127,0.1)]">
                    <Zap className="text-gaming-green" size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                      {t.spoofer5m}
                      <span className="text-gaming-green text-[10px] px-2 py-1 border border-gaming-green/30 rounded-lg bg-gaming-green/5 font-black tracking-widest uppercase">PRO</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">{t.status}: <span className="text-gaming-green">{t.undetected}</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest"
                  >
                    <Globe size={14} />
                    {lang === 'en' ? 'AR' : 'EN'}
                  </button>
                  {adminRole && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setState('user_management')}
                        className="flex items-center gap-2 px-4 py-2 bg-gaming-green/10 text-gaming-green border border-gaming-green/20 rounded-xl hover:bg-gaming-green/20 transition-all font-bold text-[10px] uppercase tracking-widest"
                      >
                        <Database size={14} />
                        {t.users}
                      </button>
                      {(adminRole === 'owner' || adminRole === 'admin') && (
                        <button 
                          onClick={() => setState('admin_panel')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all font-bold text-[10px] uppercase tracking-widest"
                        >
                          <Settings size={14} />
                          {t.staff}
                        </button>
                      )}
                    </div>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="p-3 hover:bg-red-500/10 rounded-xl transition-all text-white/20 hover:text-red-500 border border-transparent hover:border-red-500/20"
                    title={t.logout}
                  >
                    <LogOut size={22} />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Cpu} label={t.cpuLoad} value={stats.cpu} subValue="-12%" color="blue-500" />
                <StatCard icon={Database} label={t.ramUsage} value={stats.ram} subValue="Optimized" color="purple-500" />
                <StatCard icon={Activity} label={t.gpuTemp} value={stats.gpu} subValue="Stable" color="orange-500" />
                <StatCard icon={Zap} label={t.fpsBoost} value={stats.fps} subValue="Active" color="gaming-green" />
              </div>

              {/* Main App Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Actions */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Spoofer Advanced Section - Hidden by default */}
                  {showAdvanced && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel rounded-2xl p-6 border-white/5"
                    >
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 space-y-4 w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Server size={20} className="text-gaming-green" />
                              <h2 className="text-sm font-black tracking-widest uppercase">{t.spoofer}</h2>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${spooferActive ? 'bg-gaming-green/20 text-gaming-green animate-pulse' : 'bg-white/5 text-white/20'}`}>
                              {spooferActive ? t.active.toUpperCase() : 'STANDBY'}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                              <p className="text-[9px] text-white/20 uppercase font-bold mb-1">{t.hwid}</p>
                              <p className={`text-[10px] font-mono font-bold ${spooferActive ? 'text-gaming-green' : 'text-white/40'}`}>{spooferData.hwid}</p>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                              <p className="text-[9px] text-white/20 uppercase font-bold mb-1">{t.ip}</p>
                              <p className={`text-[10px] font-mono font-bold ${spooferActive ? 'text-gaming-green' : 'text-white/40'}`}>
                                {(adminRole === 'owner' || adminRole === 'admin') ? spooferData.ip : '••••••••••••'}
                              </p>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                              <p className="text-[9px] text-white/20 uppercase font-bold mb-1">{t.disk}</p>
                              <p className={`text-[10px] font-mono font-bold ${spooferActive ? 'text-gaming-green' : 'text-white/40'}`}>{spooferData.disk}</p>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                              <p className="text-[9px] text-white/20 uppercase font-bold mb-1">{t.mac}</p>
                              <p className={`text-[10px] font-mono font-bold ${spooferActive ? 'text-gaming-green' : 'text-white/40'}`}>{spooferData.mac}</p>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={toggleSpoofer}
                          className={`px-8 py-4 rounded-xl border transition-all duration-300 font-black text-xs uppercase tracking-widest ${spooferActive ? 'border-gaming-green bg-gaming-green/10 text-gaming-green' : 'border-white/10 bg-white/5 text-white/40'}`}
                        >
                          {spooferActive ? t.stopProtection : t.startProtection}
                        </button>
                      </div>
                    </motion.div>
                  )}

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <ActionButton 
                        icon={ShieldCheck}
                        title={t.spoofer}
                        description="Generate new hardware identifiers to bypass bans."
                        onClick={() => {
                          setShowAdvanced(true);
                          simulateProcess('Spoofing', ['Reading original HWID...', 'Generating new serials...', 'Updating registry...', 'Hardware Spoofed Successfully.']);
                        }}
                        color="blue-500"
                        loading={isProcessing}
                        bgImage="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400"
                      />
                      <ActionButton 
                        icon={Eraser}
                        title={t.deepClean}
                        description="Deep clean logs, temp files, and GPU cache."
                        onClick={deepClean}
                        color="red-500"
                        loading={isProcessing}
                        bgImage="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400"
                      />
                      <ActionButton 
                        icon={Zap}
                        title={t.optimizeWindows}
                        description="Optimize Windows for maximum gaming performance."
                        onClick={optimizeWindows}
                        color="gaming-green"
                        loading={isProcessing}
                        bgImage="https://images.unsplash.com/photo-1510511459019-5dee99c48db8?auto=format&fit=crop&q=80&w=400"
                      />
                      <ActionButton 
                        icon={RefreshCw}
                        title={t.restoreDefaults}
                        description="Restore Windows gaming settings to default."
                        onClick={restoreDefaults}
                        color="orange-500"
                        loading={isProcessing}
                        bgImage="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400"
                      />
                      <ActionButton 
                        icon={RefreshCw}
                        title={t.restartPc}
                        description="Restart your PC to apply all changes."
                        onClick={restartPc}
                        color="blue-400"
                        loading={isProcessing}
                        bgImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400"
                      />
                      <ActionButton 
                        icon={Globe}
                        title={t.ipRotation}
                        description="Toggle automatic IP rotation to prevent detection."
                        onClick={() => {
                          setOptions(prev => ({ ...prev, autoRotateIp: !prev.autoRotateIp }));
                          addLog(`IP Rotation: ${!options.autoRotateIp ? 'ENABLED' : 'DISABLED'}`, 'info');
                        }}
                        color={options.autoRotateIp ? "gaming-green" : "white/20"}
                        loading={isProcessing}
                        bgImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400"
                      />
                    </div>

                  <button 
                    onClick={() => simulateProcess('Master Initialization', ['Syncing with server...', 'Loading modules...', 'Activating protection...', 'System Ready.'])}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-gaming-green to-blue-500 text-black font-black py-6 rounded-2xl shadow-[0_0_50px_rgba(0,255,127,0.2)] hover:shadow-[0_0_70px_rgba(0,255,127,0.3)] transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 text-xl tracking-tighter uppercase">
                      {isProcessing ? <RefreshCw className="animate-spin" size={24} /> : <Zap size={24} />}
                      MASTER START
                    </div>
                    <p className="text-[10px] font-bold opacity-50 tracking-widest uppercase group-hover:opacity-80 transition-opacity">Initialize Full Protection Suite</p>
                  </button>
                </div>

                {/* Right Column - Info */}
                <div className="space-y-6">
                  <div className="glass-panel rounded-2xl p-6 border-white/5">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Clock size={14} />
                      Subscription Info
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-[10px] uppercase font-bold">Status</span>
                        <span className="text-gaming-green text-[10px] font-black uppercase tracking-widest">Active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-[10px] uppercase font-bold">Expiry</span>
                        <span className="text-white text-[10px] font-black tracking-widest">{getRemainingTime()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-[10px] uppercase font-bold">Type</span>
                        <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{expiryDate ? 'Premium' : 'Lifetime'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-2xl p-6 border-white/5">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <ShieldAlert size={14} />
                      Protection Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-[9px] font-bold uppercase">Anti-Cheat Bypass</span>
                        <div className="w-2 h-2 bg-gaming-green rounded-full shadow-[0_0_10px_#00FF7F]" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-[9px] font-bold uppercase">Kernel Driver</span>
                        <div className="w-2 h-2 bg-gaming-green rounded-full shadow-[0_0_10px_#00FF7F]" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-[9px] font-bold uppercase">Stealth Mode</span>
                        <div className="w-2 h-2 bg-gaming-green rounded-full shadow-[0_0_10px_#00FF7F]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal - Only visible to admins */}
              {terminalVisible && (adminRole === 'owner' || adminRole === 'admin') && <Terminal logs={logs} visible={terminalVisible} />}

              <div className="text-center opacity-20 hover:opacity-100 transition-opacity">
                <div className="flex justify-center gap-4 mb-2">
                  {(adminRole === 'owner' || adminRole === 'admin') && (
                    <button 
                      onClick={() => setTerminalVisible(!terminalVisible)}
                      className="text-[8px] text-white/40 hover:text-gaming-green transition-colors uppercase tracking-widest font-black"
                    >
                      {terminalVisible ? 'HIDE TERMINAL' : 'SHOW TERMINAL'}
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                  5S SPOOFER 5M • ELITE EDITION • 2026
                </p>
              </div>
            </motion.div>
          ) : state === 'admin_panel' ? (
            <motion.div 
              key="admin_panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-5xl glass-panel rounded-3xl p-8 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gaming-green/10 text-gaming-green">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase">{t.adminPanel}</h2>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest">Manage Admins & Supervisors</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setState('dashboard')}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest"
                  >
                    BACK
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Admin Form */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="glass-panel p-6 rounded-2xl border-white/5">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <UserPlus size={14} />
                      Add New Staff
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] text-white/40 uppercase font-black ml-1">Email Address</label>
                        <input 
                          type="email" 
                          id="admin-email"
                          placeholder="staff@alnaqbi.com"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-gaming-green/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] text-white/40 uppercase font-black ml-1">Access Code</label>
                        <input 
                          type="text" 
                          id="admin-code"
                          placeholder="STAFF-XXXX"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-gaming-green/50 transition-all font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] text-white/40 uppercase font-black ml-1">Role Level</label>
                        <select 
                          id="admin-role"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-gaming-green/50 transition-all"
                        >
                          {adminRole === 'owner' && <option value="admin">Admin</option>}
                          <option value="supervisor">Supervisor</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => {
                          const email = (document.getElementById('admin-email') as HTMLInputElement).value;
                          const code = (document.getElementById('admin-code') as HTMLInputElement).value;
                          const role = (document.getElementById('admin-role') as HTMLSelectElement).value as any;
                          addAdmin(email, role, code);
                        }}
                        className="w-full bg-gaming-green text-black font-black py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest"
                      >
                        CONFIRM ADDITION
                      </button>
                    </div>
                  </div>
                </div>

                {/* Staff List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <UserCog size={14} />
                      Current Staff Hierarchy
                    </h3>
                    <span className="text-[9px] text-gaming-green font-mono uppercase font-black">{admins.length} STAFF ONLINE</span>
                  </div>
                  
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 terminal-scrollbar">
                    {admins.map((adm) => (
                      <div key={adm.id} className="glass-panel p-4 rounded-xl flex items-center justify-between border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${adm.status === 'banned' ? 'bg-red-600' : adm.status === 'suspended' ? 'bg-yellow-500' : adm.role === 'owner' ? 'bg-gaming-green' : adm.role === 'admin' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${adm.role === 'owner' ? 'bg-gaming-green/10 text-gaming-green' : adm.role === 'admin' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                            {adm.role === 'owner' ? <Shield size={18} /> : adm.role === 'admin' ? <UserCheck size={18} /> : <UserCog size={18} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-white/80">{adm.email}</p>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest ${adm.role === 'owner' ? 'bg-gaming-green/20 text-gaming-green' : adm.role === 'admin' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}>
                                {adm.role}
                              </span>
                              {adm.status !== 'active' && (
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest ${adm.status === 'banned' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                  {adm.status}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[9px] text-white/20 font-bold uppercase tracking-widest">
                              <span className="flex items-center gap-1"><Key size={8} /> {adm.code}</span>
                              <div className="w-1 h-1 bg-white/10 rounded-full" />
                              <span className="flex items-center gap-1"><Monitor size={8} /> {adm.hwid ? `LOCKED: ${adm.hwid}` : 'UNLOCKED'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {adminRole === 'owner' && adm.role !== 'owner' && (
                            <>
                              <button 
                                onClick={() => updateAdminStatus(adm.id, adm.status === 'active' ? 'suspended' : 'active')}
                                className={`p-2 rounded-lg transition-colors ${adm.status === 'suspended' ? 'text-yellow-500 bg-yellow-500/10' : 'text-white/20 hover:text-yellow-500 hover:bg-yellow-500/10'}`}
                                title={adm.status === 'suspended' ? "Activate" : "Suspend"}
                              >
                                <ShieldAlert size={16} />
                              </button>
                              <button 
                                onClick={() => updateAdminStatus(adm.id, adm.status === 'banned' ? 'active' : 'banned')}
                                className={`p-2 rounded-lg transition-colors ${adm.status === 'banned' ? 'text-red-500 bg-red-500/10' : 'text-white/20 hover:text-red-500 hover:bg-red-500/10'}`}
                                title={adm.status === 'banned' ? "Unban" : "Ban"}
                              >
                                <ShieldX size={16} />
                              </button>
                              <button 
                                onClick={() => removeAdmin(adm.id)}
                                className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : state === 'user_management' ? (
            <motion.div 
              key="user_management"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-5xl glass-panel rounded-3xl p-8 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gaming-green/10 rounded-xl text-gaming-green">
                    <Database size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase">{t.userManagement}</h2>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest">Manage Global License Keys</p>
                  </div>
                </div>
                <button 
                  onClick={() => setState('dashboard')}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest"
                >
                  {lang === 'en' ? 'BACK' : 'رجوع'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Key Form */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="glass-panel p-6 rounded-2xl border-white/5">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Key size={14} />
                      {lang === 'en' ? 'Generate License' : 'توليد كود تفعيل'}
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] text-white/40 uppercase font-black ml-1">{lang === 'en' ? 'License Key' : 'كود التفعيل'}</label>
                        <input 
                          type="text" 
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          placeholder="KING-XXXX-XXXX"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-gaming-green/50 transition-all font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] text-white/40 uppercase font-black ml-1">{lang === 'en' ? 'Duration' : 'المدة'}</label>
                        <select 
                          value={newDuration}
                          onChange={(e) => setNewDuration(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-gaming-green/50 transition-all"
                        >
                          <option value="1">{lang === 'en' ? '1 Day' : 'يوم واحد'}</option>
                          <option value="3">{lang === 'en' ? '3 Days' : '3 أيام'}</option>
                          <option value="7">{lang === 'en' ? '1 Week' : 'أسبوع واحد'}</option>
                          <option value="30">{lang === 'en' ? '30 Days' : '30 يوم'}</option>
                          <option value="lifetime">{lang === 'en' ? 'Lifetime' : 'مدى الحياة'}</option>
                        </select>
                      </div>
                      <button 
                        onClick={addLicenseKey}
                        className="w-full bg-gaming-green text-black font-black py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest"
                      >
                        {lang === 'en' ? 'GENERATE KEY' : 'توليد الكود'}
                      </button>
                    </div>
                  </div>

                  {/* Bulk Generate Form */}
                  <div className="glass-panel p-6 rounded-2xl border-white/5">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Layers size={14} />
                      {t.bulkGenerate}
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] text-white/40 uppercase font-black ml-1">{t.count}</label>
                        <input 
                          type="number" 
                          value={bulkCount}
                          onChange={(e) => setBulkCount(parseInt(e.target.value))}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-gaming-green/50 transition-all"
                        />
                      </div>
                      <button 
                        onClick={bulkGenerateKeys}
                        className="w-full bg-blue-500 text-black font-black py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest"
                      >
                        {t.bulkGenerate}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Keys List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Database size={14} />
                      Active Licenses
                    </h3>
                    <span className="text-[9px] text-gaming-green font-mono uppercase font-black">{keys.length} KEYS ACTIVE</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 terminal-scrollbar">
                    {keys.map((k) => (
                      <div key={k.id} className="glass-panel p-4 rounded-xl flex items-center justify-between border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${k.status === 'active' ? 'bg-gaming-green shadow-[0_0_8px_rgba(0,255,127,0.5)]' : k.status === 'suspended' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="text-sm font-mono font-bold text-white/80">{k.key}</p>
                            <div className="flex items-center gap-3 text-[9px] text-white/20 font-bold uppercase tracking-widest">
                              <span className="flex items-center gap-1"><Calendar size={10} /> {k.isLifetime ? 'LIFETIME' : new Date(k.expiryDate).toLocaleDateString()}</span>
                              {k.hwid && (
                                <>
                                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                                  <span className="flex items-center gap-1"><Lock size={10} /> {k.hwid}</span>
                                </>
                              )}
                              {(adminRole === 'owner' || adminRole === 'admin') && k.lastIp && (
                                <>
                                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                                  <span className="flex items-center gap-1"><Globe size={10} /> {k.lastIp}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {adminRole !== 'supervisor' && (
                            <>
                              <button 
                                onClick={() => resetKeyHwid(k.id)}
                                className="p-2 text-white/20 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title={t.resetHwid}
                              >
                                <RefreshCw size={16} />
                              </button>
                              <button 
                                onClick={() => updateKeyStatus(k.id, k.status === 'active' ? 'suspended' : 'active')}
                                className={`p-2 rounded-lg transition-colors ${k.status === 'suspended' ? 'text-yellow-500 bg-yellow-500/10' : 'text-white/20 hover:text-yellow-500 hover:bg-yellow-500/10'}`}
                                title={k.status === 'suspended' ? "Activate" : "Suspend"}
                              >
                                <ShieldAlert size={16} />
                              </button>
                              <button 
                                onClick={() => updateKeyStatus(k.id, k.status === 'banned' ? 'active' : 'banned')}
                                className={`p-2 rounded-lg transition-colors ${k.status === 'banned' ? 'text-red-500 bg-red-500/10' : 'text-white/20 hover:text-red-500 hover:bg-red-500/10'}`}
                                title={k.status === 'banned' ? "Unban" : "Ban"}
                              >
                                <ShieldX size={16} />
                              </button>
                              <button 
                                onClick={() => deleteLicenseKey(k.id)}
                                className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
