// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { 
    ImagePlus, 
    X, 
    Save, 
    Trash2, 
    Camera, 
    Info, 
    Plus, 
    Maximize2, 
    Download, 
    Edit3, 
    CalendarDays, 
    Upload, 
    RotateCcw,
    CheckCircle2,
    Pencil,
    ChevronLeft,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { AthleteGallery as AthleteGalleryType } from '@/types';

interface AthleteGalleryProps {
    athlete: any;
    galleries?: any[];
    title?: string;
    subtitle?: string;
    canManage?: boolean;
    className?: string;
}

export default function AthleteGallery({ 
    athlete, 
    galleries = [], 
    title = "Galeri & Dokumentasi Postur", 
    subtitle = "Dokumentasi foto postur, analisis sudut gerak, dan observasi klinis atlet.",
    canManage = true,
    className = ""
}: AthleteGalleryProps) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [viewer, setViewer] = useState({ isOpen: false, photo: null });
    const [editModal, setEditModal] = useState({ isOpen: false, photo: null });
    const [editPreview, setEditPreview] = useState(null);
    
    // State Form Upload
    const { 
        data: uploadData, 
        setData: setUploadData, 
        post: postUpload, 
        processing: uploadProcessing, 
        reset: resetUpload, 
        errors: uploadErrors 
    } = useForm({
        photos: [] 
    });

    // State Form Edit
    const editForm = useForm({
        notes: '',
        created_at: '',
        image: null,
    });

    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);

    // Kunci Scroll Body saat Modal Apapun Terbuka
    useEffect(() => {
        if (isUploadModalOpen || viewer.isOpen || editModal.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isUploadModalOpen, viewer.isOpen, editModal.isOpen]);

    // Keyboard Navigation untuk Viewer Modal
    useEffect(() => {
        if (!viewer.isOpen || galleries.length === 0) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setViewer({ isOpen: false, photo: null });
            } else if (e.key === 'ArrowRight') {
                const currentIdx = galleries.findIndex(g => g.id === viewer.photo?.id);
                if (currentIdx !== -1) {
                    const nextIdx = (currentIdx + 1) % galleries.length;
                    setViewer({ isOpen: true, photo: galleries[nextIdx] });
                }
            } else if (e.key === 'ArrowLeft') {
                const currentIdx = galleries.findIndex(g => g.id === viewer.photo?.id);
                if (currentIdx !== -1) {
                    const prevIdx = (currentIdx - 1 + galleries.length) % galleries.length;
                    setViewer({ isOpen: true, photo: galleries[prevIdx] });
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewer.isOpen, viewer.photo, galleries]);

    // Cleanup object URL preview edit
    useEffect(() => {
        return () => {
            if (editPreview) URL.revokeObjectURL(editPreview);
        };
    }, [editPreview]);

    // Format Tanggal Indonesia Singkat (contoh: 27 Jul 2026)
    const formatDateShort = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    // Format Tanggal Indonesia Lengkap (contoh: Senin, 27 Juli 2026)
    const formatDateIndo = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    // Safe photo URL resolver
    const getPhotoUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
            return path;
        }
        if (path.startsWith('/storage/')) return path;
        if (path.startsWith('storage/')) return `/${path}`;
        if (path.startsWith('/')) return path;
        return `/storage/${path}`;
    };

    // Download Foto
    const handleDownload = (url, filename) => {
        const fullUrl = getPhotoUrl(url);
        fetch(fullUrl)
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = filename || `posture-assessment-${Date.now()}.jpg`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(err => console.error('Download error:', err));
    };

    // ==========================================
    // HANDLER UPLOAD BARU
    // ==========================================
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const newPhotos = files.map(file => ({
            file: file, 
            preview: URL.createObjectURL(file), 
            notes: '',
            created_at: todayStr,
        }));

        setUploadData('photos', [...uploadData.photos, ...newPhotos]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removePhoto = (index) => {
        const updatedPhotos = [...uploadData.photos];
        URL.revokeObjectURL(updatedPhotos[index].preview); 
        updatedPhotos.splice(index, 1);
        setUploadData('photos', updatedPhotos);
    };

    const submitUpload = (e) => {
        e.preventDefault();
        postUpload(route('athletes.gallery.store', athlete.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsUploadModalOpen(false);
                resetUpload();
            }
        });
    };

    const closeUploadModal = () => {
        setIsUploadModalOpen(false);
        uploadData.photos.forEach(p => URL.revokeObjectURL(p.preview));
        resetUpload();
    };

    // ==========================================
    // HANDLER EDIT & HAPUS FOTO
    // ==========================================
    const openEdit = (photo) => {
        if (editPreview) URL.revokeObjectURL(editPreview);
        setEditPreview(null);
        editForm.setData({
            notes: photo.notes || '',
            created_at: photo.created_at ? photo.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            image: null,
        });
        setEditModal({ isOpen: true, photo });
    };

    const closeEdit = () => {
        if (editPreview) URL.revokeObjectURL(editPreview);
        setEditPreview(null);
        setEditModal({ isOpen: false, photo: null });
        editForm.reset();
        if (editFileInputRef.current) editFileInputRef.current.value = '';
    };

    const handleEditFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (editPreview) URL.revokeObjectURL(editPreview);
        setEditPreview(URL.createObjectURL(file));
        editForm.setData('image', file);
    };

    const cancelReplacementImage = () => {
        if (editPreview) URL.revokeObjectURL(editPreview);
        setEditPreview(null);
        editForm.setData('image', null);
        if (editFileInputRef.current) editFileInputRef.current.value = '';
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.post(route('athletes.gallery.update', editModal.photo.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => closeEdit()
        });
    };

    const deleteGallery = (id) => {
        if (confirm("Hapus foto postur / biometrik ini secara permanen?")) {
            router.delete(route('athletes.gallery.destroy', id), { 
                preserveScroll: true,
                onSuccess: () => {
                    setViewer({ isOpen: false, photo: null });
                }
            });
        }
    };

    return (
        <div className={`bg-white dark:bg-[#0D1322] rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden w-full ${className}`}>
            
            {/* HEADER GALERI */}
            <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center gap-3">
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight flex items-center gap-2">
                        <span>{title}</span>
                        {galleries.length > 0 && (
                            <span className="text-[10px] font-bold bg-[#84cc16]/15 dark:bg-[#b4f031]/15 text-[#84cc16] dark:text-[#b4f031] px-2 py-0.5 rounded border border-[#84cc16]/30">
                                {galleries.length} Foto Tes
                            </span>
                        )}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* GRID GALERI */}
            <div className="p-4 bg-white dark:bg-[#0D1322]">
                {galleries.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950/20 p-6 space-y-2">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-2xs">
                            <Camera className="w-6 h-6" />
                        </div>
                        <h4 className="text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm">Belum Ada Riwayat Foto Hasil Tes</h4>
                        <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
                            Foto hasil asesmen (Anterior, Lateral, Posterior, Single Leg) akan otomatis tercatat dan tersimpan di sini saat Anda mengunggah foto pada <strong>Smart Posture Scanner</strong> di tab <strong>Input Evaluasi</strong>.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
                        {galleries.map((item) => (
                            <div 
                                key={item.id} 
                                className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg overflow-hidden shadow-2xs hover:border-[#84cc16] dark:hover:border-[#b4f031] hover:shadow-xs transition-all group"
                            >
                                {/* Area Gambar */}
                                <div 
                                    className="aspect-square bg-slate-100 dark:bg-slate-950 relative overflow-hidden cursor-pointer" 
                                    onClick={() => setViewer({ isOpen: true, photo: item })}
                                >
                                    <img 
                                        src={getPhotoUrl(item.image_path)} 
                                        alt="Postur DPA" 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        loading="lazy" 
                                    />
                                    
                                    {/* Overlay Tanggal Singkat (Pojok Kiri Atas) */}
                                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs tracking-wide">
                                        {formatDateShort(item.created_at)}
                                    </div>

                                    {/* Overlay View Category Badge (Pojok Kanan Atas) */}
                                    {item.meta?.view_category && (
                                        <div className="absolute top-2 right-2 bg-[#84cc16] text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                                            {item.meta.view_category.replace(' View', '')}
                                        </div>
                                    )}
                                    
                                    {/* Hover Indicator Icon */}
                                    <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <div className="p-2 bg-white/95 rounded-lg text-slate-800 shadow-md scale-75 group-hover:scale-100 transition-transform">
                                            <Maximize2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Area Catatan Analisis */}
                                {item.notes && (
                                    <div 
                                        className="p-2.5 bg-slate-50/70 dark:bg-slate-950/60 flex-1 border-t border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-colors" 
                                        onClick={() => setViewer({ isOpen: true, photo: item })}
                                    >
                                        <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                                            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#84cc16] dark:text-[#b4f031]" />
                                            <p className="text-[10.5px] italic text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                                                "{item.notes}"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Toolbar Aksi Bawah */}
                                <div className="p-1.5 bg-white dark:bg-slate-900 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                                    <button 
                                        type="button"
                                        onClick={() => setViewer({ isOpen: true, photo: item })} 
                                        title="Lihat Penuh" 
                                        className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors cursor-pointer touch-manipulation"
                                    >
                                        <Maximize2 className="w-3.5 h-3.5"/>
                                    </button>
                                    


                                    <button 
                                        type="button"
                                        onClick={() => handleDownload(item.image_path, `dpa-${athlete.name || 'athlete'}-${item.id}.jpg`)} 
                                        title="Download Foto" 
                                        className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors cursor-pointer touch-manipulation"
                                    >
                                        <Download className="w-3.5 h-3.5"/>
                                    </button>
                                    
                                    {canManage && (
                                        <>
                                            <button 
                                                type="button"
                                                onClick={() => openEdit(item)} 
                                                title="Edit Foto & Catatan" 
                                                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors cursor-pointer touch-manipulation"
                                            >
                                                <Edit3 className="w-3.5 h-3.5"/>
                                            </button>
                                            
                                            <button 
                                                type="button"
                                                onClick={() => deleteGallery(item.id)} 
                                                title="Hapus Foto" 
                                                className="p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer touch-manipulation"
                                            >
                                                <Trash2 className="w-3.5 h-3.5"/>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* =========================================
                MODAL 1: VIEWER / LIGHTBOX FOTO (STUDIO INSPECTOR SHADCN THEME)
            ========================================= */}
            {viewer.isOpen && viewer.photo && (() => {
                const curPhoto = viewer.photo;
                const activeIdx = galleries.findIndex(g => g.id === curPhoto.id);
                const hasMultiple = galleries.length > 1;

                return (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200" 
                            onClick={() => setViewer({ isOpen: false, photo: null })}
                        />
                        
                        {/* Modal Box */}
                        <div className="relative z-10 w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
                            
                            {/* Mobile Top Bar */}
                            <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                        Foto Postur #{activeIdx !== -1 ? activeIdx + 1 : 1}
                                    </span>
                                    {hasMultiple && (
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-md">
                                            {activeIdx + 1} / {galleries.length}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewer({ isOpen: false, photo: null })}
                                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Left Visual Area (Subtle Canvas) */}
                            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-hidden min-h-[320px] md:min-h-[500px]">
                                <div 
                                    className="flex-1 relative flex items-center justify-center p-4 md:p-6 overflow-hidden"
                                    style={{
                                        backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                                        backgroundSize: "20px 20px"
                                    }}
                                >
                                    <img 
                                        src={getPhotoUrl(curPhoto.image_path)} 
                                        alt="Detail Postur" 
                                        className="max-w-full max-h-[55vh] md:max-h-[66vh] object-contain rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300" 
                                    />

                                    {/* Navigation Arrows */}
                                    {hasMultiple && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const prevIdx = (activeIdx - 1 + galleries.length) % galleries.length;
                                                    setViewer({ isOpen: true, photo: galleries[prevIdx] });
                                                }}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-md bg-white/90 dark:bg-slate-800/90 hover:bg-[#84cc16] hover:text-slate-950 dark:hover:bg-[#b4f031] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-xs transition-all hover:scale-105 cursor-pointer"
                                                title="Foto Sebelumnya (Panah Kiri)"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const nextIdx = (activeIdx + 1) % galleries.length;
                                                    setViewer({ isOpen: true, photo: galleries[nextIdx] });
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md bg-white/90 dark:bg-slate-800/90 hover:bg-[#84cc16] hover:text-slate-950 dark:hover:bg-[#b4f031] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-xs transition-all hover:scale-105 cursor-pointer"
                                                title="Foto Berikutnya (Panah Kanan)"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Bottom Thumbnail Strip */}
                                {hasMultiple && (
                                    <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
                                        {galleries.map((thumb, idx) => (
                                            <button
                                                key={thumb.id || idx}
                                                type="button"
                                                onClick={() => setViewer({ isOpen: true, photo: thumb })}
                                                className={`relative shrink-0 w-12 h-14 rounded-md overflow-hidden border transition-all cursor-pointer ${
                                                    thumb.id === curPhoto.id 
                                                        ? "border-[#84cc16] dark:border-[#b4f031] ring-2 ring-[#84cc16]/40 dark:ring-[#b4f031]/40 shadow-xs scale-105" 
                                                        : "border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-400 dark:hover:border-slate-500"
                                                }`}
                                            >
                                                <img 
                                                    src={getPhotoUrl(thumb.image_path)} 
                                                    alt="" 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[7.5px] font-bold text-center text-white py-0.5">
                                                    #{idx + 1}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Inspector Panel */}
                            <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between overflow-y-auto space-y-4">
                                
                                {/* Header Panel */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                        <div>
                                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                                Foto Postur #{activeIdx !== -1 ? activeIdx + 1 : 1}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                <CalendarDays size={12} className="text-[#84cc16] dark:text-[#b4f031]" />
                                                <span>
                                                    {formatDateIndo(curPhoto.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setViewer({ isOpen: false, photo: null })}
                                            className="hidden md:flex p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                                            title="Tutup (Esc)"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Catatan Observasi Klinis */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                            <Info size={12} className="text-[#84cc16] dark:text-[#b4f031]" />
                                            <span>Observasi &amp; Catatan Klinis</span>
                                        </label>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-md min-h-[70px] max-h-[18vh] overflow-y-auto custom-scrollbar">
                                            {curPhoto.notes ? (
                                                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed whitespace-pre-line">
                                                    "{curPhoto.notes}"
                                                </p>
                                            ) : (
                                                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                                                    Tidak ada catatan observasi klinis khusus untuk foto ini.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ringkasan Atlet & Status */}
                                    <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-md space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-400">Atlet</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{athlete?.name || '-'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-400">Modul Analisis</span>
                                            <span className="font-semibold text-[#84cc16] dark:text-[#b4f031]">Dynamic Posture (DPA)</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-400">Status Anotasi</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                {curPhoto.annotations ? "Sudah Diukur / Dianotasi" : "Belum Ada Anotasi"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-slate-800">


                                    <button
                                        type="button"
                                        onClick={() => handleDownload(curPhoto.image_path, `dpa-${athlete?.name || 'athlete'}-${curPhoto.id}.jpg`)}
                                        className="w-full py-2 px-4 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                                    >
                                        <Download size={13} />
                                        <span>Download Foto HD</span>
                                    </button>

                                    {canManage && (
                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentPhoto = curPhoto;
                                                    setViewer({ isOpen: false, photo: null });
                                                    openEdit(currentPhoto);
                                                }}
                                                className="flex-1 py-2 px-3 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                <Edit3 size={12} />
                                                <span>Edit Catatan</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => deleteGallery(curPhoto.id)}
                                                className="px-3 py-2 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
                                                title="Hapus Foto"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* =========================================
                MODAL 2: EDIT FOTO & CATATAN (DENGAN GANTI GAMBAR)
            ========================================= */}
            {editModal.isOpen && editModal.photo && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200" 
                        onClick={closeEdit}
                    />
                    
                    {/* Modal Box */}
                    <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-900/50">
                            <div>
                                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-[#84cc16] dark:text-[#b4f031]" />
                                    <span>Edit Foto &amp; Catatan Postur</span>
                                </h3>
                                <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">
                                    Perbarui gambar beranotasi, tanggal tes, atau catatan klinis.
                                </p>
                            </div>
                            <button 
                                type="button"
                                onClick={closeEdit} 
                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={submitEdit} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                            {/* Area Preview Foto Sekarang / Baru */}
                            <div>
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">
                                    Gambar Postur DPA
                                </label>
                                
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 rounded-lg space-y-2">
                                    <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center relative">
                                        <img 
                                            src={editPreview || getPhotoUrl(editModal.photo.image_path)} 
                                            alt="Preview" 
                                            className="max-h-full max-w-full object-contain" 
                                        />
                                        {editPreview && (
                                            <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                                                <CheckCircle2 size={11} />
                                                <span>File Baru Dipilih</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons for Image File */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => editFileInputRef.current?.click()}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#84cc16] text-slate-700 dark:text-slate-200 hover:text-[#84cc16] dark:hover:text-[#b4f031] rounded-md text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                                        >
                                            <Camera size={13.5} />
                                            <span>{editPreview ? 'Pilih File Lain' : 'Ganti / Upload Gambar Baru'}</span>
                                        </button>

                                        {editPreview && (
                                            <button
                                                type="button"
                                                onClick={cancelReplacementImage}
                                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                                                title="Batalkan ganti gambar"
                                            >
                                                <RotateCcw size={12} />
                                                <span>Batal</span>
                                            </button>
                                        )}
                                    </div>

                                    <input 
                                        type="file" 
                                        ref={editFileInputRef} 
                                        onChange={handleEditFileSelect} 
                                        accept="image/jpeg, image/png, image/webp" 
                                        className="hidden" 
                                    />
                                    <p className="text-[10px] text-slate-400">
                                        Format JPG, PNG, atau WebP (maks. 10MB). Unggah versi yang sudah diberi garis anotasi / sudut derajat jika tersedia.
                                    </p>
                                </div>
                            </div>

                            {/* Tanggal Foto */}
                            <div>
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">
                                    Tanggal Pengambilan / Evaluasi
                                </label>
                                <input 
                                    type="date"
                                    value={editForm.data.created_at}
                                    onChange={(e) => editForm.setData('created_at', e.target.value)}
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#84cc16] focus:ring-1 focus:ring-[#84cc16] outline-none transition-all font-medium"
                                />
                            </div>

                            {/* Catatan Analisis */}
                            <div>
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">
                                    Catatan Analisis &amp; Temuan Klinis Postur
                                </label>
                                <textarea 
                                    rows="4" 
                                    value={editForm.data.notes}
                                    onChange={(e) => editForm.setData('notes', e.target.value)}
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#84cc16] focus:ring-1 focus:ring-[#84cc16] outline-none transition-all resize-none leading-relaxed"
                                    placeholder="Contoh: Overhead Squat Anterior: pronasi kaki bilateral disertai dynamic knee valgus derajat 115°..."
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                                <button 
                                    type="button" 
                                    onClick={closeEdit} 
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={editForm.processing} 
                                    className="px-5 py-2 bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#84cc16] text-slate-950 font-bold text-xs rounded-md flex items-center gap-1.5 shadow-2xs disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    {editForm.processing ? (
                                        <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-3.5 h-3.5"/>
                                    )}
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL 3: UPLOAD FOTO BARU (MULTI-UPLOAD & DATE)
            ========================================= */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200" 
                        onClick={closeUploadModal}
                    />
                    
                    {/* Box Modal */}
                    <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-900/50 shrink-0">
                            <div>
                                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                    <ImagePlus className="w-4 h-4 text-[#84cc16] dark:text-[#b4f031]" />
                                    <span>Upload Foto Postur DPA</span>
                                </h3>
                                <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">
                                    Pilih foto postur atlet (Overhead Squat, Single Leg, dll) dan sertakan analisis.
                                </p>
                            </div>
                            <button 
                                type="button"
                                onClick={closeUploadModal} 
                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
                            {uploadData.photos.length === 0 && (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-44 sm:h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#84cc16] dark:hover:border-[#b4f031] bg-slate-50/70 dark:bg-slate-950/40 hover:bg-[#84cc16]/5 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group p-4 text-center"
                                >
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-2xs group-hover:scale-110 transition-transform mb-2.5 text-slate-400 group-hover:text-[#84cc16] dark:group-hover:text-[#b4f031] border border-slate-200 dark:border-slate-700">
                                        <ImagePlus className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#84cc16] dark:group-hover:text-[#b4f031]">
                                        Pilih Foto Postur dari Komputer
                                    </p>
                                    <p className="text-[10.5px] text-slate-400 mt-1">
                                        Bisa memilih beberapa foto sekaligus (JPG, PNG, WebP hingga 10MB)
                                    </p>
                                </div>
                            )}

                            {uploadData.photos.length > 0 && (
                                <div className="space-y-3">
                                    {uploadData.photos.map((photo, index) => (
                                        <div 
                                            key={index} 
                                            className="flex flex-col sm:flex-row gap-3 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-lg relative group"
                                        >
                                            {/* Preview */}
                                            <div className="w-full sm:w-28 h-36 sm:h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shrink-0 flex items-center justify-center">
                                                <img 
                                                    src={photo.preview} 
                                                    alt="preview" 
                                                    className="w-full h-full object-contain" 
                                                />
                                            </div>
                                            
                                            {/* Fields */}
                                            <div className="flex-1 flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                                                            Tanggal Foto
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={photo.created_at}
                                                            onChange={(e) => {
                                                                const updated = [...uploadData.photos];
                                                                updated[index].created_at = e.target.value;
                                                                setUploadData('photos', updated);
                                                            }}
                                                            className="w-full rounded-md border border-slate-200 dark:border-slate-700 text-xs p-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                                                        Catatan Analisis Postur (Opsional)
                                                    </label>
                                                    <textarea 
                                                        rows="2" 
                                                        value={photo.notes}
                                                        onChange={(e) => {
                                                            const updated = [...uploadData.photos];
                                                            updated[index].notes = e.target.value;
                                                            setUploadData('photos', updated);
                                                        }}
                                                        placeholder="Cth: Overhead squat lateral: excessive forward lean..."
                                                        className="w-full rounded-md border border-slate-200 dark:border-slate-700 text-xs p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none outline-none focus:border-[#84cc16]"
                                                    />
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button 
                                                type="button" 
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md cursor-pointer"
                                                title="Hapus foto ini"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-[#84cc16] dark:hover:text-[#b4f031] hover:border-[#84cc16] dark:hover:border-[#b4f031] hover:bg-[#84cc16]/5 font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" /> 
                                        <span>Tambah Foto Lainnya</span>
                                    </button>
                                </div>
                            )}

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} 
                                accept="image/jpeg, image/png, image/webp" 
                                multiple 
                                className="hidden" 
                            />
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex justify-end gap-2.5">
                            <button 
                                type="button" 
                                onClick={closeUploadModal} 
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button 
                                type="button" 
                                onClick={submitUpload}
                                disabled={uploadProcessing || uploadData.photos.length === 0}
                                className="px-5 py-2 bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#84cc16] text-slate-950 font-bold text-xs rounded-md shadow-2xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                {uploadProcessing ? (
                                    <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-3.5 h-3.5" />
                                )}
                                <span>Upload {uploadData.photos.length > 0 ? `${uploadData.photos.length} Foto` : ''}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}