<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'registrant_id',
        'category',
        'doc_type',
        'ref_number',
        'path',
        'mime',
        'size',
        'verified_status',
        'verified_note',
    ];

    protected $appends = ['file_url'];

    public function getFileUrlAttribute(): ?string
    {
        if (empty($this->path)) {
            return null;
        }

        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://')) {
            return $this->path;
        }

        if (str_starts_with($this->path, '/storage/')) {
            return $this->path;
        }

        return '/storage/'.ltrim($this->path, '/');
    }

    /** @return BelongsTo<Registrant, $this> */
    public function registrant(): BelongsTo
    {
        return $this->belongsTo(Registrant::class);
    }
}
