<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception, Request $request) {
            $status = $response->getStatusCode();

            $shouldRenderInertiaError = in_array($status, [400, 401, 403, 404, 405, 419, 429, 502, 503, 504])
                || ($status === 500 && !app()->hasDebugModeEnabled());

            if ($shouldRenderInertiaError && !$request->is('api/*') && !$request->expectsJson()) {
                return \Inertia\Inertia::render('Error', [
                    'status' => $status,
                    'message' => $exception->getMessage() ?: null,
                ])->toResponse($request)->setStatusCode($status);
            }

            if ($status === 419) {
                return back()->with([
                    'message' => 'Sesi kedaluwarsa, silakan muat ulang halaman.',
                ]);
            }

            return $response;
        });
    })->create();
