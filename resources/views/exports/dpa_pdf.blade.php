<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #18181b; margin: 0; padding: 20px; line-height: 1.4; }
        .header { border-bottom: 2px solid #ea580c; padding-bottom: 12px; margin-bottom: 20px; display: table; width: 100%; }
        .header-content { display: table-cell; vertical-align: middle; }
        .logo-container { display: table-cell; vertical-align: middle; text-align: right; width: 90px; }
        .brand-badge { background-color: #ea580c; color: #fff; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
        h1 { margin: 0 0 5px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; text-transform: uppercase; }
        .meta { font-size: 10.5px; color: #64748b; }
        .meta strong { color: #0f172a; }
        
        .athlete-banner { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; display: table; width: 100%; }
        .athlete-col { display: table-cell; width: 25%; vertical-align: middle; }
        .athlete-col-label { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #94a3b8; }
        .athlete-col-val { font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 2px; }

        .note-section { margin-bottom: 20px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 10.5px; line-height: 1.5; color: #334155; background-color: #fff; page-break-inside: avoid; overflow: hidden; }
        .note-title { font-weight: bold; padding: 6px 12px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-size: 10px; background-color: #f1f5f9; color: #475569; }
        .note-content { padding: 10px 14px; margin: 0; }

        .section-title { font-size: 13px; font-weight: 800; color: #0f172a; margin: 25px 0 10px 0; padding-bottom: 4px; border-bottom: 1.5px solid #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; }
        
        /* Overall Profile */
        .overall-grid { display: table; width: 100%; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; overflow: hidden; }
        .overall-row { display: table-row; }
        .overall-col { display: table-cell; width: 33.33%; padding: 12px; border-right: 1px solid #e2e8f0; vertical-align: top; }
        .overall-col:last-child { border-right: none; }
        .overall-title { font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #f1f5f9; }
        .title-over { color: #e11d48; }
        .title-under { color: #059669; }
        .title-inj { color: #d97706; }

        .list-item { margin-bottom: 4px; padding-left: 10px; position: relative; color: #334155; font-size: 10.5px; line-height: 1.35; }
        .list-item:before { content: "•"; position: absolute; left: 0; color: #94a3b8; font-weight: bold; }
        .empty-text { font-size: 10px; color: #94a3b8; font-style: italic; }

        /* Specific Compensation */
        .comp-card { border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 20px; background: #fff; page-break-inside: avoid; overflow: hidden; }
        .comp-header { background: #f8fafc; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        .comp-category { font-size: 9px; font-weight: bold; color: #ea580c; text-transform: uppercase; margin-bottom: 2px; }
        .comp-name { font-size: 13px; font-weight: 800; color: #0f172a; margin: 0; }
        
        .comp-body { display: table; width: 100%; }
        .comp-left { display: table-cell; width: 34%; padding: 12px; border-right: 1px solid #e2e8f0; vertical-align: top; background: #fafafa; }
        .comp-right { display: table-cell; width: 66%; padding: 12px; vertical-align: top; }
        
        .comp-image-wrapper { margin-bottom: 10px; text-align: center; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px; background: #fff; }
        .comp-image { max-width: 100%; max-height: 140px; }
        
        .mini-title { font-size: 9.5px; font-weight: 800; color: #475569; text-transform: uppercase; margin: 10px 0 4px 0; }
        .mini-title:first-child { margin-top: 0; }
        
        .nasm-grid { display: table; width: 100%; margin-top: 6px; }
        .nasm-row { display: table-row; }
        .nasm-col { display: table-cell; width: 50%; padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; }
        
        .step-header { font-size: 9.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 3px; }
        .step-number { background: #ea580c; color: #fff; padding: 1px 4px; border-radius: 3px; margin-right: 4px; font-size: 8.5px; }
        
        .exercise-img { max-width: 100%; max-height: 80px; margin-top: 6px; border: 1px solid #e2e8f0; border-radius: 3px; display: block; }
        
        .footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>

    <div class="header">
        <div class="header-content">
            <div class="brand-badge">Dynamic Posture Assessment (DPA)</div>
            <h1>{{ $title ?? 'Laporan Asesmen Postur Dinamis' }}</h1>
            <div class="meta">
                Tanggal Evaluasi: <strong>{{ $latest ? date('d F Y', strtotime($latest['assessment_date'])) : '-' }}</strong> &nbsp;|&nbsp;
                Dicetak pada: {{ \Carbon\Carbon::now()->translatedFormat('d F Y, H:i') }}
            </div>
        </div>
        <div class="logo-container">
            {{-- Logo area --}}
        </div>
    </div>

    <div class="athlete-banner">
        <div class="athlete-col">
            <div class="athlete-col-label">Nama Atlet</div>
            <div class="athlete-col-val">{{ $athlete->full_name ?? 'N/A' }}</div>
        </div>
        <div class="athlete-col">
            <div class="athlete-col-label">Kode Atlet / Cabor</div>
            <div class="athlete-col-val">{{ $athlete->athlete_code ?? '-' }} &bull; {{ $athlete->sport_category ?? '-' }}</div>
        </div>
        <div class="athlete-col">
            <div class="athlete-col-label">Posisi / Spesialisasi</div>
            <div class="athlete-col-val">{{ $athlete->position_specialty ?? '-' }}</div>
        </div>
        <div class="athlete-col">
            <div class="athlete-col-label">Postur / BMI</div>
            <div class="athlete-col-val">
                {{ $athlete->height_cm ? $athlete->height_cm.' cm' : '-' }} / 
                {{ $athlete->weight_kg ? $athlete->weight_kg.' kg' : '-' }}
                @if($athlete->bmi) ({{ $athlete->bmi }}) @endif
            </div>
        </div>
    </div>

    @if($latest)
        @php
            $hasCompensations = false;
            if(isset($latest['details']) && count($latest['details']) > 0) {
                foreach($latest['details'] as $detail) {
                    if(isset($detail['compensation'])) {
                        $hasCompensations = true;
                        break;
                    }
                }
            }
        @endphp

        @if($hasCompensations)
            <div class="section-title">Ringkasan Ketidakseimbangan Otot (Overall Imbalance Profile)</div>
            <div class="overall-grid">
                <div class="overall-row">
                    <div class="overall-col">
                        <div class="overall-title title-over">Otot Overactive (Tegang / Dominan)</div>
                        @if(!empty($analysis['overactive']) && count($analysis['overactive']) > 0)
                            @foreach($analysis['overactive'] as $m)
                                <div class="list-item">{{ $m }}</div>
                            @endforeach
                        @else
                            <div class="empty-text">Tidak ada temuan overactive</div>
                        @endif
                    </div>
                    <div class="overall-col">
                        <div class="overall-title title-under">Otot Underactive (Lemah / Terhambat)</div>
                        @if(!empty($analysis['underactive']) && count($analysis['underactive']) > 0)
                            @foreach($analysis['underactive'] as $m)
                                <div class="list-item">{{ $m }}</div>
                            @endforeach
                        @else
                            <div class="empty-text">Tidak ada temuan underactive</div>
                        @endif
                    </div>
                    <div class="overall-col">
                        <div class="overall-title title-inj">Potensi Risiko Cedera (Injury Risk)</div>
                        @if(!empty($analysis['injuries']) && count($analysis['injuries']) > 0)
                            @foreach($analysis['injuries'] as $m)
                                <div class="list-item">{{ $m }}</div>
                            @endforeach
                        @else
                            <div class="empty-text">Tidak ada potensi risiko cedera terdeteksi</div>
                        @endif
                    </div>
                </div>
            </div>

            @php $firstComp = true; @endphp
            @foreach($latest['details'] as $detail)
                @if(isset($detail['compensation']))
                    @php 
                        $c = $detail['compensation']; 
                        
                        $split = function($str) {
                            if(!$str) return [];
                            return array_filter(array_map('trim', preg_split('/[\n,]/', $str)));
                        };
                        
                        $over = $split($c['overactive_muscles'] ?? '');
                        $under = $split($c['underactive_muscles'] ?? '');
                        $inj = $split($c['possible_injuries'] ?? '');
                        $smr = $split($c['exercises_smr'] ?? '');
                        $str = $split($c['exercises_stretching'] ?? '');
                        $iso = $split($c['exercises_isometrics'] ?? '');
                        $int = $split($c['exercises_integrated'] ?? '');
                    @endphp
                    
                    <div style="page-break-before: always;"></div>
                    @if($firstComp)
                        <div class="section-title" style="margin-top: 0;">Rincian Kompensasi Postur &amp; Protokol Latihan Korektif</div>
                        @php $firstComp = false; @endphp
                    @endif
                    
                    <div class="comp-card">
                        <div class="comp-header">
                            <div class="comp-category">{{ $c['category'] ?? 'Pandangan' }}</div>
                            <h3 class="comp-name">{{ $c['name'] ?? 'Kompensasi' }}</h3>
                        </div>
                        <div class="comp-body">
                            <div class="comp-left">
                                @if(!empty($c['image_path']) && file_exists(storage_path('app/public/'.$c['image_path'])))
                                    <div class="comp-image-wrapper">
                                        <img src="{{ storage_path('app/public/'.$c['image_path']) }}" class="comp-image">
                                    </div>
                                @endif
                                
                                <div class="mini-title" style="color: #e11d48;">Otot Overactive</div>
                                @foreach($over as $m) <div class="list-item">{{ ltrim($m, '-') }}</div> @endforeach
                                @if(count($over) == 0) <span class="empty-text">-</span> @endif
                                
                                <div class="mini-title" style="color: #059669;">Otot Underactive</div>
                                @foreach($under as $m) <div class="list-item">{{ ltrim($m, '-') }}</div> @endforeach
                                @if(count($under) == 0) <span class="empty-text">-</span> @endif
                                
                                <div class="mini-title" style="color: #d97706;">Potensi Risiko Cedera</div>
                                @foreach($inj as $m) <div class="list-item">{{ ltrim($m, '-') }}</div> @endforeach
                                @if(count($inj) == 0) <span class="empty-text">-</span> @endif
                            </div>
                            <div class="comp-right">
                                <div class="mini-title" style="font-size:11px; margin-bottom:8px; color:#ea580c;">Protokol Latihan Korektif (4-Fase NASM)</div>
                                
                                <div class="nasm-grid">
                                    <div class="nasm-row">
                                        <div class="nasm-col" style="border-right: none; border-bottom: none;">
                                            <div class="step-header"><span class="step-number">1</span> Inhibit (SMR)</div>
                                            @foreach($smr as $m) <div class="list-item">{{ ltrim($m, '-') }}</div> @endforeach
                                            @if(!empty($c['image_smr']) && file_exists(storage_path('app/public/'.$c['image_smr'])))
                                                <img src="{{ storage_path('app/public/'.$c['image_smr']) }}" class="exercise-img">
                                            @endif
                                        </div>
                                        <div class="nasm-col" style="border-bottom: none;">
                                            <div class="step-header"><span class="step-number">2</span> Lengthen (Stretch)</div>
                                            @foreach($str as $m) <div class="list-item">{{ ltrim($m, '-') }}</div> @endforeach
                                            @if(!empty($c['image_stretching']) && file_exists(storage_path('app/public/'.$c['image_stretching'])))
                                                <img src="{{ storage_path('app/public/'.$c['image_stretching']) }}" class="exercise-img">
                                            @endif
                                        </div>
                                    </div>
                                    <div class="nasm-row">
                                        <div class="nasm-col" style="border-right: none;">
                                            <div class="step-header"><span class="step-number">3</span> Activate (Isometrik)</div>
                                            @foreach($iso as $m) <div class="list-item">{{ ltrim($m, '-') }}</div> @endforeach
                                            @if(!empty($c['image_isometrics']) && file_exists(storage_path('app/public/'.$c['image_isometrics'])))
                                                <img src="{{ storage_path('app/public/'.$c['image_isometrics']) }}" class="exercise-img">
                                            @endif
                                        </div>
                                        <div class="nasm-col">
                                            <div class="step-header"><span class="step-number">4</span> Integrate (Fungsional)</div>
                                            @foreach($int as $m) <div class="list-item">{{ ltrim($m, '-') }}</div> @endforeach
                                            @if(!empty($c['image_integrated']) && file_exists(storage_path('app/public/'.$c['image_integrated'])))
                                                <img src="{{ storage_path('app/public/'.$c['image_integrated']) }}" class="exercise-img">
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                @endif
            @endforeach
        @else
            <div style="text-align:center; padding:30px; border:1px dashed #cbd5e1; border-radius:6px; margin:20px 0;">
                <h4 style="margin:0; font-size:13px; color:#0f172a;">Tidak Ada Kompensasi Postur Terdeteksi</h4>
                <p style="margin:5px 0 0 0; color:#64748b; font-size:11px;">Mekanika gerak dan keselarasan postur dinamis atlet dalam kondisi optimal.</p>
            </div>
        @endif
    @endif

    @if(!empty($note))
    <div class="note-section" style="margin-top: 20px;">
        <div class="note-title">Catatan Klinis &amp; Rekomendasi Pelatih</div>
        <div class="note-content">
            {!! nl2br(e($note)) !!}
        </div>
    </div>
    @endif

    <div class="footer">
        DPA Posture Analysis Platform &mdash; Laporan dibuat secara otomatis pada {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}
    </div>

</body>
</html>
