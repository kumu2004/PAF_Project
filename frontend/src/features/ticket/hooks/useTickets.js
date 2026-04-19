import { useQuery } from '@tanstack/react-query';
import ticketService from '../services/ticketService';

export const useTickets = (filters = {}) => {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => {
      if (filters.isAssigned) {
        return ticketService.getAssignedTickets(filters);
      }
      return ticketService.getAllTickets(filters);
    },
    keepPreviousData: true,
  });
};

export const useTicket = (id) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketService.getTicketById(id),
    enabled: !!id,
  });
};
