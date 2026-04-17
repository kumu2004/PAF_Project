import { CalendarDays, Wrench, Bell } from 'lucide-react';

export const FEATURES = [
  {
    icon:       CalendarDays,
    number:     '01',
    title:      'Book a facility',
    description:
      'Browse available lecture halls, labs, meeting rooms and equipment. ' +
      'Check real-time availability and submit a booking request in seconds.',
    highlight:  'Live availability checking',
  },
  {
    icon:       Wrench,
    number:     '02',
    title:      'Report an incident',
    description:
      'Spotted a fault or maintenance issue? Submit a detailed report with ' +
      'photo evidence. Your request is tracked from submission to resolution.',
    highlight:  'Photo evidence supported',
  },
  {
    icon:       Bell,
    number:     '03',
    title:      'Track in real time',
    description:
      'Receive instant notifications when your booking is confirmed or your ' +
      'incident ticket is updated. Never wonder about the status of your request.',
    highlight:  'Instant notifications',
  },
];
