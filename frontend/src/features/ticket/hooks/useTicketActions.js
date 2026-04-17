import { useMutation, useQueryClient } from '@tanstack/react-query';
import ticketService from '../services/ticketService';
import { toast } from 'sonner';

export const useTicketActions = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ data, files }) => ticketService.createTicket(data, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      toast.success('Ticket created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }) => ticketService.updateTicketStatus(id, status, notes),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-assigned-tickets'] });
      toast.success(`Ticket marked as ${variables.status}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ id, content }) => ticketService.addComment(id, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });

  const uploadAttachmentsMutation = useMutation({
    mutationFn: ({ id, files }) => ticketService.uploadAttachments(id, files),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
      toast.success('Attachments uploaded successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload attachments');
    },
  });

  const removeAttachmentMutation = useMutation({
    mutationFn: ({ id, attachmentId }) => ticketService.removeAttachment(id, attachmentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
      toast.success('Attachment removed');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove attachment');
    },
  });

  const renameAttachmentMutation = useMutation({
    mutationFn: ({ id, attachmentId, newName }) => ticketService.renameAttachment(id, attachmentId, newName),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
      toast.success('Attachment renamed');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to rename attachment');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => ticketService.updateTicket(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-assigned-tickets'] });
      toast.success('Ticket updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update ticket');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ticketService.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-assigned-tickets'] });
      toast.success('Ticket deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete ticket');
    },
  });

  return {
    createTicket: createMutation.mutateAsync,
    updateTicket: updateMutation.mutateAsync,
    deleteTicket: deleteMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    addComment: addCommentMutation.mutateAsync,
    uploadAttachments: uploadAttachmentsMutation.mutateAsync,
    removeAttachment: removeAttachmentMutation.mutateAsync,
    renameAttachment: renameAttachmentMutation.mutateAsync,
    isLoading: 
      createMutation.isPending || 
      updateMutation.isPending ||
      deleteMutation.isPending ||
      updateStatusMutation.isPending || 
      addCommentMutation.isPending || 
      uploadAttachmentsMutation.isPending ||
      removeAttachmentMutation.isPending ||
      renameAttachmentMutation.isPending,
  };
};
