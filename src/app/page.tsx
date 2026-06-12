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
  RotateCcw,
  Save,
  CircleDot,
  Loader2,
  Medal,
  ChevronDown,
  ChevronRight,
  Eye,
  MapPin,
  Clock,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

interface ConfirmedUser {
  id: string;
  name: string;
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
  'Italia': '🇮🇹', 'Polonia': '🇵🇱', 'Serbia': '🇷🇸', 'Ucrania': '🇺🇦', 'Dinamarca': '🇩🇰',
};

// Country codes for display
const countryCodes: Record<string, string> = {
  'México': 'MX', 'Sudáfrica': 'ZA', 'Corea del Sur': 'KR', 'Chequia': 'CZ',
  'Canadá': 'CA', 'Bosnia y Herzegovina': 'BA', 'Qatar': 'QA', 'Suiza': 'CH',
  'Brasil': 'BR', 'Marruecos': 'MA', 'Haití': 'HT', 'Escocia': 'SC',
  'Estados Unidos': 'US', 'Paraguay': 'PY', 'Australia': 'AU', 'Turquía': 'TR',
  'Alemania': 'DE', 'Curazao': 'CW', 'Costa de Marfil': 'CI', 'Ecuador': 'EC',
  'Países Bajos': 'NL', 'Japón': 'JP', 'Suecia': 'SE', 'Túnez': 'TN',
  'Bélgica': 'BE', 'Egipto': 'EG', 'Irán': 'IR', 'Nueva Zelanda': 'NZ',
  'España': 'ES', 'Cabo Verde': 'CV', 'Arabia Saudita': 'SA', 'Uruguay': 'UY',
  'Francia': 'FR', 'Senegal': 'SN', 'Irak': 'IQ', 'Noruega': 'NO',
  'Argentina': 'AR', 'Argelia': 'DZ', 'Austria': 'AT', 'Jordania': 'JO',
  'Portugal': 'PT', 'RD Congo': 'CD', 'Uzbekistán': 'UZ', 'Colombia': 'CO',
  'Inglaterra': 'EN', 'Croacia': 'HR', 'Ghana': 'GH', 'Panamá': 'PA',
  'Italia': 'IT', 'Polonia': 'PL', 'Serbia': 'RS', 'Ucrania': 'UA', 'Dinamarca': 'DK',
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('predictions');
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
  const [confirmedUsers, setConfirmedUsers] = useState<ConfirmedUser[]>([]);
  const [predictionsLocked, setPredictionsLocked] = useState(false);

  // Prediction viewing state
  const [viewingUserId, setViewingUserId] = useState<string>('');
  const [viewedPredictions, setViewedPredictions] = useState<Prediction[]>([]);
  const [viewedUserName, setViewedUserName] = useState<string>('');

  // Editing predictions state
  const [editingPredictions, setEditingPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [matchResults, setMatchResults] = useState<Record<string, { home: string; away: string }>>({});
  const [savingResult, setSavingResult] = useState<string | null>(null);
  const [savingPredictions, setSavingPredictions] = useState(false);

  // Group matches
  const groupOrder = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F', 'Grupo G', 'Grupo H', 'Grupo I', 'Grupo J', 'Grupo K', 'Grupo L'];

  // Authenticated fetch helper - sends token via Authorization header as fallback
  const authFetch = async (url: string, options?: RequestInit) => {
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string> || {}),
    };
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    return fetch(url, { ...options, headers });
  };

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Try to restore token from localStorage
      const storedToken = localStorage.getItem('session_token');
      if (storedToken) {
        setSessionToken(storedToken);
      }
      const headers: Record<string, string> = {};
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
      const res = await fetch('/api/auth/me', { headers });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        if (data.token) {
          setSessionToken(data.token);
          localStorage.setItem('session_token', data.token);
        }
      } else if (storedToken) {
        // Token invalid, clear it
        localStorage.removeItem('session_token');
        setSessionToken('');
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
        fetchConfirmedUsers();
      } else {
        fetchMyPredictions();
        fetchConfirmedUsers();
      }
    }
  }, [user, sessionToken]);

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
      const res = await authFetch(`/api/predictions?userId=${user.id}`);
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
      const res = await authFetch('/api/admin/users');
      if (!res.ok) {
        console.error('Admin users fetch failed:', res.status);
        return;
      }
      const data = await res.json();
      setAdminUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  const fetchConfirmedUsers = async () => {
    try {
      const res = await authFetch('/api/users/confirmed');
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      setConfirmedUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching confirmed users:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await authFetch('/api/admin/settings');
      const data = await res.json();
      setPredictionsLocked(data.settings?.predictionsLocked === 'true');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchUserPredictions = async (userId: string) => {
    try {
      const res = await authFetch(`/api/predictions?userId=${userId}`);
      const data = await res.json();
      setViewedPredictions(data.predictions || []);
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
        if (data.token) {
          setSessionToken(data.token);
          localStorage.setItem('session_token', data.token);
        }
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
        if (data.token) {
          setSessionToken(data.token);
          localStorage.setItem('session_token', data.token);
        }
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
      await authFetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setSessionToken('');
      localStorage.removeItem('session_token');
      setPredictions([]);
      setLeaderboard([]);
      setAdminUsers([]);
      setViewingUserId('');
      setViewedPredictions([]);
      toast.success('Sesión cerrada');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  // Prediction handlers
  const handleSavePredictions = async () => {
    setSavingPredictions(true);
    try {
      const preds = Object.entries(editingPredictions)
        .filter(([, scores]) => scores.home !== undefined && scores.away !== undefined)
        .map(([matchId, scores]) => ({
          matchId,
          homeScore: scores.home ?? 0,
          awayScore: scores.away ?? 0,
        }));

      const res = await authFetch('/api/predictions', {
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
      const res = await authFetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isConfirmed }),
      });
      if (res.ok) {
        toast.success(isConfirmed ? 'Usuario confirmado' : 'Usuario desconfirmado');
        fetchAdminUsers();
        fetchLeaderboard();
        fetchConfirmedUsers();
      }
    } catch {
      toast.error('Error al actualizar usuario');
    }
  };

  const handleToggleLock = async () => {
    try {
      const res = await authFetch('/api/admin/settings', {
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
      const res = await authFetch('/api/matches', {
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
      const res = await authFetch('/api/admin/reset', {
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
        fetchConfirmedUsers();
      }
    } catch {
      toast.error('Error al resetear datos');
    }
  };

  const handleViewingUserChange = (userId: string) => {
    if (userId === user?.id) {
      // Viewing own predictions - switch to edit mode
      setViewingUserId('');
      setViewedPredictions([]);
      setViewedUserName('');
      return;
    }
    setViewingUserId(userId);
    const found = confirmedUsers.find(u => u.id === userId);
    setViewedUserName(found?.name || '');
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

  // Determine if user is viewing own predictions or another's
  const isViewingOwn = !viewingUserId || viewingUserId === user.id;

  // Get prediction for a match from viewed predictions
  const getViewedPrediction = (matchId: string) => {
    if (isViewingOwn) {
      return predictions.find((p) => p.matchId === matchId);
    }
    return viewedPredictions.find((p) => p.matchId === matchId);
  };

  // Get editing value for a match
  const getEditingValue = (matchId: string) => {
    return editingPredictions[matchId] || { home: 0, away: 0 };
  };

  // Match Card Component for predictions
  const MatchCard = ({ match }: { match: Match }) => {
    const pred = getViewedPrediction(match.id);
    const editing = getEditingValue(match.id);
    const canEdit = isViewingOwn && !predictionsLocked && !match.isCompleted && !user?.isAdmin;
    const homeFlag = countryFlags[match.homeTeam] || '';
    const awayFlag = countryFlags[match.awayTeam] || '';
    const homeCode = countryCodes[match.homeTeam] || '';
    const awayCode = countryCodes[match.awayTeam] || '';

    return (
      <div className="bg-[#1a2332] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors">
        {/* Card Header - Group & Venue Info */}
        <div className="px-3 py-2 bg-[#141b2d]/60 border-b border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
              {match.group}
            </span>
            {match.isCompleted && (
              <Badge className="bg-emerald-600 text-[9px] px-1.5 py-0">FINALIZADO</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {match.venue && (
              <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" /> {match.venue}
              </span>
            )}
          </div>
          {match.date && (
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <Calendar className="h-2.5 w-2.5" /> {match.date}
            </span>
          )}
        </div>

        {/* Teams & Score */}
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            {/* Home Team */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-lg">{homeFlag}</span>
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold truncate">{match.homeTeam}</div>
                <div className="text-slate-500 text-[10px] font-mono">{homeCode}</div>
              </div>
            </div>

            {/* Score Section */}
            <div className="flex items-center gap-1.5 shrink-0">
              {canEdit ? (
                <>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={editing.home}
                    onChange={(e) =>
                      setEditingPredictions((prev) => {
                        const existing = prev[match.id] || { home: 0, away: 0 };
                        return {
                          ...prev,
                          [match.id]: { ...existing, home: parseInt(e.target.value) || 0 },
                        };
                      })
                    }
                    className="w-10 h-9 text-center bg-[#0f172a] border-white/10 text-white text-sm font-bold p-0 focus:border-teal-500"
                  />
                  <span className="text-slate-500 text-xs">-</span>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={editing.away}
                    onChange={(e) =>
                      setEditingPredictions((prev) => {
                        const existing = prev[match.id] || { home: 0, away: 0 };
                        return {
                          ...prev,
                          [match.id]: { ...existing, away: parseInt(e.target.value) || 0 },
                        };
                      })
                    }
                    className="w-10 h-9 text-center bg-[#0f172a] border-white/10 text-white text-sm font-bold p-0 focus:border-teal-500"
                  />
                </>
              ) : match.isCompleted ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-8 h-8 flex items-center justify-center bg-[#0f172a] rounded text-white text-sm font-bold">
                    {match.homeScore}
                  </span>
                  <span className="text-slate-500 text-xs">-</span>
                  <span className="w-8 h-8 flex items-center justify-center bg-[#0f172a] rounded text-white text-sm font-bold">
                    {match.awayScore}
                  </span>
                </div>
              ) : pred ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-8 h-8 flex items-center justify-center bg-[#0f172a] rounded text-white text-sm font-bold">
                    {pred.homeScore}
                  </span>
                  <span className="text-slate-500 text-xs">-</span>
                  <span className="w-8 h-8 flex items-center justify-center bg-[#0f172a] rounded text-white text-sm font-bold">
                    {pred.awayScore}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-8 h-8 flex items-center justify-center bg-[#0f172a] rounded text-slate-600 text-sm">-</span>
                  <span className="text-slate-500 text-xs">-</span>
                  <span className="w-8 h-8 flex items-center justify-center bg-[#0f172a] rounded text-slate-600 text-sm">-</span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 flex items-center gap-2 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <div className="text-white text-sm font-semibold truncate">{match.awayTeam}</div>
                <div className="text-slate-500 text-[10px] font-mono">{awayCode}</div>
              </div>
              <span className="text-lg">{awayFlag}</span>
            </div>
          </div>

          {/* Points badge */}
          {pred && pred.points !== null && pred.points !== undefined && (
            <div className="mt-1.5 text-center">
              <Badge className={`text-[10px] ${pred.points === 3 ? 'bg-teal-600' : pred.points === 1 ? 'bg-amber-600' : 'bg-red-600/70'}`}>
                +{pred.points} {pred.points === 3 ? 'pts exacto' : pred.points === 1 ? 'pt parcial' : 'pts'}
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Result Match Card for admin
  const ResultMatchCard = ({ match }: { match: Match }) => {
    const homeFlag = countryFlags[match.homeTeam] || '';
    const awayFlag = countryFlags[match.awayTeam] || '';
    const homeCode = countryCodes[match.homeTeam] || '';
    const awayCode = countryCodes[match.awayTeam] || '';
    const currentResult = matchResults[match.id] || {
      home: match.homeScore?.toString() || '',
      away: match.awayScore?.toString() || '',
    };

    return (
      <div className="bg-[#1a2332] rounded-xl border border-white/5 overflow-hidden">
        {/* Card Header */}
        <div className="px-3 py-2 bg-[#141b2d]/60 border-b border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
              {match.group}
            </span>
            {match.isCompleted && (
              <Badge className="bg-emerald-600 text-[9px] px-1.5 py-0">FINALIZADO</Badge>
            )}
          </div>
          {match.venue && (
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
              <MapPin className="h-2.5 w-2.5" /> {match.venue}
            </span>
          )}
          {match.date && (
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <Calendar className="h-2.5 w-2.5" /> {match.date}
            </span>
          )}
        </div>

        {/* Teams & Score Input */}
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            {/* Home Team */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-lg">{homeFlag}</span>
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold truncate">{match.homeTeam}</div>
                <div className="text-slate-500 text-[10px] font-mono">{homeCode}</div>
              </div>
            </div>

            {/* Score Input */}
            {user.isAdmin && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="-"
                  value={currentResult.home}
                  onChange={(e) =>
                    setMatchResults((prev) => ({
                      ...prev,
                      [match.id]: { ...prev[match.id], home: e.target.value },
                    }))
                  }
                  className="w-11 h-9 text-center bg-[#0f172a] border-white/10 text-white text-sm font-bold p-0 focus:border-teal-500"
                />
                <span className="text-slate-500 text-xs">-</span>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="-"
                  value={currentResult.away}
                  onChange={(e) =>
                    setMatchResults((prev) => ({
                      ...prev,
                      [match.id]: { ...prev[match.id], away: e.target.value },
                    }))
                  }
                  className="w-11 h-9 text-center bg-[#0f172a] border-white/10 text-white text-sm font-bold p-0 focus:border-teal-500"
                />
              </div>
            )}

            {/* Away Team */}
            <div className="flex-1 flex items-center gap-2 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <div className="text-white text-sm font-semibold truncate">{match.awayTeam}</div>
                <div className="text-slate-500 text-[10px] font-mono">{awayCode}</div>
              </div>
              <span className="text-lg">{awayFlag}</span>
            </div>
          </div>

          {/* Save result button (admin only) */}
          {user.isAdmin && !match.isCompleted && (
            <div className="mt-2">
              <Button
                size="sm"
                onClick={() => handleSaveResult(match.id)}
                disabled={savingResult === match.id}
                className="w-full h-7 bg-teal-600 hover:bg-teal-500 text-white text-xs"
              >
                {savingResult === match.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}
                Guardar
              </Button>
            </div>
          )}

          {/* Completed result display */}
          {match.isCompleted && (
            <div className="mt-1.5 text-center">
              <span className="text-emerald-400 text-xs font-medium">
                Resultado: {match.homeScore} - {match.awayScore}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // User Results View Card (non-admin)
  const UserResultCard = ({ match }: { match: Match }) => {
    const pred = predictions.find((p) => p.matchId === match.id);
    const homeFlag = countryFlags[match.homeTeam] || '';
    const awayFlag = countryFlags[match.awayTeam] || '';
    const homeCode = countryCodes[match.homeTeam] || '';
    const awayCode = countryCodes[match.awayTeam] || '';

    return (
      <div className="bg-[#1a2332] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-3 py-2 bg-[#141b2d]/60 border-b border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
              {match.group}
            </span>
            {match.isCompleted && (
              <Badge className="bg-emerald-600 text-[9px] px-1.5 py-0">FINALIZADO</Badge>
            )}
          </div>
          {match.venue && (
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
              <MapPin className="h-2.5 w-2.5" /> {match.venue}
            </span>
          )}
          {match.date && (
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <Calendar className="h-2.5 w-2.5" /> {match.date}
            </span>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-lg">{homeFlag}</span>
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold truncate">{match.homeTeam}</div>
                <div className="text-slate-500 text-[10px] font-mono">{homeCode}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {match.isCompleted ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-8 h-8 flex items-center justify-center bg-[#0f172a] rounded text-white text-sm font-bold">
                    {match.homeScore}
                  </span>
                  <span className="text-slate-500 text-xs">-</span>
                  <span className="w-8 h-8 flex items-center justify-center bg-[#0f172a] rounded text-white text-sm font-bold">
                    {match.awayScore}
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 text-xs">Pendiente</span>
              )}

              {pred && (
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-slate-500">Mi pronóstico</span>
                  <span className="text-white text-xs font-bold">
                    {pred.homeScore}-{pred.awayScore}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 flex items-center gap-2 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <div className="text-white text-sm font-semibold truncate">{match.awayTeam}</div>
                <div className="text-slate-500 text-[10px] font-mono">{awayCode}</div>
              </div>
              <span className="text-lg">{awayFlag}</span>
            </div>
          </div>

          {pred && pred.points !== null && pred.points !== undefined && (
            <div className="mt-1.5 text-center">
              <Badge className={`text-[10px] ${pred.points === 3 ? 'bg-teal-600' : pred.points === 1 ? 'bg-amber-600' : 'bg-red-600/70'}`}>
                +{pred.points} pts
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Collapsible Group Component
  function MatchGroupSection({
    group,
    groupMatches,
    children,
    defaultOpen = false,
  }: {
    group: string;
    groupMatches: Match[];
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const completedCount = groupMatches.filter(m => m.isCompleted).length;

    return (
      <div className="space-y-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-2 px-1 hover:bg-white/5 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-teal-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
            <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">{group}</span>
          </div>
          <div className="flex items-center gap-2">
            {completedCount > 0 && (
              <Badge className="bg-emerald-600 text-xs">{completedCount}/{groupMatches.length}</Badge>
            )}
            <span className="text-xs text-slate-500">{groupMatches.length} partidos</span>
          </div>
        </button>
        {isOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {children}
          </div>
        )}
      </div>
    );
  }

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
        <Tabs value={activeTab} onValueChange={(tab) => {
          setActiveTab(tab);
          // Refetch admin data when switching to predictions tab
          if (tab === 'predictions' && user?.isAdmin) {
            fetchAdminUsers();
            fetchSettings();
            fetchConfirmedUsers();
          }
          // Refetch leaderboard when switching to scores tab
          if (tab === 'scores') {
            fetchLeaderboard();
          }
        }} className="w-full">
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
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-5 w-5 text-purple-400" /> Aprobación de Participantes
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { fetchAdminUsers(); fetchConfirmedUsers(); }}
                          className="h-7 text-xs text-slate-400 hover:text-white"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" /> Actualizar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {adminUsers.length === 0 ? (
                        <div className="text-center py-4 space-y-2">
                          <p className="text-slate-500 text-sm">No hay usuarios registrados aún</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchAdminUsers()}
                            className="h-7 text-xs border-white/20 text-slate-300 hover:text-white"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" /> Reintentar
                          </Button>
                        </div>
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
                              {[...adminUsers].sort((a, b) => {
                                // Show pending users first
                                if (a.isConfirmed !== b.isConfirmed) return a.isConfirmed ? 1 : -1;
                                return 0;
                              }).map((u) => (
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
                </>
              )}

              {/* View Predictions Dropdown - Available for ALL users */}
              <Card className="bg-[#141b2d] border-white/10">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <Eye className="h-5 w-5 text-teal-400" />
                      <span className="text-sm font-medium text-white">Ver pronóstico de:</span>
                    </div>
                    <div className="flex-1 w-full sm:w-auto flex gap-2">
                      <Select
                        value={viewingUserId}
                        onValueChange={handleViewingUserChange}
                      >
                        <SelectTrigger className="bg-[#1e293b] border-white/10 text-white flex-1">
                          <SelectValue placeholder={user.name + ' (Yo)'} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e293b] border-white/10">
                          <SelectItem value={user.id} className="text-white focus:bg-teal-600 focus:text-white">
                            {user.name} (Yo)
                          </SelectItem>
                          {confirmedUsers
                            .filter((u) => u.id !== user.id)
                            .map((u) => (
                              <SelectItem key={u.id} value={u.id} className="text-white focus:bg-teal-600 focus:text-white">
                                {u.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {viewingUserId && viewingUserId !== user.id && (
                    <p className="text-xs text-amber-400 mt-2">
                      Estás viendo las predicciones de <strong>{viewedUserName}</strong> (solo lectura)
                    </p>
                  )}
                  {predictionsLocked && isViewingOwn && !user.isAdmin && (
                    <p className="text-xs text-red-400 mt-2">
                      🔒 Las predicciones están bloqueadas por el administrador
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Save Predictions Button (only when viewing own and not locked) */}
              {isViewingOwn && !predictionsLocked && !user.isAdmin && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleSavePredictions}
                    disabled={savingPredictions}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold px-8 h-11"
                  >
                    {savingPredictions ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar Mis Predicciones
                  </Button>
                </div>
              )}

              {/* Match Groups */}
              <div className="space-y-4">
                {matchesByGroup.map(({ group, matches: groupMatches }) => (
                  <MatchGroupSection
                    key={group}
                    group={group}
                    groupMatches={groupMatches}
                    defaultOpen={groupMatches[0]?.group === 'Grupo A'}
                  >
                    {groupMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </MatchGroupSection>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* RESULTADOS TAB */}
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

              {/* Admin Reset Controls */}
              {user.isAdmin && (
                <Card className="bg-[#141b2d] border-red-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-red-400">
                      <RotateCcw className="h-5 w-5" /> Reiniciar Datos
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-sm">
                      Elimina datos del sistema. Esta acción no se puede deshacer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Predicciones
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#141b2d] border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">¿Reiniciar predicciones?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Se eliminarán todas las predicciones de todos los participantes y los puntajes recalculados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-[#1e293b] text-white border-white/10">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleReset('predictions')} className="bg-red-600 hover:bg-red-500">
                              Reiniciar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Resultados
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#141b2d] border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">¿Reiniciar resultados?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Se eliminarán todos los resultados oficiales y se recalcularán los puntajes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-[#1e293b] text-white border-white/10">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleReset('matches')} className="bg-red-600 hover:bg-red-500">
                              Reiniciar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Usuarios
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#141b2d] border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">¿Reiniciar usuarios?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Se eliminarán todos los usuarios y sus predicciones. El administrador no se eliminará.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-[#1e293b] text-white border-white/10">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleReset('users')} className="bg-red-600 hover:bg-red-500">
                              Reiniciar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Todo
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#141b2d] border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">¿Reiniciar todo?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Se eliminarán TODOS los datos: predicciones, resultados, usuarios y configuraciones.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-[#1e293b] text-white border-white/10">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleReset('all')} className="bg-red-600 hover:bg-red-500">
                              Reiniciar Todo
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Match Groups - Results */}
              <div className="space-y-4">
                {matchesByGroup.map(({ group, matches: groupMatches }) => (
                  <MatchGroupSection
                    key={group}
                    group={group}
                    groupMatches={groupMatches}
                    defaultOpen={groupMatches[0]?.group === 'Grupo A'}
                  >
                    {user.isAdmin
                      ? groupMatches.map((match) => (
                          <ResultMatchCard key={match.id} match={match} />
                        ))
                      : groupMatches.map((match) => (
                          <UserResultCard key={match.id} match={match} />
                        ))
                    }
                  </MatchGroupSection>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-[#0f172a]/80 border-t border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-xs">
            Mundial 2026 Jenecherú — UAGRM
          </p>
        </div>
      </footer>
    </div>
  );
}
