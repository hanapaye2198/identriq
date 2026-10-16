<?php

use Database\Seeders\IdentriqSeeder;

test('centers expose map coordinates', function () {
    $this->seed(IdentriqSeeder::class);

    $centers = $this->getJson(route('api.centers'))->assertOk()->json();
    expect($centers)->not->toBeEmpty();

    foreach ($centers as $center) {
        expect($center)->toHaveKeys(['latitude', 'longitude'])
            ->and(is_numeric($center['latitude']))->toBeTrue()
            ->and(is_numeric($center['longitude']))->toBeTrue();
    }
});
