'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  Trophy,
  ClipboardList,
  Globe,
  LogOut,
  Shield,
  Users,
  Lock,
  RotateCcw,
  Save,
  CircleDot,
  Loader2,
  AlertTriangle,
  Medal,
  ChevronDown,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isConfirmed: boolean;
}

interface Match {
  id: string;
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  group: string;
  venue: string | null;
  date: string | null;
  homeScore: number | null;
  awayScore: number | null;
  isCompleted: boolean;
}

interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  user?: { id: string; name: string; isConfirmed: boolean };
  match?: Match;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  exactPredictions: number;
  partialPredictions: number;
  totalPoints: number;
  totalPredictions: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  isConfirmed: boolean;
  createdAt: string;
  _count: { predictions: number };
}

// Country flag emojis
const countryFlags: Record<string, string> = {
  'México': '🇲🇽', 'Sudáfrica': '🇿🇦', 'Corea del Sur': '🇰🇷', 'Chequia': '🇨🇿',
  'Canadá': '🇨🇦', 'Bosnia y Herzegovina': '🇧🇦', 'Qatar': '🇶🇦', 'Suiza': '🇨🇭',
  'Brasil': '🇧🇷', 'Marruecos': '🇲🇦', 'Haití': '🇭🇹', 'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Estados Unidos': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Turquía': '🇹🇷',
  'Alemania': '🇩🇪', 'Curazao': '🇨🇼', 'Costa de Marfil': '🇨🇮', 'Ecuador': '🇪🇨',
  'Países Bajos': '🇳🇱', 'Japón': '🇯🇵', 'Suecia': '🇸🇪', 'Túnez': '🇹🇳',
  'Bélgica': '🇧🇪', 'Egipto': '🇪🇬', 'Irán': '🇮🇷', 'Nueva Zelanda': '🇳🇿',
  'España': '🇪🇸', 'Cabo Verde': '🇨🇻', 'Arabia Saudita': '🇸🇦', 'Uruguay': '🇺🇾',
  'Francia': '🇫🇷', 'Senegal': '🇸🇳', 'Irak': '🇮🇶', 'Noruega': '🇳🇴',
  'Argentina': '🇦🇷', 'Argelia': '🇩🇿', 'Austria': '🇦🇹', 'Jordania': '🇯🇴',
  'Portugal': '🇵🇹', 'RD Congo': '🇨🇩', 'Uzbekistán': '🇺🇿', 'Colombia': '🇨🇴',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croacia': '🇭🇷', 'Ghana': '🇬🇭', 'Panamá': '🇵🇦',
};

// Collapsible Group Component
function MatchGroup({ 
  group, 
  matches, 
  children, 
  defaultOpen = false 
}: { 
  group: string; 
  matches: Match[]; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const completedCount = matches.filter(m => m.isCompleted).length;

  return (
    <Card className="bg-[#141b2d] border-white/10 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-teal-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
          <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">{group}</span>
        </div>
        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <Badge className="bg-emerald-600 text-xs">{completedCount}/{matches.length}</Badge>
          )}
          <span className="text-xs text-slate-500">{matches.length} partidos</span>
        </div>
      </button>
      {isOpen && (
        <CardContent className="pt-0 pb-4 space-y-2">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('scores');
  const mainRef = useRef<HTMLDivElement>(null);

  // Auth form state
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Data state
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [predictionsLocked, setPredictionsLocked] = useState(false);

  // Admin state
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [editingPredictions, setEditingPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [matchResults, setMatchResults] = useState<Record<string, { home: string; away: string }>>({});
  const [savingResult, setSavingResult] = useState<string | null>(null);
  const [savingPredictions, setSavingPredictions] = useState(false);

  // Group matches
  const groupOrder = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F', 'Grupo G', 'Grupo H', 'Grupo I', 'Grupo J', 'Grupo K', 'Grupo L'];

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch {
      // Not logged in
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when user logs in
  useEffect(() => {
    if (user) {
      fetchMatches();
      fetchLeaderboard();
      if (user.isAdmin) {
        fetchAdminUsers();
        fetchSettings();
      } else {
        fetchMyPredictions();
      }
    }
  }, [user]);

  // Scroll to top on tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchMyPredictions = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/predictions?userId=${user.id}`);
      const data = await res.json();
      setPredictions(data.predictions || []);
      const editing: Record<string, { home: number; away: number }> = {};
      for (const p of data.predictions || []) {
        editing[p.matchId] = { home: p.homeScore, away: p.awayScore };
      }
      setEditingPredictions(editing);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setAdminUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setPredictionsLocked(data.settings?.predictionsLocked === 'true');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchUserPredictions = async (userId: string) => {
    try {
      const res = await fetch(`/api/predictions?userId=${userId}`);
      const data = await res.json();
      setUserPredictions(data.predictions || []);
    } catch (error) {
      console.error('Error fetching user predictions:', error);
    }
  };

  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: loginName, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setLoginName('');
        setLoginPassword('');
        toast.success(`¡Bienvenido, ${data.user.name}!`);
      } else {
        toast.error(data.error || 'Error al iniciar sesión');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        toast.success('¡Registro exitoso! Espera la confirmación del administrador.');
      } else {
        toast.error(data.error || 'Error al registrarse');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setPredictions([]);
      setLeaderboard([]);
      setAdminUsers([]);
      toast.success('Sesión cerrada');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  // Prediction handlers
  const handleSavePredictions = async () => {
    setSavingPredictions(true);
    try {
      const preds = Object.entries(editingPredictions).map(([matchId, scores]) => ({
        matchId,
        homeScore: scores.home,
        awayScore: scores.away,
      }));

      const res = await fetch('/api/predictions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictions: preds }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('¡Predicciones guardadas exitosamente!');
        fetchMyPredictions();
        fetchLeaderboard();
      } else {
        toast.error(data.error || 'Error al guardar predicciones');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSavingPredictions(false);
    }
  };

  // Admin handlers
  const handleConfirmUser = async (userId: string, isConfirmed: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isConfirmed }),
      });
      if (res.ok) {
        toast.success(isConfirmed ? 'Usuario confirmado' : 'Usuario desconfirmado');
        fetchAdminUsers();
        fetchLeaderboard();
      }
    } catch {
      toast.error('Error al actualizar usuario');
    }
  };

  const handleToggleLock = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'predictionsLocked', value: (!predictionsLocked).toString() }),
      });
      if (res.ok) {
        setPredictionsLocked(!predictionsLocked);
        toast.success(predictionsLocked ? 'Predicciones desbloqueadas' : 'Predicciones bloqueadas');
      }
    } catch {
      toast.error('Error al actualizar configuración');
    }
  };

  const handleSaveResult = async (matchId: string) => {
    const scores = matchResults[matchId];
    if (!scores || scores.home === '' || scores.away === '') {
      toast.error('Ingresa ambos marcadores');
      return;
    }
    setSavingResult(matchId);
    try {
      const res = await fetch('/api/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          homeScore: parseInt(scores.home),
          awayScore: parseInt(scores.away),
        }),
      });
      if (res.ok) {
        toast.success('Resultado guardado - Puntajes actualizados');
        fetchMatches();
        fetchLeaderboard();
        setMatchResults((prev) => {
          const next = { ...prev };
          delete next[matchId];
          return next;
        });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al guardar resultado');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSavingResult(null);
    }
  };

  const handleReset = async (type: string) => {
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        toast.success('Datos reseteados exitosamente');
        fetchMatches();
        fetchLeaderboard();
        fetchAdminUsers();
        fetchSettings();
      }
    } catch {
      toast.error('Error al resetear datos');
    }
  };

  const handleSelectedUserChange = (userId: string) => {
    setSelectedUserId(userId);
    fetchUserPredictions(userId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-500 mx-auto" />
          <p className="mt-3 text-slate-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Auth page
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1e] via-[#0f172a] to-[#0a0f1e] p-4">
        <Card className="w-full max-w-md bg-[#141b2d]/90 border-white/10 backdrop-blur-sm shadow-2xl shadow-black/50">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img
                src="/jenecheru26.png"
                alt="Jenecherú Logo"
                className="w-28 h-28 rounded-xl object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Mundial 2026 Jenecherú
              </CardTitle>
              <CardDescription className="text-teal-400 mt-1 font-medium">
                ACTIVO FIJO
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#1e293b]">
                <TabsTrigger value="login" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Usuario o Correo</Label>
                    <Input
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="Tu nombre de usuario"
                      className="bg-[#1e293b] border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Contraseña</Label>
                    <Input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Tu contraseña"
                      className="bg-[#1e293b] border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold h-11"
                  >
                    {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CircleDot className="h-4 w-4 mr-2" />}
                    Iniciar Sesión
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nombre de usuario</Label>
                    <Input
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Tu nombre"
                      className="bg-[#1e293b] border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Correo electrónico</Label>
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="bg-[#1e293b] border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Contraseña</Label>
                    <Input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Crea una contraseña"
                      className="bg-[#1e293b] border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold h-11"
                  >
                    {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Registrarse
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not confirmed notice
  if (!user.isConfirmed && !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1e] via-[#0f172a] to-[#0a0f1e] p-4">
        <Card className="w-full max-w-md bg-[#141b2d]/90 border-white/10 backdrop-blur-sm shadow-2xl shadow-black/50">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img
                src="/jenecheru26.png"
                alt="Jenecherú Logo"
                className="w-20 h-20 rounded-xl object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-amber-400 flex items-center justify-center gap-2">
                <Eye className="h-5 w-5" /> Esperando Confirmación
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2">
                Tu cuenta aún no ha sido confirmada por el administrador.
                <br />Por favor, espera a que sea aprobada.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={handleLogout} className="border-white/20 text-white hover:bg-white/10">
              <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group matches by group
  const matchesByGroup = groupOrder.map((group) => ({
    group,
    matches: matches.filter((m) => m.group === group),
  })).filter((g) => g.matches.length > 0);

  // Get user's prediction for a match
  const getPredictionForMatch = (matchId: string) => {
    return predictions.find((p) => p.matchId === matchId);
  };

  // Main app
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f1e] via-[#0f172a] to-[#0a0f1e]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/jenecheru26.png"
              alt="Jenecherú"
              className="w-10 h-10 rounded-lg object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-1">
                <Trophy className="h-5 w-5 text-yellow-400" /> Mundial 2026
              </h1>
              <p className="text-xs text-slate-400">Jenecherú</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm text-white hidden sm:block">{user.name}</span>
            {user.isAdmin && (
              <Badge className="bg-amber-600 hover:bg-amber-500 text-white text-xs">ADMIN</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 bg-[#1e293b] mb-6">
            <TabsTrigger
              value="scores"
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white gap-1 text-xs sm:text-sm"
            >
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Puntajes
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white gap-1 text-xs sm:text-sm"
            >
              <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Predicciones
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white gap-1 text-xs sm:text-sm"
            >
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Resultados
            </TabsTrigger>
          </TabsList>

          {/* PUNTAJES TAB */}
          <TabsContent value="scores">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-400" /> Tabla de Posiciones
                </h2>
                <p className="text-slate-400 mt-1">
                  Clasificación general en tiempo real de los participantes
                </p>
              </div>

              {/* Scoring explanation */}
              <Card className="bg-[#141b2d] border-teal-500/20">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 justify-center text-sm">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-teal-600">3 PTS</Badge>
                      <span className="text-slate-300">Acierto exacto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-600">1 PT</Badge>
                      <span className="text-slate-300">Acierto parcial</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top participant card */}
              {leaderboard.length > 0 && leaderboard[0].totalPoints > 0 && (
                <Card className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/30">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-yellow-500/30">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{leaderboard[0].name}</span>
                        <Medal className="h-5 w-5 text-yellow-400" />
                      </div>
                      <p className="text-slate-400 text-sm">
                        Exactos: {leaderboard[0].exactPredictions} | Parciales: {leaderboard[0].partialPredictions}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-teal-400">{leaderboard[0].totalPoints} pts</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Leaderboard table */}
              <Card className="bg-[#141b2d] border-white/10">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left p-3 text-slate-400 text-sm font-medium">#</th>
                          <th className="text-left p-3 text-slate-400 text-sm font-medium">PARTICIPANTE</th>
                          <th className="text-center p-3 text-slate-400 text-sm font-medium hidden sm:table-cell">EXACTOS (3PTS)</th>
                          <th className="text-center p-3 text-slate-400 text-sm font-medium hidden sm:table-cell">PARCIALES (1PT)</th>
                          <th className="text-right p-3 text-slate-400 text-sm font-medium">PUNTOS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-slate-500">
                              No hay participantes confirmados aún
                            </td>
                          </tr>
                        ) : (
                          leaderboard.map((entry, index) => (
                            <tr
                              key={entry.id}
                              className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                                index < 3 ? 'bg-white/[0.02]' : ''
                              }`}
                            >
                              <td className="p-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    index === 0
                                      ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white'
                                      : index === 1
                                      ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                                      : index === 2
                                      ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                                      : 'bg-slate-700 text-slate-300'
                                  }`}
                                >
                                  {index + 1}
                                </div>
                              </td>
                              <td className="p-3 text-white font-medium">{entry.name}</td>
                              <td className="p-3 text-center text-teal-400 font-medium hidden sm:table-cell">
                                {entry.exactPredictions}
                              </td>
                              <td className="p-3 text-center text-amber-400 font-medium hidden sm:table-cell">
                                {entry.partialPredictions}
                              </td>
                              <td className="p-3 text-right">
                                <span className="text-lg font-bold text-teal-400">{entry.totalPoints}</span>
                                <span className="text-slate-500 text-sm ml-1">pts</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PREDICCIONES TAB */}
          <TabsContent value="predictions">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  <ClipboardList className="h-6 w-6 text-teal-400" /> Panel de Predicciones
                </h2>
                <p className="text-slate-400 mt-1">
                  Pronósticos de los participantes para los {matches.length} partidos del mundial
                </p>
              </div>

              {/* Admin Controls */}
              {user.isAdmin && (
                <>
                  {/* Prediction Lock Control */}
                  <Card className="bg-[#141b2d] border-white/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-5 w-5 text-amber-500" /> Control de Predicciones
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-sm">
                        Bloquea la edición y guardado de pronósticos a todos los usuarios.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${predictionsLocked ? 'text-red-400' : 'text-teal-400'}`}>
                          {predictionsLocked ? '🔒 BLOQUEADO (Cerrado)' : '🔓 DESBLOQUEADO (Abierto)'}
                        </span>
                        <Switch
                          checked={!predictionsLocked}
                          onCheckedChange={handleToggleLock}
                          aria-label="Bloquear/desbloquear predicciones"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Approval */}
                  <Card className="bg-[#141b2d] border-white/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-400" /> Aprobación de Participantes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {adminUsers.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-4">No hay usuarios registrados</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left p-2 text-slate-400 text-xs font-medium">USUARIO</th>
                                <th className="text-left p-2 text-slate-400 text-xs font-medium hidden sm:table-cell">CORREO</th>
                                <th className="text-center p-2 text-slate-400 text-xs font-medium">ESTADO</th>
                                <th className="text-center p-2 text-slate-400 text-xs font-medium">CONFIRMAR</th>
                              </tr>
                            </thead>
                            <tbody>
                              {adminUsers.map((u) => (
                                <tr key={u.id} className="border-b border-white/5">
                                  <td className="p-2 text-white text-sm">{u.name}</td>
                                  <td className="p-2 text-slate-400 text-sm hidden sm:table-cell">{u.email}</td>
                                  <td className="p-2 text-center">
                                    <Badge
                                      className={`text-xs ${
                                        u.isConfirmed
                                          ? 'bg-emerald-600 hover:bg-emerald-500'
                                          : 'bg-slate-600 hover:bg-slate-500'
                                      }`}
                                    >
                                      {u.isConfirmed ? 'CONFIRMADO' : 'PENDIENTE'}
                                    </Badge>
                                  </td>
                                  <td className="p-2 text-center">
                                    <Switch
                                      checked={u.isConfirmed}
                                      onCheckedChange={(checked) => handleConfirmUser(u.id, checked)}
                                      aria-label={`Confirmar usuario ${u.name}`}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* View user predictions */}
                  {adminUsers.filter((u) => u.isConfirmed).length > 0 && (
                    <Card className="bg-[#141b2d] border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Eye className="h-5 w-5 text-teal-400" /> Ver pronósticos de:
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Select
                          value={selectedUserId}
                          onValueChange={handleSelectedUserChange}
                        >
                          <SelectTrigger className="bg-[#1e293b] border-white/10 text-white">
                            <SelectValue placeholder="Seleccionar participante" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1e293b] border-white/10">
                            {adminUsers
                              .filter((u) => u.isConfirmed)
                              .map((u) => (
                                <SelectItem key={u.id} value={u.id} className="text-white focus:bg-teal-600 focus:text-white">
                                  {u.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        {selectedUserId && userPredictions.length > 0 && (
                          <ScrollArea className="max-h-96">
                            <div className="space-y-2">
                              {userPredictions.map((pred) => (
                                <div
                                  key={pred.id}
                                  className="flex items-center justify-between p-3 bg-[#1e293b] rounded-lg"
                                >
                                  <span className="text-sm text-slate-300">
                                    {countryFlags[pred.match?.homeTeam || ''] || ''} {pred.match?.homeTeam} vs {pred.match?.awayTeam} {countryFlags[pred.match?.awayTeam || ''] || ''}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-bold">
                                      {pred.homeScore} - {pred.awayScore}
                                    </span>
                                    {pred.points !== null && pred.points !== undefined && (
                                      <Badge className={`text-xs ${pred.points === 3 ? 'bg-teal-600' : pred.points === 1 ? 'bg-amber-600' : 'bg-red-600'}`}>
                                        +{pred.points}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}

                        {selectedUserId && userPredictions.length === 0 && (
                          <p className="text-slate-500 text-sm text-center py-4">
                            Este participante aún no ha realizado predicciones
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* User Predictions Form (non-admin) */}
              {!user.isAdmin && (
                <div className="space-y-4">
                  {predictionsLocked && (
                    <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                      <Lock className="h-5 w-5 text-red-400" />
                      <p className="text-red-300 text-sm">
                        Las predicciones están bloqueadas por el administrador. No puedes editar tus pronósticos.
                      </p>
                    </div>
                  )}

                  {!predictionsLocked && (
                    <div className="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4 flex items-center gap-3">
                      <CircleDot className="h-5 w-5 text-teal-400" />
                      <p className="text-teal-300 text-sm">
                        Ingresa tus predicciones y presiona &quot;Guardar Mis Predicciones&quot; al final.
                      </p>
                    </div>
                  )}

                  {matchesByGroup.map(({ group, matches: groupMatches }) => (
                    <MatchGroup
                      key={group}
                      group={group}
                      matches={groupMatches}
                      defaultOpen={group === 'Grupo A'}
                    >
                      {groupMatches.map((match) => {
                        const existingPred = getPredictionForMatch(match.id);
                        const editing = editingPredictions[match.id] || {
                          home: existingPred?.homeScore ?? 0,
                          away: existingPred?.awayScore ?? 0,
                        };

                        return (
                          <div
                            key={match.id}
                            className={`flex items-center gap-2 p-3 rounded-lg ${
                              match.isCompleted ? 'bg-emerald-900/20 border border-emerald-500/20' : 'bg-[#1e293b]'
                            }`}
                          >
                            <div className="flex-1 text-right">
                              <span className="text-sm text-white">
                                {countryFlags[match.homeTeam] || ''} {match.homeTeam}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                value={editing.home}
                                onChange={(e) =>
                                  setEditingPredictions((prev) => ({
                                    ...prev,
                                    [match.id]: { ...editing, home: parseInt(e.target.value) || 0 },
                                  }))
                                }
                                disabled={predictionsLocked || match.isCompleted}
                                className="w-12 h-9 text-center bg-[#0f172a] border-white/10 text-white p-0 text-sm disabled:opacity-50"
                              />
                              <span className="text-slate-500 text-xs px-1">vs</span>
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                value={editing.away}
                                onChange={(e) =>
                                  setEditingPredictions((prev) => ({
                                    ...prev,
                                    [match.id]: { ...editing, away: parseInt(e.target.value) || 0 },
                                  }))
                                }
                                disabled={predictionsLocked || match.isCompleted}
                                className="w-12 h-9 text-center bg-[#0f172a] border-white/10 text-white p-0 text-sm disabled:opacity-50"
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="text-sm text-white">
                                {match.awayTeam} {countryFlags[match.awayTeam] || ''}
                              </span>
                            </div>
                            {match.isCompleted && (
                              <Badge className="bg-emerald-600 text-xs shrink-0">OFICIAL {match.homeScore}-{match.awayScore}</Badge>
                            )}
                          </div>
                        );
                      })}
                    </MatchGroup>
                  ))}

                  <Button
                    onClick={handleSavePredictions}
                    disabled={predictionsLocked || savingPredictions}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold py-3 text-lg"
                    size="lg"
                  >
                    {savingPredictions ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                    Guardar Mis Predicciones
                  </Button>
                </div>
              )}

              {/* Admin match overview */}
              {user.isAdmin && (
                <div className="space-y-2">
                  {matchesByGroup.map(({ group, matches: groupMatches }) => (
                    <MatchGroup
                      key={group}
                      group={group}
                      matches={groupMatches}
                      defaultOpen={false}
                    >
                      {groupMatches.map((match) => (
                        <div
                          key={match.id}
                          className={`flex items-center gap-2 p-3 rounded-lg ${
                            match.isCompleted
                              ? 'bg-emerald-900/20 border border-emerald-500/20'
                              : 'bg-[#1e293b]'
                          }`}
                        >
                          <div className="flex-1 text-right">
                            <span className="text-sm text-white">
                              {countryFlags[match.homeTeam] || ''} {match.homeTeam}
                            </span>
                          </div>
                          <span className="text-white font-bold text-sm min-w-[40px] text-center">
                            {match.isCompleted ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
                          </span>
                          <div className="flex-1 text-left">
                            <span className="text-sm text-white">
                              {match.awayTeam} {countryFlags[match.awayTeam] || ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </MatchGroup>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* RESULTADOS OFICIALES TAB */}
          <TabsContent value="results">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  <Globe className="h-6 w-6 text-teal-400" /> Resultados Oficiales
                </h2>
                <p className="text-slate-400 mt-1">
                  {user.isAdmin ? 'Ingresa los resultados oficiales de cada partido' : 'Resultados oficiales de los partidos'}
                </p>
              </div>

              {user.isAdmin ? (
                <div className="space-y-4">
                  {matchesByGroup.map(({ group, matches: groupMatches }) => (
                    <MatchGroup
                      key={group}
                      group={group}
                      matches={groupMatches}
                      defaultOpen={group === 'Grupo A'}
                    >
                      {groupMatches.map((match) => {
                        const result = matchResults[match.id] || {
                          home: match.homeScore?.toString() ?? '',
                          away: match.awayScore?.toString() ?? '',
                        };
                        const hasBothScores = result.home !== '' && result.away !== '';
                        const isSaving = savingResult === match.id;

                        return (
                          <div
                            key={match.id}
                            className={`flex items-center gap-2 p-3 rounded-lg ${
                              match.isCompleted
                                ? 'bg-emerald-900/20 border border-emerald-500/20'
                                : 'bg-[#1e293b]'
                            }`}
                          >
                            <div className="flex-1 text-right">
                              <span className="text-sm text-white">
                                {countryFlags[match.homeTeam] || ''} {match.homeTeam}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                placeholder="-"
                                value={result.home}
                                onChange={(e) =>
                                  setMatchResults((prev) => ({
                                    ...prev,
                                    [match.id]: { ...result, home: e.target.value },
                                  }))
                                }
                                disabled={match.isCompleted}
                                className="w-14 h-9 text-center bg-[#0f172a] border-white/10 text-white p-0 text-sm disabled:opacity-50"
                              />
                              <span className="text-slate-500 text-xs px-1">vs</span>
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                placeholder="-"
                                value={result.away}
                                onChange={(e) =>
                                  setMatchResults((prev) => ({
                                    ...prev,
                                    [match.id]: { ...result, away: e.target.value },
                                  }))
                                }
                                disabled={match.isCompleted}
                                className="w-14 h-9 text-center bg-[#0f172a] border-white/10 text-white p-0 text-sm disabled:opacity-50"
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="text-sm text-white">
                                {match.awayTeam} {countryFlags[match.awayTeam] || ''}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSaveResult(match.id)}
                              disabled={match.isCompleted || !hasBothScores || isSaving}
                              className={`shrink-0 ${
                                match.isCompleted
                                  ? 'bg-emerald-600 hover:bg-emerald-500'
                                  : 'bg-teal-600 hover:bg-teal-500'
                              } text-white text-xs`}
                            >
                              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : match.isCompleted ? '✓' : 'Guardar'}
                            </Button>
                          </div>
                        );
                      })}
                    </MatchGroup>
                  ))}

                  {/* Reset buttons */}
                  <Separator className="bg-white/10" />
                  <div className="flex flex-wrap gap-3 justify-center pb-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2">
                          <RotateCcw className="h-4 w-4" /> Reiniciar Predicciones y Resultados
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#141b2d] border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-400" /> ¿Estás seguro?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-400">
                            Esta acción eliminará todas las predicciones y resultados oficiales. Los usuarios tendrán que volver a hacer sus predicciones.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-700 text-white border-white/10">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleReset('predictions')}
                            className="bg-red-600 hover:bg-red-500 text-white"
                          >
                            Reiniciar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2">
                          <RotateCcw className="h-4 w-4" /> Reiniciar Todo
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#141b2d] border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-400" /> ¿Reiniciar todo?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-400">
                            Esta acción eliminará todos los usuarios, predicciones y resultados. Solo quedará la cuenta de administrador.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-700 text-white border-white/10">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleReset('all')}
                            className="bg-red-600 hover:bg-red-500 text-white"
                          >
                            Reiniciar Todo
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                /* Non-admin view of official results */
                <div className="space-y-2">
                  {matchesByGroup.map(({ group, matches: groupMatches }) => (
                    <MatchGroup
                      key={group}
                      group={group}
                      matches={groupMatches}
                      defaultOpen={group === 'Grupo A'}
                    >
                      {groupMatches.map((match) => {
                        const myPred = getPredictionForMatch(match.id);

                        return (
                          <div
                            key={match.id}
                            className={`flex items-center gap-2 p-3 rounded-lg ${
                              match.isCompleted
                                ? 'bg-emerald-900/20 border border-emerald-500/20'
                                : 'bg-[#1e293b]'
                            }`}
                          >
                            <div className="flex-1 text-right">
                              <span className="text-sm text-white">
                                {countryFlags[match.homeTeam] || ''} {match.homeTeam}
                              </span>
                            </div>
                            <div className="text-center min-w-[80px]">
                              {match.isCompleted ? (
                                <div className="space-y-0.5">
                                  <span className="text-lg font-bold text-emerald-400 block">
                                    {match.homeScore} - {match.awayScore}
                                  </span>
                                  {myPred && myPred.points !== null && myPred.points !== undefined && (
                                    <Badge className={`text-[10px] px-1.5 py-0 ${
                                      myPred.points === 3 ? 'bg-teal-600' : myPred.points === 1 ? 'bg-amber-600' : 'bg-red-600'
                                    }`}>
                                      +{myPred.points} pts
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-500 text-sm">Por jugar</span>
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <span className="text-sm text-white">
                                {match.awayTeam} {countryFlags[match.awayTeam] || ''}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </MatchGroup>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-[#0f172a]/95 border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Mundial 2026 Jenecherú — UAGRM
          </p>
        </div>
      </footer>
    </div>
  );
}
