import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicketActions } from '../hooks/useTicketActions';
import { useAuthStore } from '../../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import { cn } from '../../../lib/utils';
import { ArrowLeft, AlertCircle, Sparkles, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { createTicket, isLoading } = useTicketActions();
  const user = useAuthStore(s => s.user);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    resourceId: '',
    preferredContact: 'EMAIL'
  });

  const validateField = (name, value) => {
    let error = '';
    if (name === 'title') {
      if (!value) error = 'Title is required';
      else if (value.length < 5) error = 'Title must be at least 5 characters';
      else if (value.length > 100) error = 'Title must be less than 100 characters';
    }
    if (name === 'description') {
      if (!value) error = 'Description is required';
      else if (value.length < 10) error = 'Description must be at least 10 characters';
    }
    if (name === 'category' && !value) {
      error = 'Please select a category';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const validateForm = () => {
    const titleValid = validateField('title', formData.title);
    const descValid = validateField('description', formData.description);
    const catValid = validateField('category', formData.category);
    return titleValid && descValid && catValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      const response = await createTicket({ data: formData, files });
      if (response?.data?.id) {
        navigate(`/tickets/${response.data.id}`);
      } else {
        navigate('/tickets');
      }
    } catch (error) {
      // Error handled by hook toast
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const isRestricted = user?.role === 'STUDENT' || user?.role === 'LECTURER';

    // Filter for PNG/JPG/JPEG only if restricted
    const validSelectedFiles = isRestricted
      ? selectedFiles.filter(f => 
          f.type === 'image/png' || 
          f.type === 'image/jpeg' || 
          f.name.toLowerCase().endsWith('.png') ||
          f.name.toLowerCase().endsWith('.jpg') ||
          f.name.toLowerCase().endsWith('.jpeg')
        )
      : selectedFiles;

    if (isRestricted && validSelectedFiles.length < selectedFiles.length) {
      toast.error('Only PNG and JPEG/JPG files are allowed for your account type.');
    }

    if (files.length + validSelectedFiles.length > 3) {
      toast.error('Maximum 3 files allowed');
      return;
    }
    setFiles(prev => [...prev, ...validSelectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing again
    if (errors[name]) {
      validateField(name, value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-12 max-w-2xl"
    >
      <Button variant="ghost" className="mb-8 group" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to List
      </Button>

      <Card className="border-none shadow-2xl shadow-primary/5">
        <CardHeader className="space-y-4 pb-8 border-b bg-muted/5">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight">Report an Incident</CardTitle>
            <CardDescription className="text-base">
              Submit a maintenance request. Our campus technicians will be notified immediately.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                Issue Title
                <span className="text-destructive">*</span>
              </label>
              <Input
                name="title"
                placeholder="e.g., HVAC system leaking in Block B"
                className={cn(
                  "h-12 text-base border-muted focus-visible:ring-primary/20",
                  errors.title && "border-destructive focus-visible:ring-destructive/20"
                )}
                value={formData.title}
                onChange={handleChange}
                onBlur={() => validateField('title', formData.title)}
              />
              {errors.title && (
                <p className="text-xs font-bold text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  Category
                  <span className="text-destructive">*</span>
                </label>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={() => validateField('category', formData.category)}
                  className={cn(
                    "h-12",
                    errors.category && "border-destructive"
                  )}
                >
                  <option value="">Select Category</option>
                  <option value="IT">IT Support</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="FURNITURE">Furniture</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="CLEANING">Cleaning</option>
                </Select>
                {errors.category && (
                  <p className="text-xs font-bold text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.category}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Priority</label>
                <Select name="priority" value={formData.priority} onChange={handleChange} className="h-12">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium (Default)</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Resource ID / Location</label>
              <Input
                name="resourceId"
                placeholder="Equipment ID or Room Number (Optional)"
                className="h-12 border-muted"
                value={formData.resourceId}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                Detailed Description
                <span className="text-destructive">*</span>
              </label>
              <Textarea
                name="description"
                placeholder="Please provide as much detail as possible to help our technicians..."
                className={cn(
                  "min-h-[150px] text-base border-muted focus-visible:ring-primary/20",
                  errors.description && "border-destructive focus-visible:ring-destructive/20"
                )}
                value={formData.description}
                onChange={handleChange}
                onBlur={() => validateField('description', formData.description)}
              />
              {errors.description && (
                <p className="text-xs font-bold text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Attachments (Max 3)</label>
              <div className="flex flex-col gap-4">
                <Input
                  type="file"
                  multiple
                  accept={(user?.role === 'STUDENT' || user?.role === 'LECTURER') ? "image/png,image/jpeg" : "*"}
                  onChange={handleFileChange}
                  disabled={files.length >= 3}
                  className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl border text-xs font-medium group">
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20" disabled={isLoading}>
              {isLoading ? (
                'Submitting Request...'
              ) : (
                <span className="flex items-center gap-2">
                  Report Incident <Send className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreateTicketPage;
