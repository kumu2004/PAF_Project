import { ResourceTypeEnum, ResourceStatusEnum } from '../types/resource.types';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export function ResourceFilters({ 
  filters, 
  onFilterChange, 
  onReset,
  showStatus = false,
  showCapacity = true
}) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.type || 
    filters.status || 
    filters.capacity ||
    filters.location;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Type</label>
        <Select value={filters.type || ''} onChange={(e) => handleChange('type', e.target.value)}>
          <option value="">All Types</option>
          {Object.entries(ResourceTypeEnum).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </div>

      {/* Status Filter */}
      {showStatus && (
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <Select value={filters.status || ''} onChange={(e) => handleChange('status', e.target.value)}>
            <option value="">All Status</option>
            {Object.entries(ResourceStatusEnum).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Capacity Filter */}
      {showCapacity && (
        <div>
          <label className="block text-sm font-medium mb-2">Min Capacity</label>
          <Input
            type="number"
            placeholder="e.g., 20"
            value={filters.capacity || ''}
            onChange={(e) => handleChange('capacity', e.target.value)}
            min="0"
          />
        </div>
      )}

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <Input
          placeholder="e.g., Block A"
          value={filters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>

      {/* Reset Button */}
      <div className="flex items-end">
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={() => {
              onReset?.();
              onFilterChange({
                search: '',
                type: '',
                status: '',
                capacity: '',
                location: '',
              });
            }}
            className="w-full"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
