<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Identity extends Model
{
    protected $fillable = [
        'registrant_id',
        'biosure_id_number',
        'status',
        'failure_reason',
        'card_personalized_at',
        'delivered_at',
        'delivered_channel',
    ];

    protected $casts = [
        'card_personalized_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    /** @return BelongsTo<Registrant, $this> */
    public function registrant(): BelongsTo
    {
        return $this->belongsTo(Registrant::class);
    }

    /** @return HasMany<AuthEvent, $this> */
    public function authEvents(): HasMany
    {
        return $this->hasMany(AuthEvent::class);
    }
}
