<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuthEvent extends Model
{
    protected $fillable = [
        'identity_id',
        'mode',
        'result',
        'verifier_ref',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /** @return BelongsTo<Identity, $this> */
    public function identity(): BelongsTo
    {
        return $this->belongsTo(Identity::class);
    }
}
