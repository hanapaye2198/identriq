<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Demographic extends Model
{
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
    ];

    protected $casts = [
        'dob' => 'date',
    ];

    /** @return BelongsTo<Registrant, $this> */
    public function registrant(): BelongsTo
    {
        return $this->belongsTo(Registrant::class);
    }
}
