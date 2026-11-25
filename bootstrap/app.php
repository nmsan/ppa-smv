<?php

use App\Application\Shared\ConflictException;
use App\Application\Shared\ForbiddenException;
use App\Application\Shared\NotFoundException;
use App\Domain\Shared\DomainRuleViolation;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Middleware\RoleMiddleware;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => RoleMiddleware::class,
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Use-case and domain errors become proper HTTP responses.
        $exceptions->map(NotFoundException::class, fn ($e) => new NotFoundHttpException($e->getMessage(), $e));
        $exceptions->map(ForbiddenException::class, fn ($e) => new AccessDeniedHttpException($e->getMessage(), $e));
        $exceptions->map(ConflictException::class, fn ($e) => ValidationException::withMessages(['form' => $e->getMessage()]));
        $exceptions->map(DomainRuleViolation::class, fn ($e) => ValidationException::withMessages(['form' => $e->getMessage()]));

        // A form left open past the session lifetime: keep what was typed and ask to send it again.
        $exceptions->respond(function ($response, $e, $request) {
            if ($response->getStatusCode() === 419 && ! $request->expectsJson()) {
                return back()->withErrors([
                    'form' => 'For your security, the page had been open too long. Please press the button again to send it.',
                ]);
            }

            return $response;
        });
    })->create();
