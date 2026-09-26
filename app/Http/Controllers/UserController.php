<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of admin users.
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * Show the form for creating a new admin user.
     */
    public function create()
    {
        return Inertia::render('Users/Form', [
            'user' => null,
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created admin user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|alpha_dash|unique:users,username',
            'email' => 'nullable|email|max:255|unique:users,email',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $this->processAndStoreAvatar($request->file('avatar'));
        }

        User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'] ?: null,
            'avatar' => $avatarPath,
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('users.index')->with('success', 'Akun admin baru berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified admin user.
     */
    public function edit(User $user)
    {
        return Inertia::render('Users/Form', [
            'user' => $user,
            'isEdit' => true,
        ]);
    }

    /**
     * Update the specified admin user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('users')->ignore($user->id),
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'remove_avatar' => 'nullable|boolean',
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'] ?: null,
        ];

        if ($request->boolean('remove_avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $updateData['avatar'] = null;
        } elseif ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $updateData['avatar'] = $this->processAndStoreAvatar($request->file('avatar'));
        }

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->route('users.index')->with('success', 'Akun admin berhasil diperbarui.');
    }

    /**
     * Remove the specified admin user from storage.
     */
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->route('users.index')->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'Akun admin berhasil dihapus.');
    }

    /**
     * Convert and store uploaded avatar as WebP.
     */
    private function processAndStoreAvatar($file): ?string
    {
        if (!$file || !$file->isValid()) {
            return null;
        }

        $filename = 'avatar_' . uniqid() . '_' . time() . '.webp';
        $directory = storage_path('app/public/avatars');

        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }

        $destinationPath = $directory . '/' . $filename;

        try {
            $imageData = file_get_contents($file->getRealPath());
            $srcImage = @imagecreatefromstring($imageData);

            if ($srcImage !== false) {
                // Ensure truecolor image and preserve alpha transparency
                if (!imageistruecolor($srcImage)) {
                    $width = imagesx($srcImage);
                    $height = imagesy($srcImage);
                    $trueColor = imagecreatetruecolor($width, $height);
                    imagealphablending($trueColor, false);
                    imagesavealpha($trueColor, true);
                    imagecopy($trueColor, $srcImage, 0, 0, 0, 0, $width, $height);
                    imagedestroy($srcImage);
                    $srcImage = $trueColor;
                } else {
                    imagealphablending($srcImage, false);
                    imagesavealpha($srcImage, true);
                }

                imagewebp($srcImage, $destinationPath, 85);
                imagedestroy($srcImage);

                return 'avatars/' . $filename;
            }
        } catch (\Throwable $e) {
            // Fallback to default storage if GD fails
        }

        return $file->store('avatars', 'public');
    }
}
