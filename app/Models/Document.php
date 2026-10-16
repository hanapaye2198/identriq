<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
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

    /** @return BelongsTo<Registrant, $this> */
    public function registrant(): BelongsTo
    {
        return $this->belongsTo(Registrant::class);
    }
}
