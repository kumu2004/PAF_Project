import api from '../../../config/axios';

const ticketService = {
  getAllTickets: async (params) => {
    const response = await api.get('/tickets', { params });
    return response.data.data;
  },

  getAssignedTickets: async (params) => {
    const response = await api.get('/tickets/assigned', { params });
    return response.data.data;
  },

  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data.data;
  },

  createTicket: async (ticketData, files) => {
    const formData = new FormData();
    // Append the ticket JSON as a blob
    formData.append('ticket', new Blob([JSON.stringify(ticketData)], { type: 'application/json' }));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post('/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  updateTicket: async (id, ticketData) => {
    const response = await api.put(`/tickets/${id}`, ticketData);
    return response.data.data;
  },

  deleteTicket: async (id) => {
    const response = await api.delete(`/tickets/${id}`);
    return response.data.data;
  },

  updateTicketStatus: async (id, status, notes) => {
    const response = await api.patch(`/tickets/${id}/status`, { status, notes });
    return response.data.data;
  },

  assignTechnician: async (id, technicianId) => {
    const response = await api.patch(`/tickets/${id}/assign`, { technicianId });
    return response.data.data;
  },

  addComment: async (id, content) => {
    const response = await api.post(`/tickets/${id}/comments`, { content });
    return response.data.data;
  },

  deleteComment: async (ticketId, commentId) => {
    const response = await api.delete(`/tickets/${ticketId}/comments/${commentId}`);
    return response.data.data;
  },

  uploadAttachments: async (ticketId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const response = await api.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  removeAttachment: async (ticketId, attachmentId) => {
    const response = await api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
    return response.data.data;
  },

  renameAttachment: async (ticketId, attachmentId, newName) => {
    const response = await api.patch(`/tickets/${ticketId}/attachments/${attachmentId}`, { newName });
    return response.data.data;
  },
};

export default ticketService;
