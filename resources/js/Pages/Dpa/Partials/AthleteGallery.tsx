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
import PostureImageEditorModal from './PostureImageEditorModal';

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
    const [editorState, setEditorState] = useState({ isOpen: false, photo: null });
    
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
        if (isUploadModalOpen || viewer.isOpen || editModal.isOpen || editorState.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isUploadModalOpen, viewer.isOpen, editModal.isOpen, editorState.isOpen]);

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
        <div className={`bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden w-full ${className}`}>
            
            {/* HEADER GALERI */}
            <div className="px-4 py-3 bg-gradient-to-r from-white via-orange-50/40 to-white border-b border-slate-200/80 flex justify-between items-center gap-3">
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight flex items-center gap-2">
                        <span>{title}</span>
                        {galleries.length > 0 && (
                            <span className="text-[10px] font-extrabold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg border border-orange-200">
                                {galleries.length} Foto
                            </span>
                        )}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                        {subtitle}
                    </p>
                </div>
                {canManage && (
                    <button 
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)} 
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all touch-manipulation whitespace-nowrap cursor-pointer shrink-0"
                    >
                        <ImagePlus className="w-3.5 h-3.5" /> 
                        <span>Tambah Foto</span>
                    </button>
                )}
            </div>

            {/* GRID GALERI */}
            <div className="p-4 bg-white">
                {galleries.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-lg bg-gradient-to-br from-white via-white to-orange-50/30 p-4">
                        <div className="w-12 h-12 rounded-lg bg-orange-50 border border-orange-200 text-orange-500 flex items-center justify-center mb-2.5 shadow-2xs">
                            <Camera className="w-6 h-6" />
                        </div>
                        <h4 className="text-slate-800 font-bold text-xs sm:text-sm">Belum Ada Dokumentasi Postur</h4>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                            Unggah foto evaluasi Dynamic Posture Assessment (Overhead Squat, Single Leg Squat, dll) beserta analisis sudut dan catatan klinis di sini.
                        </p>
                        {canManage && (
                            <button
                                type="button"
                                onClick={() => setIsUploadModalOpen(true)}
                                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                                <Plus size={13} />
                                <span>Upload Foto Pertama</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3.5">
                        {galleries.map((item) => (
                            <div 
                                key={item.id} 
                                className="flex flex-col bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all group"
                            >
                                {/* Area Gambar */}
                                <div 
                                    className="aspect-square bg-slate-100 relative overflow-hidden cursor-pointer" 
                                    onClick={() => setViewer({ isOpen: true, photo: item })}
                                >
                                    <img 
                                        src={getPhotoUrl(item.image_path)} 
                                        alt="Postur DPA" 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        loading="lazy" 
                                    />
                                    
                                    {/* Overlay Tanggal Singkat (Pojok Kiri Atas) */}
                                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-xs tracking-wide">
                                        {formatDateShort(item.created_at)}
                                    </div>
                                    
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
                                        className="p-2.5 bg-slate-50/60 flex-1 border-t border-slate-100 cursor-pointer hover:bg-orange-50/20 transition-colors" 
                                        onClick={() => setViewer({ isOpen: true, photo: item })}
                                    >
                                        <div className="flex items-start gap-1.5 text-slate-600">
                                            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-orange-500" />
                                            <p className="text-[10.5px] italic text-slate-700 leading-relaxed line-clamp-2">
                                                "{item.notes}"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Toolbar Aksi Bawah */}
                                <div className="p-1.5 bg-white flex justify-between items-center border-t border-slate-100">
                                    <button 
                                        type="button"
                                        onClick={() => setViewer({ isOpen: true, photo: item })} 
                                        title="Lihat Penuh" 
                                        className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-orange-500 rounded-lg transition-colors cursor-pointer touch-manipulation"
                                    >
                                        <Maximize2 className="w-3.5 h-3.5"/>
                                    </button>
                                    
                                    {canManage && (
                                        <button 
                                            type="button"
                                            onClick={() => setEditorState({ isOpen: true, photo: item })} 
                                            title="Anotasi & Ukur Postur" 
                                            className="p-1.5 text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 rounded-lg transition-colors cursor-pointer touch-manipulation"
                                        >
                                            <Pencil className="w-3.5 h-3.5"/>
                                        </button>
                                    )}

                                    <button 
                                        type="button"
                                        onClick={() => handleDownload(item.image_path, `dpa-${athlete.name || 'athlete'}-${item.id}.jpg`)} 
                                        title="Download Foto" 
                                        className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-orange-500 rounded-lg transition-colors cursor-pointer touch-manipulation"
                                    >
                                        <Download className="w-3.5 h-3.5"/>
                                    </button>
                                    
                                    {canManage && (
                                        <>
                                            <button 
                                                type="button"
                                                onClick={() => openEdit(item)} 
                                                title="Edit Foto & Catatan" 
                                                className="p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors cursor-pointer touch-manipulation"
                                            >
                                                <Edit3 className="w-3.5 h-3.5"/>
                                            </button>
                                            
                                            <button 
                                                type="button"
                                                onClick={() => deleteGallery(item.id)} 
                                                title="Hapus Foto" 
                                                className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer touch-manipulation"
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
                MODAL 1: VIEWER / LIGHTBOX FOTO (STUDIO INSPECTOR LIGHT THEME)
            ========================================= */}
            {viewer.isOpen && viewer.photo && (() => {
                const curPhoto = viewer.photo;
                const activeIdx = galleries.findIndex(g => g.id === curPhoto.id);
                const hasMultiple = galleries.length > 1;

                return (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200" 
                            onClick={() => setViewer({ isOpen: false, photo: null })}
                        />
                        
                        {/* Modal Box */}
                        <div className="relative z-10 w-full max-w-5xl max-h-[92vh] bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
                            
                            {/* Mobile Top Bar */}
                            <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-200 bg-white">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800">
                                        Foto Postur #{activeIdx !== -1 ? activeIdx + 1 : 1}
                                    </span>
                                    {hasMultiple && (
                                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-lg">
                                            {activeIdx + 1} / {galleries.length}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewer({ isOpen: false, photo: null })}
                                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Left Visual Area (Light Dot-Grid Canvas) */}
                            <div className="flex-1 flex flex-col bg-slate-100/70 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden min-h-[320px] md:min-h-[500px]">
                                <div 
                                    className="flex-1 relative flex items-center justify-center p-4 md:p-6 overflow-hidden"
                                    style={{
                                        backgroundImage: "radial-gradient(#cbd5e1 1.2px, transparent 1.2px)",
                                        backgroundSize: "20px 20px"
                                    }}
                                >
                                    <img 
                                        src={getPhotoUrl(curPhoto.image_path)} 
                                        alt="Detail Postur" 
                                        className="max-w-full max-h-[55vh] md:max-h-[66vh] object-contain rounded-lg shadow-md border border-slate-200/80 bg-white transition-all duration-300" 
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
                                                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-white/95 hover:bg-orange-500 text-slate-700 hover:text-white border border-slate-200 hover:border-orange-500 shadow-md backdrop-blur-xs transition-all hover:scale-110 cursor-pointer"
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
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-white/95 hover:bg-orange-500 text-slate-700 hover:text-white border border-slate-200 hover:border-orange-500 shadow-md backdrop-blur-xs transition-all hover:scale-110 cursor-pointer"
                                                title="Foto Berikutnya (Panah Kanan)"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Bottom Thumbnail Strip */}
                                {hasMultiple && (
                                    <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
                                        {galleries.map((thumb, idx) => (
                                            <button
                                                key={thumb.id || idx}
                                                type="button"
                                                onClick={() => setViewer({ isOpen: true, photo: thumb })}
                                                className={`relative shrink-0 w-12 h-14 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                                                    thumb.id === curPhoto.id 
                                                        ? "border-orange-500 ring-2 ring-orange-500/40 shadow-xs scale-105" 
                                                        : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400"
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

                            {/* Right Inspector Panel (Light Theme) */}
                            <div className="w-full md:w-80 lg:w-96 bg-white p-5 flex flex-col justify-between overflow-y-auto space-y-4">
                                
                                {/* Header Panel */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                        <div>
                                            <h3 className="font-bold text-sm sm:text-base text-slate-900">
                                                Foto Postur #{activeIdx !== -1 ? activeIdx + 1 : 1}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                                <CalendarDays size={12} className="text-orange-500" />
                                                <span>
                                                    {formatDateIndo(curPhoto.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setViewer({ isOpen: false, photo: null })}
                                            className="hidden md:flex p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                            title="Tutup (Esc)"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Catatan Observasi Klinis */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <Info size={11} className="text-orange-500" />
                                            <span>Observasi &amp; Catatan Klinis</span>
                                        </label>
                                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[70px] max-h-[18vh] overflow-y-auto custom-scrollbar">
                                            {curPhoto.notes ? (
                                                <p className="text-xs text-slate-700 italic leading-relaxed whitespace-pre-line">
                                                    "{curPhoto.notes}"
                                                </p>
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">
                                                    Tidak ada catatan observasi klinis khusus untuk foto ini.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ringkasan Atlet & Status */}
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Atlet</span>
                                            <span className="font-bold text-slate-800">{athlete?.name || '-'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Modul Analisis</span>
                                            <span className="font-bold text-orange-600">Dynamic Posture (DPA)</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Status Anotasi</span>
                                            <span className="font-bold text-slate-800">
                                                {curPhoto.annotations ? "Sudah Diukur / Dianotasi" : "Belum Ada Anotasi"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Studio Buttons */}
                                <div className="pt-3 space-y-2 border-t border-slate-100">
                                    {canManage && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentPhoto = curPhoto;
                                                setViewer({ isOpen: false, photo: null });
                                                setEditorState({ isOpen: true, photo: currentPhoto });
                                            }}
                                            className="w-full py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                                        >
                                            <Pencil size={13} />
                                            <span>Anotasi &amp; Ukur Postur</span>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleDownload(curPhoto.image_path, `dpa-${athlete?.name || 'athlete'}-${curPhoto.id}.jpg`)}
                                        className="w-full py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
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
                                                className="flex-1 py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                <Edit3 size={12} />
                                                <span>Edit Catatan</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => deleteGallery(curPhoto.id)}
                                                className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer"
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
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200" 
                        onClick={closeEdit}
                    />
                    
                    {/* Modal Box */}
                    <div className="relative z-10 bg-white w-full max-w-lg rounded-lg shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-orange-50/70 via-white to-orange-50/30">
                            <div>
                                <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-orange-500" />
                                    <span>Edit Foto &amp; Catatan Postur</span>
                                </h3>
                                <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">
                                    Perbarui gambar beranotasi, tanggal tes, atau catatan klinis.
                                </p>
                            </div>
                            <button 
                                type="button"
                                onClick={closeEdit} 
                                className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={submitEdit} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                            {/* Area Preview Foto Sekarang / Baru */}
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 mb-1.5 block">
                                    Gambar Postur DPA
                                </label>
                                
                                <div className="p-2.5 bg-slate-50 border border-slate-200/90 rounded-lg space-y-2">
                                    <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-200 bg-black/90 flex items-center justify-center relative">
                                        <img 
                                            src={editPreview || getPhotoUrl(editModal.photo.image_path)} 
                                            alt="Preview" 
                                            className="max-h-full max-w-full object-contain" 
                                        />
                                        {editPreview && (
                                            <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
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
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-orange-500 text-slate-700 hover:text-orange-600 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                                        >
                                            <Camera size={13.5} />
                                            <span>{editPreview ? 'Pilih File Lain' : 'Ganti / Upload Gambar Baru'}</span>
                                        </button>

                                        {editPreview && (
                                            <button
                                                type="button"
                                                onClick={cancelReplacementImage}
                                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
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
                                <label className="text-[11px] font-bold text-slate-700 mb-1.5 block">
                                    Tanggal Pengambilan / Evaluasi
                                </label>
                                <input 
                                    type="date"
                                    value={editForm.data.created_at}
                                    onChange={(e) => editForm.setData('created_at', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all font-medium"
                                />
                            </div>

                            {/* Catatan Analisis */}
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 mb-1.5 block">
                                    Catatan Analisis &amp; Temuan Klinis Postur
                                </label>
                                <textarea 
                                    rows="4" 
                                    value={editForm.data.notes}
                                    onChange={(e) => editForm.setData('notes', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none leading-relaxed"
                                    placeholder="Contoh: Overhead Squat Anterior: pronasi kaki bilateral disertai dynamic knee valgus derajat 115°..."
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                                <button 
                                    type="button" 
                                    onClick={closeEdit} 
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={editForm.processing} 
                                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    {editForm.processing ? (
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200" 
                        onClick={closeUploadModal}
                    />
                    
                    {/* Box Modal */}
                    <div className="relative z-10 bg-white w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-orange-50/70 via-white to-orange-50/30 shrink-0">
                            <div>
                                <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
                                    <ImagePlus className="w-4 h-4 text-orange-500" />
                                    <span>Upload Foto Postur DPA</span>
                                </h3>
                                <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">
                                    Pilih foto postur atlet (Overhead Squat, Single Leg, dll) dan sertakan analisis.
                                </p>
                            </div>
                            <button 
                                type="button"
                                onClick={closeUploadModal} 
                                className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
                            {uploadData.photos.length === 0 && (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-44 sm:h-48 border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50/70 hover:bg-orange-50/40 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group p-4 text-center"
                                >
                                    <div className="p-3 bg-white rounded-lg shadow-2xs group-hover:scale-110 transition-transform mb-2.5 text-slate-400 group-hover:text-orange-500 border border-slate-200">
                                        <ImagePlus className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-orange-600">
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
                                            className="flex flex-col sm:flex-row gap-3 bg-slate-50/80 border border-slate-200 p-3 rounded-lg relative group"
                                        >
                                            {/* Preview */}
                                            <div className="w-full sm:w-28 h-36 sm:h-28 rounded-lg overflow-hidden border border-slate-200 bg-black/90 shrink-0 flex items-center justify-center">
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
                                                        <label className="text-[10px] font-bold text-slate-500 mb-1 block">
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
                                                            className="w-full rounded-lg border border-slate-200 text-xs p-1.5 bg-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
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
                                                        className="w-full rounded-lg border border-slate-200 text-xs p-2 bg-white resize-none outline-none focus:border-orange-500"
                                                    />
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button 
                                                type="button" 
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                                title="Hapus foto ini"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-2.5 border-2 border-dashed border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50/50 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                        <div className="p-4 border-t border-slate-100 bg-white shrink-0 flex justify-end gap-2.5">
                            <button 
                                type="button" 
                                onClick={closeUploadModal} 
                                className="px-4 py-2 text-slate-600 font-bold text-xs hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button 
                                type="button" 
                                onClick={submitUpload}
                                disabled={uploadProcessing || uploadData.photos.length === 0}
                                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                {uploadProcessing ? (
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-3.5 h-3.5" />
                                )}
                                <span>Upload {uploadData.photos.length > 0 ? `${uploadData.photos.length} Foto` : ''}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL 4: POSTURE IMAGE EDITOR (CANVAS)
            ========================================= */}
            <PostureImageEditorModal
                isOpen={editorState.isOpen}
                onClose={() => setEditorState({ isOpen: false, photo: null })}
                imageSrc={editorState.photo ? getPhotoUrl(editorState.photo.image_path) : null}
                originalImageSrc={editorState.photo ? getPhotoUrl(editorState.photo.original_image_path || editorState.photo.image_path) : null}
                initialAnnotations={editorState.photo?.annotations || null}
                initialMeta={editorState.photo?.meta || null}
                galleryId={editorState.photo?.id || null}
                athleteId={athlete?.id || null}
                athleteName={athlete?.name || ''}
                onSaved={() => router.reload({ preserveScroll: true })}
            />
        </div>
    );
}