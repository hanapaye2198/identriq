<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConsentRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'identity_id',
        'verifier_name',
        'purpose',
        'fields',
        'status',
        'expires_at',
        'decided_at',
    ];

    protected $casts = [
        'fields' => 'array',
        'expires_at' => 'datetime',
        'decided_at' => 'datetime',
    ];

    /** @return BelongsTo<Identity, $this> */
    public function identity(): BelongsTo
    {
        return $this->belongsTo(Identity::class);
    }
}
