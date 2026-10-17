/**
 * Client mirror of App\Support\ShareScope — keep the field whitelist in sync
 * with the PHP side. Labels are written for citizens: what a verifier sees.
 */
export const SHARE_FIELDS = [
    'name',
    'photo',
    'dob',
    'over18',
    'id',
    'id_masked',
    'address',
] as const;

const FIELD_LABELS: Record<string, string> = {
    name: 'Name',
    photo: 'Photo',
    dob: 'Date of birth',
    over18: 'Over 18 only',
    id: 'ID number (full)',
    id_masked: 'ID number (masked)',
    address: 'Address',
};

export interface SharePreset {
    id: string;
    label: string;
    blurb: string;
    fields: string[];
}

export const SHARE_PRESETS: SharePreset[] = [
    {
        id: 'bank',
        label: 'Bank',
        blurb: 'KYC account opening',
        fields: ['name', 'over18', 'id_masked'],
    },
    {
        id: 'police',
        label: 'Police',
        blurb: 'On-the-spot ID check',
        fields: ['name', 'dob', 'id'],
    },
    {
        id: 'telco',
        label: 'Telco',
        blurb: 'SIM registration',
        fields: ['name', 'id_masked'],
    },
    {
        id: 'clinic',
        label: 'Clinic',
        blurb: 'Patient registration',
        fields: ['name', 'dob'],
    },
    {
        id: 'custom',
        label: 'Custom',
        blurb: 'Pick exactly what to share',
        fields: [],
    },
];

/** The minimum a bank needs — the wallet's default share (W5). */
export const MINIMAL_SHARE = ['name', 'over18', 'id_masked'];

/** "•••• 4821" — mirrors ShareScope::maskId() on the server. */
export function maskId(biosureIdNumber: string): string {
    return `•••• ${biosureIdNumber.slice(-4)}`;
}

/** Field ids → human labels, in the order verifiers read them. */
export function describeFields(fields: string[]): string[] {
    return SHARE_FIELDS.filter((field) => fields.includes(field)).map(
        (field) => FIELD_LABELS[field],
    );
}
