<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Identity extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'registrant_id',
        'biosure_id_number',
        'status',
        'failure_reason',
        'card_personalized_at',
        'delivered_at',
        'delivered_channel',
        'suspended_at',
        'revoked_at',
    ];

    protected $casts = [
        'card_personalized_at' => 'datetime',
        'delivered_at' => 'datetime',
        'suspended_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    /**
     * Derived credential state for wallets and verifiers.
     * Revocation outranks suspension; both outrank the lifecycle status
     * (approved = active; pending / failed pass through untouched).
     */
    public function credentialState(): string
    {
        if ($this->revoked_at) {
            return 'revoked';
        }

        if ($this->suspended_at) {
            return 'suspended';
        }

        return $this->status === 'approved' ? 'active' : $this->status;
    }

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
