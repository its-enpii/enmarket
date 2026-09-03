<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SponsorResource;
use App\Models\Sponsor;
use App\Services\NextRevalidator;
use App\Services\Sponsor\MetadataFetcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SponsorController extends Controller
{
    /**
     * GET /api/admin/sponsors
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $status = $request->input('is_active');

        $query = Sponsor::query()->orderByDesc('amount')->orderByDesc('id');

        if ($status !== null && $status !== '') {
            $query->where('is_active', filter_var($status, FILTER_VALIDATE_BOOLEAN));
        }

        if ($q = trim((string) $request->input('q', ''))) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('domain', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => SponsorResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * GET /api/admin/sponsors/{sponsor}
     */
    public function show(Sponsor $sponsor): JsonResponse
    {
        return response()->json([
            'data' => new SponsorResource($sponsor),
        ]);
    }

    /**
     * POST /api/admin/sponsors
     */
    public function store(Request $request, MetadataFetcher $fetcher, NextRevalidator $revalidator): JsonResponse
    {
        $data = $request->validate([
            'domain' => ['required', 'string', 'max:255', 'unique:sponsors,domain'],
            'name' => ['nullable', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:2000'],
            'logo_url' => ['nullable', 'string', 'max:2000'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $domain = trim($data['domain']);
        $metadata = $fetcher->fetch($domain);

        $sponsor = Sponsor::create([
            'domain' => $domain,
            'name' => ! empty($data['name']) ? $data['name'] : ($metadata['name'] ?? $domain),
            'url' => ! empty($data['url']) ? $data['url'] : ($metadata['url'] ?? "https://{$domain}"),
            'logo_url' => ! empty($data['logo_url']) ? $data['logo_url'] : ($metadata['logo_url'] ?? null),
            'description' => $data['description'] ?? null,
            'fetched_description' => $metadata['fetched_description'] ?? null,
            'amount' => $data['amount'],
            'is_active' => $request->boolean('is_active', true),
            'fetched_at' => $metadata['fetched_at'] ?? now(),
        ]);

        $revalidator->revalidateHome();

        return response()->json([
            'data' => new SponsorResource($sponsor),
            'message' => 'Sponsor berhasil ditambahkan.',
        ], 201);
    }

    /**
     * PUT/PATCH /api/admin/sponsors/{sponsor}
     */
    public function update(Request $request, Sponsor $sponsor, MetadataFetcher $fetcher, NextRevalidator $revalidator): JsonResponse
    {
        $data = $request->validate([
            'domain' => ['sometimes', 'required', 'string', 'max:255', 'unique:sponsors,domain,' . $sponsor->id],
            'name' => ['nullable', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:2000'],
            'logo_url' => ['nullable', 'string', 'max:2000'],
            'description' => ['nullable', 'string'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('domain', $data) && trim($data['domain']) !== $sponsor->domain) {
            $newDomain = trim($data['domain']);
            $metadata = $fetcher->fetch($newDomain);

            $sponsor->domain = $newDomain;
            $sponsor->fetched_description = $metadata['fetched_description'] ?? null;
            $sponsor->fetched_at = $metadata['fetched_at'] ?? now();

            if (! array_key_exists('name', $data) || empty($data['name'])) {
                $sponsor->name = $metadata['name'] ?? $newDomain;
            }
            if (! array_key_exists('url', $data) || empty($data['url'])) {
                $sponsor->url = $metadata['url'] ?? "https://{$newDomain}";
            }
            if (! array_key_exists('logo_url', $data)) {
                $sponsor->logo_url = $metadata['logo_url'] ?? null;
            }
        }

        if (array_key_exists('name', $data) && ! empty($data['name'])) {
            $sponsor->name = $data['name'];
        }
        if (array_key_exists('url', $data) && ! empty($data['url'])) {
            $sponsor->url = $data['url'];
        }
        if (array_key_exists('logo_url', $data)) {
            $sponsor->logo_url = $data['logo_url'] ?: null;
        }
        if (array_key_exists('description', $data)) {
            $sponsor->description = $data['description'] ?: null;
        }
        if (array_key_exists('amount', $data)) {
            $sponsor->amount = $data['amount'];
        }
        if (array_key_exists('is_active', $data)) {
            $sponsor->is_active = $request->boolean('is_active');
        }

        $sponsor->save();

        $revalidator->revalidateHome();

        return response()->json([
            'data' => new SponsorResource($sponsor),
            'message' => 'Sponsor berhasil diperbarui.',
        ]);
    }

    /**
     * DELETE /api/admin/sponsors/{sponsor}
     */
    public function destroy(Sponsor $sponsor, NextRevalidator $revalidator): JsonResponse
    {
        $sponsor->delete();
        $revalidator->revalidateHome();

        return response()->json([
            'message' => 'Sponsor berhasil dihapus.',
        ]);
    }

    /**
     * POST /api/admin/sponsors/fetch-metadata
     */
    public function fetchMetadata(Request $request, MetadataFetcher $fetcher): JsonResponse
    {
        $data = $request->validate([
            'domain' => ['required', 'string', 'max:255'],
        ]);

        $meta = $fetcher->fetch(trim($data['domain']));

        return response()->json([
            'data' => $meta,
        ]);
    }
}
