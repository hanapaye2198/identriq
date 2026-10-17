import { Button } from '@/components/ui/button';
import { describeFields, SHARE_PRESETS } from './share-scope';

interface ShareViewProps {
    fields: string[];
    presetId: string;
    onFieldsChange: (fields: string[]) => void;
    onPresetChange: (presetId: string) => void;
    onPresent: () => void;
}

const AGE_OPTIONS = [
    { id: 'dob', label: 'Full date' },
    { id: 'over18', label: 'Over 18' },
    { id: 'none', label: 'None' },
] as const;

const ID_OPTIONS = [
    { id: 'id_masked', label: 'Masked' },
    { id: 'id', label: 'Full' },
    { id: 'none', label: 'None' },
] as const;

/**
 * W5 — the share composer. Presets pick the minimum data a verifier needs;
 * any manual toggle flips the selection to "Custom".
 */
export default function ShareView({
    fields,
    presetId,
    onFieldsChange,
    onPresetChange,
    onPresent,
}: ShareViewProps) {
    const has = (field: string) => fields.includes(field);

    function toggle(field: string) {
        onFieldsChange(
            has(field) ? fields.filter((f) => f !== field) : [...fields, field],
        );
        onPresetChange('custom');
    }

    function chooseAge(mode: 'dob' | 'over18' | 'none') {
        const base = fields.filter((f) => f !== 'dob' && f !== 'over18');
        onFieldsChange(mode === 'none' ? base : [...base, mode]);
        onPresetChange('custom');
    }

    function chooseId(mode: 'id' | 'id_masked' | 'none') {
        const base = fields.filter((f) => f !== 'id' && f !== 'id_masked');
        onFieldsChange(mode === 'none' ? base : [...base, mode]);
        onPresetChange('custom');
    }

    function pickPreset(id: string, presetFields: string[]) {
        onPresetChange(id);
        if (id !== 'custom') onFieldsChange([...presetFields]);
    }

    const ageMode = has('dob') ? 'dob' : has('over18') ? 'over18' : 'none';
    const idMode = has('id') ? 'id' : has('id_masked') ? 'id_masked' : 'none';
    const labels = describeFields(fields);

    return (
        <div className="mt-4 space-y-4">
            <section className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="font-semibold">Who's asking?</h2>
                <p className="mt-0.5 text-xs text-[#14201B]/50">
                    Presets pick the minimum data each verifier needs.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                    {SHARE_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => pickPreset(preset.id, preset.fields)}
                            className={`min-h-[56px] rounded-xl border px-2 py-2 text-left text-xs font-semibold ${
                                presetId === preset.id
                                    ? 'border-[#0E2A26] bg-[#0E2A26] text-white'
                                    : 'border-[#14201B]/10 bg-white'
                            }`}
                        >
                            {preset.label}
                            <span
                                className={`mt-0.5 block text-[10px] font-normal ${
                                    presetId === preset.id
                                        ? 'text-white/70'
                                        : 'text-[#14201B]/45'
                                }`}
                            >
                                {preset.blurb}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="font-semibold">What the verifier sees</h2>
                <div className="mt-3 space-y-2">
                    <ToggleRow
                        label="Name"
                        checked={has('name')}
                        onChange={() => toggle('name')}
                    />
                    <ToggleRow
                        label="Photo"
                        checked={has('photo')}
                        onChange={() => toggle('photo')}
                    />
                    <ChoiceRow
                        label="Date of birth"
                        options={AGE_OPTIONS}
                        value={ageMode}
                        onChange={(id) =>
                            chooseAge(id as 'dob' | 'over18' | 'none')
                        }
                    />
                    <ChoiceRow
                        label="ID number"
                        options={ID_OPTIONS}
                        value={idMode}
                        onChange={(id) =>
                            chooseId(id as 'id' | 'id_masked' | 'none')
                        }
                    />
                    <ToggleRow
                        label="Address"
                        checked={has('address')}
                        onChange={() => toggle('address')}
                    />
                </div>
            </section>

            <section className="rounded-2xl bg-[#0E2A26] p-4 text-white shadow-sm">
                <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">
                    Verifier will see
                </p>
                <p className="mt-1 text-sm font-semibold">
                    {labels.length > 0
                        ? labels.join(' · ')
                        : 'Nothing yet — pick at least one field'}
                </p>
                <p className="mt-1 text-xs text-white/60">
                    Nothing else is revealed. Every check lands in Activity.
                </p>
                <Button
                    type="button"
                    onClick={onPresent}
                    disabled={fields.length === 0}
                    className="mt-3 min-h-[44px] w-full bg-[#2FD6A3] font-semibold text-[#0E2A26] hover:bg-[#2FD6A3]/90 disabled:opacity-40"
                >
                    Show QR
                </Button>
            </section>
        </div>
    );
}

function ToggleRow({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <label className="flex min-h-[44px] items-center justify-between gap-3">
            <span className="text-sm">{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="size-5 accent-[#0E2A26]"
            />
        </label>
    );
}

function ChoiceRow({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: readonly { id: string; label: string }[];
    value: string;
    onChange: (id: string) => void;
}) {
    return (
        <div className="flex min-h-[44px] items-center justify-between gap-3">
            <span className="text-sm">{label}</span>
            <div className="flex rounded-lg bg-[#14201B]/5 p-0.5">
                {options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onChange(option.id)}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                            value === option.id
                                ? 'bg-white shadow-sm'
                                : 'text-[#14201B]/50'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
