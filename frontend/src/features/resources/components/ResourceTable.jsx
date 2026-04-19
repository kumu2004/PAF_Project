import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ResourceStatusEnum } from '../types/resource.types';
import { useAuthStore } from '@/store/authStore';

export function ResourceTable({ resources, isLoading, error, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isLecturer = user?.role === 'LECTURER';
  const isTechnician = user?.role === 'TECHNICIAN';

  const getDetailPath = (resourceId) => {
    if (isAdmin) return `/admin/resources/${resourceId}`;
    if (isLecturer) return `/lecturer/resources/${resourceId}`;
    if (isTechnician) return `/technician/resources/${resourceId}`;
    return `/student/resources/${resourceId}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error loading resources: {error.message}</p>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="p-12 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No resources found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case ResourceStatusEnum.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ResourceStatusEnum.OUT_OF_SERVICE:
        return 'bg-red-100 text-red-800';
      case ResourceStatusEnum.UNDER_MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Capacity</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.id || resource._id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{resource.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{resource.type}</Badge>
              </TableCell>
              <TableCell>{resource.location}</TableCell>
              <TableCell className="text-center">{resource.capacity}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(resource.status)}>
                  {resource.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(getDetailPath(resource.id || resource._id))}
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/resources/${resource.id}/edit`)}
                        title="Edit resource"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(resource.id || resource._id)}
                        title="Delete resource"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
