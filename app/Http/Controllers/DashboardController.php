<?php

namespace App\Http\Controllers;

use App\Application\Dashboard\GetDashboard;
use App\Application\Ports\ActorResolver;
use DateTimeInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, GetDashboard $dashboard, ActorResolver $actors): Response
    {
        $data = $dashboard->execute($actors->forUser($request->user()->id));

        if (isset($data['activity'])) {
            $data['activity'] = array_map(
                fn ($a) => ['at' => $a['at']->format(DateTimeInterface::ATOM)] + $a,
                $data['activity'],
            );
        }

        return Inertia::render('dashboard', ['dashboard' => $data]);
    }
}
