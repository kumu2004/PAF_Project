import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ResourceForm } from '../components/ResourceForm';
import { useResources, useCreateResource, useUpdateResource } from '../hooks/useResources';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminResourceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);

  const { data: resource, isLoading } = useResources(isEditing ? { id } : {});
  const { mutate: createResource } = useCreateResource();
  const { mutate: updateResource } = useUpdateResource();

  const handleSubmit = (formData) => {
    setIsSaving(true);
    const mutation = isEditing ? updateResource : createResource;
    const payload  = isEditing ? { id, data: formData } : formData;
    mutation(payload, {
      onSuccess: () => {
        toast.success(isEditing ? 'Resource updated' : 'Resource created');
        navigate('/admin/resources');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error.message || 'Failed to save');
        setIsSaving(false);
      },
    });
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            {isEditing ? 'Edit Resource' : 'Create New Resource'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEditing ? 'Update the resource details below.' : 'Fill in the details to add a new campus resource.'}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl"
          onClick={() => navigate('/admin/resources')}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      {/* Form — full width, no card wrapper */}
      <ResourceForm
        initialData={resource}
        onSubmit={handleSubmit}
        isPending={isSaving || isLoading}
      />
    </div>
  );
}
