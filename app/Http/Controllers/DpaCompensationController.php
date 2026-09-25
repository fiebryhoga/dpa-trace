<?php

namespace App\Http\Controllers;

use App\Models\DpaCompensation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DpaCompensationController extends Controller
{
    /**
     * Display a listing of compensations.
     */
    public function index()
    {
        $compensations = DpaCompensation::orderBy('category')->orderBy('name')->get();

        return Inertia::render('Dpa/Compensations/Index', [
            'compensations' => $compensations,
        ]);
    }

    /**
     * Show the form for creating a new compensation.
     */
    public function create()
    {
        return Inertia::render('Dpa/Compensations/Form', [
            'compensation' => null,
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created compensation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:Posterior View,Lateral View,Anterior View,Single Leg',
            'name' => 'required|string|max:255',
            'checkpoint' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:5120',
            'overactive_muscles' => 'nullable|string',
            'underactive_muscles' => 'nullable|string',
            'possible_injuries' => 'nullable|string',
            'exercises_smr' => 'nullable|string',
            'exercises_stretching' => 'nullable|string',
            'exercises_isometrics' => 'nullable|string',
            'exercises_integrated' => 'nullable|string',
            'image_smr' => 'nullable|image|max:5120',
            'image_stretching' => 'nullable|image|max:5120',
            'image_isometrics' => 'nullable|image|max:5120',
            'image_integrated' => 'nullable|image|max:5120',
        ]);

        $imageFields = ['image', 'image_smr', 'image_stretching', 'image_isometrics', 'image_integrated'];
        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                $pathKey = $field === 'image' ? 'image_path' : $field;
                $validated[$pathKey] = $request->file($field)->store('dpa_images', 'public');
            }
        }

        DpaCompensation::create($validated);

        return redirect()->route('dpa-compensations.index')
            ->with('success', 'Master data kompensasi DPA berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified compensation.
     */
    public function edit(DpaCompensation $dpaCompensation)
    {
        return Inertia::render('Dpa/Compensations/Form', [
            'compensation' => $dpaCompensation,
            'isEdit' => true,
        ]);
    }

    /**
     * Update the specified compensation.
     */
    public function update(Request $request, DpaCompensation $dpaCompensation)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:Posterior View,Lateral View,Anterior View,Single Leg',
            'name' => 'required|string|max:255',
            'checkpoint' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:5120',
            'overactive_muscles' => 'nullable|string',
            'underactive_muscles' => 'nullable|string',
            'possible_injuries' => 'nullable|string',
            'exercises_smr' => 'nullable|string',
            'exercises_stretching' => 'nullable|string',
            'exercises_isometrics' => 'nullable|string',
            'exercises_integrated' => 'nullable|string',
            'image_smr' => 'nullable|image|max:5120',
            'image_stretching' => 'nullable|image|max:5120',
            'image_isometrics' => 'nullable|image|max:5120',
            'image_integrated' => 'nullable|image|max:5120',
        ]);

        $imageFields = ['image', 'image_smr', 'image_stretching', 'image_isometrics', 'image_integrated'];
        foreach ($imageFields as $field) {
            $pathKey = $field === 'image' ? 'image_path' : $field;

            if ($request->boolean("remove_{$field}")) {
                if ($dpaCompensation->{$pathKey}) {
                    Storage::disk('public')->delete($dpaCompensation->{$pathKey});
                }
                $validated[$pathKey] = null;
            } elseif ($request->hasFile($field)) {
                if ($dpaCompensation->{$pathKey}) {
                    Storage::disk('public')->delete($dpaCompensation->{$pathKey});
                }
                $validated[$pathKey] = $request->file($field)->store('dpa_images', 'public');
            } else {
                unset($validated[$pathKey]);
            }
        }

        $dpaCompensation->update($validated);

        return redirect()->route('dpa-compensations.index')
            ->with('success', 'Master data kompensasi DPA berhasil diperbarui.');
    }

    /**
     * Remove the specified compensation.
     */
    public function destroy(DpaCompensation $dpaCompensation)
    {
        $imageFields = ['image_path', 'image_smr', 'image_stretching', 'image_isometrics', 'image_integrated'];
        foreach ($imageFields as $field) {
            if ($dpaCompensation->{$field}) {
                Storage::disk('public')->delete($dpaCompensation->{$field});
            }
        }

        $dpaCompensation->delete();

        return redirect()->back()
            ->with('success', 'Master data kompensasi DPA berhasil dihapus.');
    }
}
