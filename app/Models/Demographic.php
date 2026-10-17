<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Demographic extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'registrant_id',
        'given_name',
        'family_name',
        'middle_name',
        'other_names',
        'full_name',
        'dob',
        'gender',
        'nationality',
        'marital_status',
        'email',
        'mobile',
        'province',
        'district',
        'llg',
        'ward',
        'village',
        'residential_address',
        'address_line',
        'postal_code',
        'photo_path',
    ];

    protected $casts = [
        'dob' => 'date',
    ];

    protected $appends = [
        'photo_url',
    ];

    public function getPhotoUrlAttribute(): ?string
    {
        if ($this->photo_path) {
            if (str_starts_with($this->photo_path, 'http://') || str_starts_with($this->photo_path, 'https://') || str_starts_with($this->photo_path, '/')) {
                return $this->photo_path;
            }
            return Storage::url($this->photo_path);
        }

        $doc = $this->relationLoaded('registrant')
            ? $this->registrant?->documents?->firstWhere('doc_type', 'portrait_photo')
            : $this->registrant?->documents()->where('doc_type', 'portrait_photo')->first();

        if ($doc && $doc->path) {
            if (str_starts_with($doc->path, 'http://') || str_starts_with($doc->path, 'https://') || str_starts_with($doc->path, '/')) {
                return $doc->path;
            }
            return Storage::url($doc->path);
        }

        return null;
    }

    /** @return BelongsTo<Registrant, $this> */
    public function registrant(): BelongsTo
    {
        return $this->belongsTo(Registrant::class);
    }
}
