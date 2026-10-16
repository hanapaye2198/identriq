<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'registrant_id',
        'center_id',
        'slot_at',
        'qr_token',
        'status',
    ];

    protected $casts = [
        'slot_at' => 'datetime',
    ];

    /** @return BelongsTo<Registrant, $this> */
    public function registrant(): BelongsTo
    {
        return $this->belongsTo(Registrant::class);
    }

    /** @return BelongsTo<RegistrationCenter, $this> */
    public function center(): BelongsTo
    {
        return $this->belongsTo(RegistrationCenter::class, 'center_id');
    }
}
