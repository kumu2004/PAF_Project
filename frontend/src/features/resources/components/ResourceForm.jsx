import { useForm, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import {
  Save, X, Plus, Loader2, Upload,
  MapPin, Users, Building2, FlaskConical, Users2, Projector, BookOpen, Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useUploadResourceFile } from '../hooks/useResources';
import { Calendar } from '@/components/ui/calendar';
import { format, isBefore, startOfDay, isSameDay } from 'date-fns';

/* ── Constants ────────────────────────────────────────────── */
const RESOURCE_TYPES = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall',  icon: Building2,    color: 'text-blue-600',    bg: 'bg-blue-50',    ring: 'ring-blue-400'    },
  { value: 'LAB',          label: 'Laboratory',    icon: FlaskConical, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-400' },
  { value: 'MEETING_ROOM', label: 'Meeting Room',  icon: Users2,       color: 'text-violet-600',  bg: 'bg-violet-50',  ring: 'ring-violet-400'  },
  { value: 'LIBRARY',      label: 'Library',       icon: BookOpen,     color: 'text-indigo-600',  bg: 'bg-indigo-50',  ring: 'ring-indigo-400'  },
  { value: 'STUDY_SPACE',  label: 'Study Space',   icon: BookOpen,     color: 'text-teal-600',    bg: 'bg-teal-50',    ring: 'ring-teal-400'    },
];

const EQUIPMENT_PRESETS = [
  'Projector', 'Whiteboard', 'Smart TV', 'Microphone',
  'Air Conditioning', 'WiFi', 'Power Outlets', 'Video Conferencing',
  'Webcam', 'Conference Camera', 'Bluetooth Speaker', 'Recording Equipment',
  'Desktop Computers', 'Lab Equipment', '3D Printer',
];

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

/* ── Form Component ───────────────────────────────────────── */
export function ResourceForm({ initialData, onSubmit, isPending }) {
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [amenityInput, setAmenityInput] = useState('');
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadResourceFile();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: {
      name:                initialData?.name                || '',
      type:                initialData?.type                || 'LECTURE_HALL',
      location:            initialData?.location            || '',
      capacity:            initialData?.capacity            || '',
      description:         initialData?.description         || '',
      status:              initialData?.status              || 'ACTIVE',
      equipment:           initialData?.equipment           || [],
      amenities:           initialData?.amenities           || [],
      availabilityWindows: initialData?.availabilityWindows || [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'availabilityWindows' });
  const selectedType      = watch('type');
  const selectedEquipment = watch('equipment') || [];
  const amenities         = watch('amenities') || [];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadFile({ file, type: 'image' });
      setImageUrl(typeof url === 'string' ? url : url?.url || url?.secure_url || '');
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const toggleEquipment = (item) => {
    setValue('equipment',
      selectedEquipment.includes(item)
        ? selectedEquipment.filter(e => e !== item)
        : [...selectedEquipment, item]
    );
  };

  const addAmenity = () => {
    const val = amenityInput.trim();
    if (!val) return;
    val.split(',').map(s => s.trim()).filter(s => s && !amenities.includes(s))
      .forEach(s => setValue('amenities', [...watch('amenities'), s]));
    setAmenityInput('');
  };

  return (
    <form onSubmit={handleSubmit(data => onSubmit({ ...data, imageUrl }))}
      className="space-y-5">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
      {/* ── Basic Info ── */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Resource Name" error={errors.name?.message}>
            <Input {...register('name', { 
                required: 'Name is required',
                pattern: { value: /^[a-zA-Z\s\-]+$/, message: 'Only letters, spaces, and hyphens are allowed' }
              })}
              placeholder="e.g. Advanced Computing Lab"
              className={`h-10 rounded-lg ${errors.name ? 'border-rose-400' : ''}`} />
          </Field>
          <Field label="Location" error={errors.location?.message}>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input {...register('location', { required: 'Location is required' })}
                placeholder="e.g. W-Block, Floor 1"
                className={`h-10 pl-9 rounded-lg ${errors.location ? 'border-rose-400' : ''}`} />
            </div>
          </Field>
          <Field label="Capacity" error={errors.capacity?.message}>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input type="number"
                {...register('capacity', { 
                  required: 'Capacity is required', 
                  valueAsNumber: true, 
                  min: { value: 1, message: 'Must be at least 1' } 
                })}
                onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                placeholder="e.g. 30"
                className={`h-10 pl-9 rounded-lg ${errors.capacity ? 'border-rose-400' : ''}`} />
            </div>
          </Field>
          <Field label="Status">
            <select {...register('status')}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="ACTIVE">Active</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </Field>
        </div>
        <Field label="Description" error={errors.description?.message}>
          <Textarea {...register('description', {
              maxLength: { value: 500, message: 'Description must be less than 500 characters' }
            })}
            placeholder="Describe what this resource offers..."
            className={`min-h-[80px] rounded-lg resize-none ${errors.description ? 'border-rose-400' : ''}`} />
        </Field>
      </Section>

      {/* ── Resource Type ── */}
      <Section title="Resource Type">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {RESOURCE_TYPES.map(({ value, label, icon: Icon, color, bg, ring }) => {
            const active = selectedType === value;
            return (
              <button key={value} type="button" onClick={() => setValue('type', value)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left
                  ${active ? `${bg} ring-2 ${ring} border-transparent shadow-sm` : 'border-border hover:border-border/80 hover:bg-muted/30'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? bg : 'bg-muted/50'}`}>
                  <Icon className={`w-4 h-4 ${active ? color : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-sm font-medium leading-tight ${active ? color : 'text-foreground'}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Cover Photo">
        <div className="space-y-2">
          {/* Cover Photo */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Cover Photo</label>
            <div className={`relative aspect-video rounded-xl border-2 border-dashed overflow-hidden
              ${imageUrl ? 'border-emerald-300 bg-emerald-50/30' : 'border-border bg-muted/20'}`}>
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-rose-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-1.5">
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Upload className="w-6 h-6 text-muted-foreground/60" />}
                  <span className="text-xs text-muted-foreground">Click to upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'image')} />
                </label>
              )}
            </div>
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              placeholder="Or paste image URL..." className="h-9 rounded-lg text-xs" />
          </div>
        </div>
      </Section>
        </div>{/* end LEFT */}

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
      {/* ── Equipment ── */}
      <Section title="Equipment">
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_PRESETS.map(item => {
            const active = selectedEquipment.includes(item);
            return (
              <button key={item} type="button" onClick={() => toggleEquipment(item)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                  ${active ? 'bg-[#182c51] text-white border-[#182c51]' : 'bg-muted/40 text-muted-foreground border-border/50 hover:border-border hover:bg-muted'}`}>
                {active && '✓ '}{item}
              </button>
            );
          })}
        </div>
        {/* Custom equipment */}
        <Input
          placeholder="Add custom equipment (press Enter)..."
          className="h-9 rounded-lg text-sm mt-2"
          onKeyDown={e => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const val = e.target.value.trim();
            if (val && !selectedEquipment.includes(val)) {
              setValue('equipment', [...selectedEquipment, val]);
              e.target.value = '';
            }
          }}
        />
        {selectedEquipment.filter(e => !EQUIPMENT_PRESETS.includes(e)).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedEquipment.filter(e => !EQUIPMENT_PRESETS.includes(e)).map((item, i) => (
              <Badge key={i} variant="secondary" className="gap-1 text-xs">
                {item} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleEquipment(item)} />
              </Badge>
            ))}
          </div>
        )}
      </Section>

      {/* ── Amenities ── */}
      <Section title="Amenities">
        <div className="flex gap-2">
          <Input value={amenityInput} onChange={e => setAmenityInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
            placeholder="e.g. Natural Lighting, Quiet Zone..."
            className="h-9 rounded-lg text-sm flex-1" />
          <Button type="button" variant="outline" size="sm" className="rounded-lg h-9 px-4" onClick={addAmenity}>
            Add
          </Button>
        </div>
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {amenities.map((am, i) => (
              <Badge key={i} variant="outline" className="gap-1 text-xs px-2.5 py-1">
                {am} <X className="w-3 h-3 cursor-pointer" onClick={() => setValue('amenities', amenities.filter((_, j) => j !== i))} />
              </Badge>
            ))}
          </div>
        )}
      </Section>

      {/* ── Operating Hours ── */}
      <Section title="Operating Hours">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="bg-background border rounded-xl p-3 flex-shrink-0 mx-auto xl:mx-0">
            <Calendar
              mode="multiple"
              selected={fields.map(f => new Date(f.date))}
              onSelect={(dates) => {
                const currentDates = fields.map(f => new Date(f.date));
                const addedDates = dates.filter(d => !currentDates.some(cd => isSameDay(cd, d)));
                const removedDates = currentDates.filter(cd => !dates.some(d => isSameDay(cd, d)));

                // Remove unselected dates
                removedDates.forEach(rd => {
                  const idx = fields.findIndex(f => isSameDay(new Date(f.date), rd));
                  if (idx !== -1) remove(idx);
                });

                // Add newly selected dates
                addedDates.forEach(ad => {
                  append({ date: format(ad, 'yyyy-MM-dd'), startTime: '08:00', endTime: '18:00' });
                });
              }}
              disabled={(date) => isBefore(date, startOfDay(new Date()))}
              className="rounded-md"
            />
          </div>
          
          <div className="flex-1 space-y-2 max-h-[350px] overflow-y-auto pr-2">
            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
                <CalendarIcon className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">Select dates from the calendar<br/>to set operating hours.</p>
              </div>
            ) : (
              fields.map((field, i) => (
                <div key={field.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 transition-all hover:bg-muted/50">
                  <div className="flex-1 min-w-[120px] font-medium text-sm px-2 text-[#182c51]">
                     {format(new Date(field.date), 'MMMM d, yyyy')}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Input type="time" {...register(`availabilityWindows.${i}.startTime`, { required: true })} 
                        className={`w-28 h-9 rounded-lg text-sm bg-background ${errors.availabilityWindows?.[i]?.startTime ? 'border-rose-400' : ''}`} />
                      <span className="text-muted-foreground text-xs font-medium">–</span>
                      <Input type="time" {...register(`availabilityWindows.${i}.endTime`, { 
                          required: true,
                          validate: (val, formValues) => {
                            const start = formValues.availabilityWindows[i].startTime;
                            return !start || val > start || 'End time must be after start time';
                          }
                        })} 
                        className={`w-28 h-9 rounded-lg text-sm bg-background ${errors.availabilityWindows?.[i]?.endTime ? 'border-rose-400' : ''}`} />
                    </div>
                    {(errors.availabilityWindows?.[i]?.startTime || errors.availabilityWindows?.[i]?.endTime) && (
                      <span className="text-[10px] text-rose-500 font-medium whitespace-nowrap">
                        {errors.availabilityWindows?.[i]?.endTime?.message || 'Valid time range required'}
                      </span>
                    )}
                  </div>
                  <Button type="button" variant="ghost" size="icon"
                    className="h-8 w-8 shrink-0 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg ml-auto"
                    onClick={() => remove(i)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Section>
        </div>{/* end RIGHT */}
      </div>{/* end GRID */}

      {/* ── Submit ── */}
      <div className="flex justify-end gap-3 pt-2 border-t border-border/40">
        <Button type="button" variant="outline" className="rounded-xl px-5" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}
          className="bg-[#182c51] hover:bg-orange-500 transition-colors text-white font-semibold rounded-xl px-8">
          {isPending
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            : <><Save className="w-4 h-4 mr-2" />{initialData ? 'Update Resource' : 'Create Resource'}</>}
        </Button>
      </div>
    </form>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
function Section({ title, children, action }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-orange-500 rounded-full" />
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
