import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserCheck, Shield, Mail, Zap, CheckCircle2, UserPlus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

const AssignTechnicianModal = ({ 
  isOpen, 
  onClose, 
  technicians, 
  onAssign, 
  ticketTitle,
  isLoadingFetch = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTechnicians = technicians.filter(tech => {
    const fullName = `${tech.firstName || ''} ${tech.lastName || ''}`.toLowerCase();
    const email = (tech.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-[#182c51] p-8 text-white relative">
            <div className="absolute top-0 right-0 p-6">
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-orange-500/20">
              <UserPlus className="w-3.5 h-3.5" />
              Staff Assignment
            </div>
            
            <h2 className="text-2xl font-black leading-tight">
              Assign Technician
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-medium line-clamp-1">
              Selecting staff for: <span className="text-orange-400 italic">"{ticketTitle}"</span>
            </p>
          </div>

          <div className="p-8">
            {/* Search Box */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search staff by name or email..."
                className="pl-11 h-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-orange-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Technician List */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingFetch ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Fetching staff records...</p>
                </div>
              ) : filteredTechnicians.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-bold">No staff members found</p>
                  <p className="text-slate-400 text-xs mt-1">Try a different search term</p>
                </div>
              ) : (
                filteredTechnicians.map((tech) => (
                  <motion.div 
                    key={tech.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAssign(tech.id)}
                    className="flex items-center gap-4 p-4 rounded-3xl border border-slate-50 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-orange-500 group-hover:to-orange-600 transition-all shadow-sm">
                      <Shield className="w-5 h-5 text-slate-500 group-hover:text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-[#182c51] truncate">
                        {tech.firstName} {tech.lastName}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                        <Mail className="w-3 h-3" />
                        {tech.email}
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-orange-500/20 transition-colors">
                      <Zap className="w-4 h-4 text-slate-300 group-hover:text-orange-500" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-6 bg-slate-50 flex items-center justify-center gap-2 border-t border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Assigning will notify staff automatically
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssignTechnicianModal;
