import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ResourceSearchBar({ value, onChange, onClear }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
      <Input
        placeholder="Search by name, location, or description..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute right-2 top-2 h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
