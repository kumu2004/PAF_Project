import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../services/resourceService';

export const RESOURCE_QUERY_KEY = ['resources'];

export const useResources = (filters = {}) => {
  const hasId = Boolean(filters?.id);
  const isEnabled = filters?.enabled ?? true;

  return useQuery({
    queryKey: hasId
      ? [...RESOURCE_QUERY_KEY, 'detail', filters.id]
      : [...RESOURCE_QUERY_KEY, 'list', JSON.stringify(filters)],
    queryFn: () => {
      if (hasId) {
        return resourceService.getResourceById(filters.id);
      }
      return resourceService.getAllResources(filters);
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
};

export const useResourceTypes = () => {
  return useQuery({
    queryKey: ['resourceTypes'],
    queryFn: () => resourceService.getResourceTypes(),
  });
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => resourceService.createResource(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => resourceService.updateResource(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: [...RESOURCE_QUERY_KEY, 'detail', variables.id],
        });
      }
    },
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => resourceService.deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
  });
};

export const useUpdateResourceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => resourceService.updateResourceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEY });
    },
  });
};

export const useUploadResourceFile = () => {
  return useMutation({
    mutationFn: ({ file, type = 'resources' }) =>
      resourceService.uploadResourceFile(file, type),
  });
};

export const useCheckAvailability = (id, from, to) => {
  return useQuery({
    queryKey: ['resourceAvailability', id, from, to],
    queryFn: () => resourceService.checkAvailability(id, from, to),
    enabled: !!id,
  });
};
