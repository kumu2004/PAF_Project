import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Upload, X, FileText, Image as ImageIcon, Trash2, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';

const AttachmentUploader = ({ attachments, onUpload, onRemove, onRename, isUploading, readOnly }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef(null);
  const user = useAuthStore(s => s.user);
  const isRestricted = user?.role === 'STUDENT' || user?.role === 'LECTURER';

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Filter for PNG/JPG/JPEG only if restricted
    const validFormatFiles = isRestricted
      ? files.filter(f => 
          f.type === 'image/png' || 
          f.type === 'image/jpeg' || 
          f.name.toLowerCase().endsWith('.png') ||
          f.name.toLowerCase().endsWith('.jpg') ||
          f.name.toLowerCase().endsWith('.jpeg')
        )
      : files;

    if (isRestricted && validFormatFiles.length < files.length) {
      toast.error('Only PNG and JPEG/JPG files are allowed for your account type.');
    }

    const validFiles = validFormatFiles.filter(f => f.size <= 5 * 1024 * 1024); // 5MB limit

    if (validFiles.length < validFormatFiles.length) {
      toast.warning('Some files were skipped because they exceed 5MB limit.');
    }

    if ((attachments?.length || 0) + selectedFiles.length + validFiles.length > 5) {
      toast.error('Maximum 5 attachments per ticket allowed.');
      return;
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const removeSelectedFile = (idx) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== idx));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    onUpload(selectedFiles).then(() => setSelectedFiles([]));
  };

  const startEditing = (att) => {
    setEditingId(att.attachmentId);
    setNewName(att.fileName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewName('');
  };

  const saveRename = (attachmentId) => {
    if (!newName.trim()) return;
    onRename(attachmentId, newName).then(() => {
      setEditingId(null);
      setNewName('');
    });
  };

  return (
    <Card className="border-none shadow-xl bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Documents & Assets
        </CardTitle>
        <CardDescription>Manage files related to this ticket ({attachments?.length || 0}/5)</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Existing Attachments */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {attachments?.map((att) => (
              <motion.div
                key={att.attachmentId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-3 rounded-2xl border bg-background hover:border-primary/30 transition-all group"
              >
                <div 
                  className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
                  onClick={() => window.open(att.fileUrl, '_blank')}
                  title="Open in new tab"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-105">
                    {att.contentType?.startsWith('image/') ? (
                      <img 
                        src={att.fileUrl} 
                        alt={att.fileName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-primary/60" />
                    )}
                  </div>
                  
                  {editingId === att.attachmentId ? (
                    <div className="flex items-center gap-2 flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
                      <Input 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-8 py-0 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(att.attachmentId);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => saveRename(att.attachmentId)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={cancelEditing}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                        {att.fileName}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-70">
                        {(att.fileSize / 1024).toFixed(0)} KB • {att.contentType?.split('/')[1]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {editingId !== att.attachmentId && (
                  <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => startEditing(att)}
                      disabled={isUploading}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={() => onRemove(att.attachmentId)}
                      disabled={isUploading}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {(!attachments || attachments.length === 0) && (
            <div className="text-center py-8 border-2 border-dashed rounded-2xl bg-muted/20">
              <p className="text-sm text-muted-foreground">No documents attached yet</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {!readOnly && selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-4 border-t"
            >
              <p className="text-xs font-black uppercase text-primary tracking-widest">Pending Upload ({selectedFiles.length})</p>
              <div className="space-y-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-primary/[0.02]">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-primary opacity-50" />
                      <span className="text-sm truncate font-medium">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeSelectedFile(idx)} className="h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button size="lg" className="w-full mt-4 font-bold shadow-lg shadow-primary/20" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </div>
                ) : `Confirm Upload`}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Trigger */}
        {!readOnly && (attachments?.length || 0) < 5 && (
          <div
            className="group relative border-2 border-dashed border-muted-foreground/20 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/[0.01] transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground/80">Add more documents</p>
              <p className="text-xs text-muted-foreground mt-1">Images, PDFs, Docs (Max 5MB)</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept={isRestricted ? "image/png,image/jpeg" : "*"}
              onChange={handleFileChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttachmentUploader;
