<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Sanctum\HasApiTokens;

class Registrant extends Model
{
    use HasApiTokens;
    protected $fillable = [
        'language',
        'mobile',
        'mobile_verified_at',
        'consent_version',
        'consent_accepted_at',
        'status',
    ];

    protected $casts = [
        'mobile_verified_at' => 'datetime',
        'consent_accepted_at' => 'datetime',
    ];

    /** @return HasOne<Demographic, $this> */
    public function demographic(): HasOne
    {
        return $this->hasOne(Demographic::class);
    }

    /** @return HasMany<Document, $this> */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /** @return HasOne<Identity, $this> */
    public function identity(): HasOne
    {
        return $this->hasOne(Identity::class);
    }

    /** @return HasMany<Notification, $this> */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
