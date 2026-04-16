import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Building2, BookOpen, 
  GraduationCap, Wrench, ShieldCheck, MapPin, 
  CalendarDays, Settings
} from 'lucide-react';

import apiClient from '../services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function ProfilePage() {
  const { data: profileResponse, isLoading, isError } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await apiClient.get('/api/users/me');
      return res.data?.data; // Unpack ApiResponse
    },
  });

  const profile = profileResponse || null;

  if (isLoading) {
    return <div className="py-20 text-center font-medium text-slate-500">Loading your profile...</div>;
  }

  if (isError || !profile) {
    return <div className="py-20 text-center font-bold text-red-500">Failed to load profile data.</div>;
  }

  const role = profile.role || 'USER';
  const roleName = String(role).replace('PENDING_', '');
  const isStudent = role === 'STUDENT';
  const isLecturer = role === 'LECTURER' || role === 'PENDING_LECTURER';
  const isTechnician = role === 'TECHNICIAN' || role === 'PENDING_TECHNICIAN';
  const isAdmin = role === 'ADMIN';

  const formatJoinDate = (iso) => {
    if (!iso) return 'Unknown';
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getInitials = () => {
    return ((profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')).toUpperCase() || 'U';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1e3d 0%, #182c51 60%, #1a3460 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-7 sm:p-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="relative shrink-0">
            {profile.profilePictureUrl ? (
              <img 
                src={profile.profilePictureUrl} 
                alt="Profile" 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] object-cover border-4 border-white/10 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-indigo-500/20 border-4 border-indigo-400/20 shadow-xl flex items-center justify-center">
                <span className="text-3xl sm:text-5xl font-black text-indigo-400">{getInitials()}</span>
              </div>
            )}
            <div className="absolute -bottom-3 -right-3 bg-[#182c51] text-white p-2 rounded-xl shadow-lg border border-white/10">
              {isAdmin ? <ShieldCheck className="w-5 h-5 text-amber-400" /> : <User className="w-5 h-5 text-blue-400" />}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-[0.22em] mb-4">
              {roleName} Profile
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
              {profile.title ? `${profile.title} ` : ''}{profile.firstName} {profile.lastName}
            </h1>
            <p className="text-white/60 font-medium">
              Member since {formatJoinDate(profile.createdAt)}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Basic Info */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 space-y-6">
          <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-50 p-6">
              <CardTitle className="text-lg font-black text-[#182c51] flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Email Address</p>
                <p className="font-semibold text-slate-700">{profile.email}</p>
              </div>
              {profile.phoneNumber && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Phone Number</p>
                  <p className="font-semibold text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {profile.phoneNumber}
                  </p>
                </div>
              )}
              {profile.city && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">City / Location</p>
                  <p className="font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {profile.city}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Role-Specific Details */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2 space-y-6">
          
          {isStudent && (
            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-50 p-6">
                <CardTitle className="text-lg font-black text-[#182c51] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                  Academic Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Student ID</p>
                  <p className="font-semibold text-slate-700">{profile.studentId || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Faculty</p>
                  <p className="font-semibold text-slate-700">{profile.faculty || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Academic Year</p>
                  <Badge variant="outline" className="font-bold text-emerald-600 bg-emerald-50 border-emerald-200">
                    Year {profile.academicYear || '?'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Semester</p>
                  <p className="font-semibold text-slate-700">Semester {profile.semester || '?'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {(isLecturer || isTechnician) && (
            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-50 p-6">
                <CardTitle className="text-lg font-black text-[#182c51] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  Professional Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Faculty / Department</p>
                  <p className="font-semibold text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    {profile.faculty || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Designation</p>
                  <div className="flex items-center gap-2">
                    {isTechnician ? <Wrench className="w-4 h-4 text-slate-400" /> : <GraduationCap className="w-4 h-4 text-slate-400" />}
                    <p className="font-semibold text-slate-700">
                      {isLecturer ? profile.lecturerPosition : profile.technicianPosition || 'Staff'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-50 p-6">
                <CardTitle className="text-lg font-black text-[#182c51] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  Administrative Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
                  <div className="bg-amber-100/50 p-3 rounded-xl shrink-0">
                    <ShieldCheck className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-800 text-sm mb-1">System Administrator</h3>
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                      You have full access to platform settings, user management, and resource allocation boards.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </motion.div>
      </div>
    </div>
  );
}
