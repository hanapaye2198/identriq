<?php

use App\Models\Appointment;
use App\Models\AuthEvent;
use App\Models\Demographic;
use App\Models\Document;
use App\Models\Identity;
use App\Models\Notification;
use App\Models\Registrant;
use App\Models\RegistrationCenter;

test('deleting a registrant soft deletes instead of dropping', function () {
    $registrant = Registrant::create(['mobile' => '+6757666666', 'status' => 'draft']);

    $registrant->delete();

    expect(Registrant::where('mobile', '+6757666666')->exists())->toBeFalse()
        ->and(Registrant::withTrashed()->where('mobile', '+6757666666')->exists())->toBeTrue();

    $registrant->restore();
    expect(Registrant::where('mobile', '+6757666666')->exists())->toBeTrue();
});

test('all domain models use soft deletes', function () {
    foreach ([
        Registrant::class,
        Demographic::class,
        Document::class,
        Appointment::class,
        Identity::class,
        AuthEvent::class,
        Notification::class,
        RegistrationCenter::class,
    ] as $model) {
        expect(method_exists($model, 'restore'))->toBeTrue($model.' must use SoftDeletes');
    }
});
