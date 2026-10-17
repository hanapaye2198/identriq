<?php

namespace App\Support;

use Illuminate\Validation\ValidationException;

/**
 * Selective-disclosure scope (decision D5, 2026-10-17): the wallet picks the
 * fields a verifier may see; the scope travels with the QR / paste code and is
 * echoed back in check responses and AuthEvent metadata.
 */
final class ShareScope
{
    /** Fields a wallet can choose to disclose. `photo` is a claim flag only — the demo has no photo data (D2 placeholder). */
    public const FIELDS = [
        'name',
        'photo',
        'dob',
        'over18',
        'id',
        'id_masked',
        'address',
    ];

    /**
     * Parse a comma-separated share scope; null when nothing was requested
     * (callers then fall back to the legacy full disclosure). Unknown fields
     * fail validation so typos never silently leak more than intended.
     *
     * @return list<string>|null
     */
    public static function parse(?string $raw): ?array
    {
        if ($raw === null || trim($raw) === '') {
            return null;
        }

        $fields = array_values(array_unique(array_filter(array_map('trim', explode(',', $raw)))));
        $unknown = array_diff($fields, self::FIELDS);

        if ($unknown !== []) {
            throw ValidationException::withMessages([
                'share' => 'Unknown share field(s): '.implode(',', $unknown),
            ]);
        }

        return $fields === [] ? null : $fields;
    }

    /** "6757000001" → "•••• 0001" (matches the verifier mask format). */
    public static function maskId(?string $biosure): ?string
    {
        if (! $biosure) {
            return null;
        }

        return '•••• '.substr($biosure, -4);
    }
}
