import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Select } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TechnicianAssign = ({ ticketId, currentTechnician, onAssign }) => {
  const [selectedTech, setSelectedTech] = useState(currentTechnician || '');
  const [isAssigning, setIsAssigning] = useState(false);

  // Mock technicians (in a real app, these would be fetched from an API)
  const technicians = [
    { id: 'TECH_001', name: 'John Doe (IT)' },
    { id: 'TECH_002', name: 'Jane Smith (Electrical)' },
    { id: 'TECH_003', name: 'Mike Ross (Plumbing)' },
    { id: 'TECH_004', name: 'Sarah Connor (Security)' },
  ];

  const handleAssign = async () => {
    if (!selectedTech) return;
    setIsAssigning(true);
    try {
      await onAssign(selectedTech);
      toast.success('Technician assigned successfully');
    } catch (error) {
      toast.error('Failed to assign technician');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Assign Technician
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}>
          <option value="">Select a technician</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name}
            </option>
          ))}
        </Select>
        <Button 
          className="w-full" 
          onClick={handleAssign} 
          disabled={isAssigning || !selectedTech || selectedTech === currentTechnician}
        >
          {isAssigning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {currentTechnician ? 'Reassign' : 'Assign'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TechnicianAssign;
