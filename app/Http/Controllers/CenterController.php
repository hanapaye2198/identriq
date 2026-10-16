<?php

namespace App\Http\Controllers;

use App\Models\RegistrationCenter;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class CenterController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('centers', [
            'centers' => RegistrationCenter::where('is_active', true)->get(),
        ]);
    }

    public function json(): JsonResponse
    {
        return response()->json(
            RegistrationCenter::where('is_active', true)->get()
        );
    }
}
