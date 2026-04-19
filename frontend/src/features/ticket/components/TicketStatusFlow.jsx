import React from 'react';
import { CheckCircle2, Circle, Clock, Loader2, UserPlus } from 'lucide-react';
import { cn } from '../../../lib/utils';

const TicketStatusFlow = ({ status }) => {
  const steps = [
    { id: 'OPEN', label: 'Opened', icon: Clock },
    { id: 'ASSIGNED', label: 'Assigned', icon: UserPlus },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: Loader2 },
    { id: 'RESOLVED', label: 'Resolved', icon: CheckCircle2 },
  ];

  const currentIdx = steps.findIndex((step) => step.id === status);
  const isRejected = status === 'REJECTED';
  const isClosed = status === 'CLOSED';
  const isActuallyResolved = status === 'RESOLVED' || isClosed;

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg">
        <Circle className="w-5 h-5 fill-red-500" />
        <span className="font-semibold">Ticket Rejected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full max-w-2xl mx-auto py-6">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = idx < currentIdx || isActuallyResolved;
        const isCurrent = idx === currentIdx;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  isCompleted ? "bg-primary border-primary text-white" : 
                  isCurrent ? "border-primary text-primary bg-white animate-pulse" : 
                  "border-muted text-muted-foreground bg-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isCurrent && step.id === 'IN_PROGRESS' && "animate-spin")} />
              </div>
              <span className={cn(
                "text-xs font-medium mt-2 absolute -bottom-6 whitespace-nowrap",
                (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-muted mx-2">
                <div 
                  className={cn(
                    "h-full bg-primary transition-all duration-500", 
                    isCompleted ? "w-full" : "w-0"
                  )} 
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default TicketStatusFlow;
