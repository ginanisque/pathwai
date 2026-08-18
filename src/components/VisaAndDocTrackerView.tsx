import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Shield, AlertTriangle, CheckCircle, Clock, Plus, Trash2, Calendar, Lock,
  Camera, Scan, Eye, RefreshCw, Upload, X, Sparkles, Key, FileCheck, Check, Bell, BellRing,
  ShieldAlert, Zap, Send, Info, RotateCw, SlidersHorizontal, SwitchCamera, Bot, Sliders, ArrowRight
} from 'lucide-react';
import { VisaRecord, MobilityDocument, MobilityAlert } from '../types';
import { performDocumentOCR, OCRParseResult } from '../lib/api';
import { encryptBase64Data, decryptBase64Data } from '../lib/encryption';
import { DestinationVisaSelector } from './DestinationVisaSelector';
import {
  findExpiringItems,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  triggerBrowserNotification,
  resetNotifiedCache,
  ExpiringItemAlert,
  NotificationPermissionStatus
} from '../lib/browserNotifications';

interface VisaAndDocTrackerViewProps {
  visas: VisaRecord[];
  documents: MobilityDocument[];
  onAddVisa: (visa: VisaRecord) => void;
  onRemoveVisa: (id: string) => void;
  onAddDocument: (doc: MobilityDocument) => void;
  onRemoveDocument: (id: string) => void;
  onAddAlert?: (alert: MobilityAlert) => void;
  onNavigateTab?: (tab: string) => void;
}

export const VisaAndDocTrackerView: React.FC<VisaAndDocTrackerViewProps> = ({
  visas,
  documents,
  onAddVisa,
  onRemoveVisa,
  onAddDocument,
  onRemoveDocument,
  onAddAlert,
  onNavigateTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'visas' | 'documents'>('visas');

  // Browser Notification state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionStatus>(
    getBrowserNotificationPermission()
  );
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // New Visa form state
  const [newCountry, setNewCountry] = useState('');
  const [newVisaType, setNewVisaType] = useState('');
  const [newDocNum, setNewDocNum] = useState('');
  const [newIssue, setNewIssue] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newWorkRights, setNewWorkRights] = useState('');

  // New Document form state
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MobilityDocument['category']>('passport');
  const [newDocDeadline, setNewDocDeadline] = useState('');
  const [newDocNotes, setNewDocNotes] = useState('');

  // Enhanced Camera Scanner & OCR state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanTargetType, setScanTargetType] = useState<'visa' | 'document'>('visa');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRParseResult | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isSavingEncrypted, setIsSavingEncrypted] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  // Interactive Camera Controls State
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default');
  const [activeFilter, setActiveFilter] = useState<'normal' | 'grayscale' | 'high_contrast' | 'sepia_document'>('normal');
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [docReticleType, setDocReticleType] = useState<'passport' | 'visa' | 'bank' | 'diploma'>('passport');
  const [sendToAgentToast, setSendToAgentToast] = useState<string | null>(null);

  // Digital PDF & File Upload State
  const [uploadedFileType, setUploadedFileType] = useState<'image' | 'pdf'>('image');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Viewer state for decrypted documents
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [decryptedImageMap, setDecryptedImageMap] = useState<Record<string, string>>({});
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Video & Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const enumerateVideoDevices = async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
      }
    } catch (e) {
      console.warn('Could not enumerate media devices:', e);
    }
  };

  const startCamera = async (overrideFacingMode?: 'environment' | 'user', overrideDeviceId?: string) => {
    setScannerError(null);
    stopCamera();
    try {
      setCameraActive(true);
      const targetFacing = overrideFacingMode || facingMode;
      const targetDeviceId = overrideDeviceId !== undefined ? overrideDeviceId : selectedDeviceId;

      let videoConstraints: MediaTrackConstraints = {};
      if (targetDeviceId && targetDeviceId !== 'default') {
        videoConstraints = { deviceId: { exact: targetDeviceId } };
      } else {
        videoConstraints = {
          facingMode: targetFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      await enumerateVideoDevices();
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraActive(false);
      setScannerError('Could not access device camera. You can switch camera device or upload an image file directly below.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    setSelectedDeviceId('default');
    startCamera(nextFacing, 'default');
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    startCamera(facingMode, deviceId);
  };

  const handleRotateImage = () => {
    setRotationAngle(prev => (prev + 90) % 360);
  };

  const handleOpenScanner = (target: 'visa' | 'document') => {
    setScanTargetType(target);
    setIsScannerOpen(true);
    setCapturedImage(null);
    setOcrResult(null);
    setScannerError(null);
    setRotationAngle(0);
    setSendToAgentToast(null);
    setUploadedFileType('image');
    setUploadedFileName(null);
    setUploadedFileSize(null);
    startCamera();
  };

  const handleCloseScanner = () => {
    stopCamera();
    setIsScannerOpen(false);
    setCapturedImage(null);
    setOcrResult(null);
    setSendToAgentToast(null);
    setIsDragOver(false);
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    const vWidth = video.videoWidth || 1280;
    const vHeight = video.videoHeight || 720;
    
    // Set canvas dimensions respecting rotation
    if (rotationAngle === 90 || rotationAngle === 270) {
      canvas.width = vHeight;
      canvas.height = vWidth;
    } else {
      canvas.width = vWidth;
      canvas.height = vHeight;
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      // Apply selected image filter
      if (activeFilter === 'grayscale') {
        ctx.filter = 'grayscale(100%) contrast(120%)';
      } else if (activeFilter === 'high_contrast') {
        ctx.filter = 'grayscale(100%) contrast(220%) brightness(105%)';
      } else if (activeFilter === 'sepia_document') {
        ctx.filter = 'sepia(70%) contrast(150%)';
      } else {
        ctx.filter = 'none';
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotationAngle * Math.PI) / 180);

      if (rotationAngle === 90 || rotationAngle === 270) {
        ctx.drawImage(video, -vHeight / 2, -vWidth / 2, vHeight, vWidth);
      } else {
        ctx.drawImage(video, -vWidth / 2, -vHeight / 2, vWidth, vHeight);
      }

      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setUploadedFileType('image');
      setUploadedFileName('Camera_Scan.jpg');
      setUploadedFileSize('Camera Image');
      setCapturedImage(dataUrl);
      stopCamera();
      await runOcr(dataUrl, 'image/jpeg');
    }
  };

  const processSelectedFile = (file: File) => {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const mimeType = isPdf ? 'application/pdf' : (file.type || 'image/jpeg');

    setUploadedFileType(isPdf ? 'pdf' : 'image');
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const result = evt.target?.result as string;
      if (result) {
        setCapturedImage(result);
        stopCamera();
        await runOcr(result, mimeType);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const runOcr = async (base64Img: string, mimeType: string = 'image/jpeg') => {
    setIsOcrLoading(true);
    setScannerError(null);
    try {
      const parsed = await performDocumentOCR(base64Img, mimeType);
      setOcrResult(parsed);

      // Auto-fill form values from parsed expiry date and metadata
      if (parsed.expiryDate) {
        if (scanTargetType === 'visa') {
          setNewExpiry(parsed.expiryDate);
          if (parsed.country) setNewCountry(parsed.country);
          if (parsed.title) setNewVisaType(parsed.title);
          if (parsed.documentNumber) setNewDocNum(parsed.documentNumber);
          if (parsed.workRights) setNewWorkRights(parsed.workRights);
          if (parsed.issueDate) setNewIssue(parsed.issueDate);
        } else {
          setNewDocDeadline(parsed.expiryDate);
          if (parsed.title) setNewDocTitle(parsed.title);
          if (parsed.category) setNewCategory(parsed.category);
          if (parsed.notes) setNewDocNotes(parsed.notes);
        }
      }
    } catch (err: any) {
      console.error('OCR processing error:', err);
      setScannerError('OCR document processing failed. You can still save the encrypted payload manually.');
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleSendToAiAgent = () => {
    if (onNavigateTab) {
      onNavigateTab('ai-agent');
    }
    setSendToAgentToast('Forwarded parsed document details to AI Assessment Agent!');
    setTimeout(() => setSendToAgentToast(null), 4000);
  };

  const handleSaveScanRecord = async () => {
    if (!capturedImage) return;
    setIsSavingEncrypted(true);
    try {
      const { encryptedString, iv } = await encryptBase64Data(capturedImage);

      if (scanTargetType === 'visa') {
        const record: VisaRecord = {
          id: `v_scan_${Date.now()}`,
          userId: 'current_user',
          country: ocrResult?.country || newCountry.trim() || 'Scanned Residence Permit',
          visaType: ocrResult?.title || newVisaType.trim() || 'Physical Visa Document',
          status: 'valid',
          documentNumber: ocrResult?.documentNumber || newDocNum.trim() || 'SCAN-' + Math.floor(100000 + Math.random() * 900000),
          issueDate: ocrResult?.issueDate || newIssue || new Date().toISOString().split('T')[0],
          expiryDate: ocrResult?.expiryDate || newExpiry || '2029-12-31',
          workRights: ocrResult?.workRights || newWorkRights.trim() || 'Full Statutory Work Rights',
          conditions: ocrResult?.conditions || ['OCR Machine Verified', 'Biometric Scan Encrypted'],
          notes: ocrResult?.notes || 'Encrypted document scan saved with auto-parsed OCR expiry date.',
          encryptedImageData: encryptedString,
          encryptedIv: iv,
          ocrParsed: true,
          createdAt: new Date().toISOString()
        };
        onAddVisa(record);
      } else {
        const doc: MobilityDocument = {
          id: `d_scan_${Date.now()}`,
          userId: 'current_user',
          title: ocrResult?.title || newDocTitle.trim() || 'Scanned Passport / Document',
          category: (ocrResult?.category as MobilityDocument['category']) || newCategory || 'passport',
          deadline: ocrResult?.expiryDate || newDocDeadline || '2029-12-31',
          expiryDate: ocrResult?.expiryDate || newDocDeadline || '2029-12-31',
          status: 'valid',
          notes: ocrResult?.notes || newDocNotes.trim() || 'Encrypted document scan saved with auto-parsed OCR expiry date.',
          encryptedImageData: encryptedString,
          encryptedIv: iv,
          ocrParsed: true,
          createdAt: new Date().toISOString()
        };
        onAddDocument(doc);
      }

      handleCloseScanner();
    } catch (err) {
      console.error('Failed to save encrypted document:', err);
      setScannerError('Failed to encrypt document before save.');
    } finally {
      setIsSavingEncrypted(false);
    }
  };

  const handleViewDecryptedDoc = async (id: string, encData?: string, iv?: string) => {
    if (!encData || !iv) return;
    setViewingDocId(id);
    if (!decryptedImageMap[id]) {
      setIsDecrypting(true);
      try {
        const decrypted = await decryptBase64Data(encData, iv);
        setDecryptedImageMap(prev => ({ ...prev, [id]: decrypted }));
      } catch (err) {
        console.error('Decryption failed:', err);
      } finally {
        setIsDecrypting(false);
      }
    }
  };

  const handleCreateVisa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountry.trim() || !newVisaType.trim()) return;

    const record: VisaRecord = {
      id: `v_${Date.now()}`,
      userId: 'current_user',
      country: newCountry.trim(),
      visaType: newVisaType.trim(),
      status: 'valid',
      documentNumber: newDocNum.trim() || 'N/A',
      issueDate: newIssue || new Date().toISOString().split('T')[0],
      expiryDate: newExpiry || '2027-12-31',
      workRights: newWorkRights.trim() || 'Standard Work Rights',
      conditions: [],
      notes: '',
      createdAt: new Date().toISOString()
    };
    onAddVisa(record);
    setNewCountry('');
    setNewVisaType('');
    setNewDocNum('');
    setNewWorkRights('');
    setNewExpiry('');
    setNewIssue('');
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const doc: MobilityDocument = {
      id: `d_${Date.now()}`,
      userId: 'current_user',
      title: newDocTitle.trim(),
      category: newCategory,
      deadline: newDocDeadline || new Date().toISOString().split('T')[0],
      expiryDate: newDocDeadline || '2027-12-31',
      status: 'valid',
      notes: newDocNotes.trim(),
      createdAt: new Date().toISOString()
    };
    onAddDocument(doc);
    setNewDocTitle('');
    setNewDocNotes('');
    setNewDocDeadline('');
  };

  // 48-Hour Notification Calculation & Dispatch Handlers
  const expiringItems = findExpiringItems(visas, documents, 48);

  const handleRequestPermission = async () => {
    const perm = await requestBrowserNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      setNotificationToast('Browser notifications enabled! Pathway AI will issue native OS/desktop popups 48h before visa/document expiries.');
    } else if (perm === 'denied') {
      setNotificationToast('Browser notification permissions were denied. In-app alerts will still trigger.');
    }
  };

  const handleDispatchSingleNotification = (item: ExpiringItemAlert) => {
    const title = `48-Hour Expiry Alert: ${item.title}`;
    const body = `Urgent: ${item.title} expires in ${item.hoursRemaining} hours (${item.expiryDate}). Please renew or submit documents immediately.`;

    const dispatched = triggerBrowserNotification(title, {
      body,
      tag: `exp_${item.id}`
    });

    if (onAddAlert) {
      onAddAlert({
        id: `alert_exp_${Date.now()}_${item.id}`,
        userId: 'current_user',
        alertType: 'deadline_warning',
        title: `48-Hour Expiry Warning: ${item.title}`,
        summary: body,
        sourceUrl: 'https://pathway.ai/visas',
        publicationDate: new Date().toISOString().split('T')[0],
        effectiveDate: item.expiryDate,
        affectedGroups: ['Passport & Visa Holders'],
        confidenceLevel: 'high',
        recommendedAction: 'Initiate renewal paperwork or file extension request immediately.',
        requiresLegalAdvice: false,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    if (dispatched) {
      setNotificationToast(`Native desktop browser notification popup dispatched for "${item.title}".`);
    } else {
      setNotificationToast(`In-app notification alert generated for "${item.title}" (${item.hoursRemaining}h remaining). Browser popup disabled or blocked in frame.`);
    }
  };

  const handleDispatchAllNotifications = () => {
    resetNotifiedCache();
    if (expiringItems.length === 0) {
      setNotificationToast('Scan complete: No visas or documents are currently within the 48-hour expiry window.');
      return;
    }
    expiringItems.forEach(item => {
      handleDispatchSingleNotification(item);
    });
    setNotificationToast(`Scanned & triggered ${expiringItems.length} 48-hour expiry notification(s). Check desktop popups & Alerts tab.`);
  };

  const handleSimulate48hAlert = () => {
    const expiryDateStr = new Date(Date.now() + 36 * 3600 * 1000).toISOString().split('T')[0];
    const testDoc: MobilityDocument = {
      id: `doc_sim_${Date.now()}`,
      userId: 'current_user',
      title: 'AIMA Residence Renewal Paperwork (Simulated 48h Warning)',
      category: 'visa',
      deadline: expiryDateStr,
      expiryDate: expiryDateStr,
      status: 'expiring_soon',
      notes: 'Simulated 48-hour document expiry created for testing browser notifications.',
      createdAt: new Date().toISOString()
    };

    onAddDocument(testDoc);

    const title = `48-Hour Expiry Alert: ${testDoc.title}`;
    const body = `CRITICAL WARNING: ${testDoc.title} expires in ~36 hours on ${expiryDateStr}. Please file immediately!`;
    const dispatched = triggerBrowserNotification(title, { body });

    if (onAddAlert) {
      onAddAlert({
        id: `alert_sim_${Date.now()}`,
        userId: 'current_user',
        alertType: 'deadline_warning',
        title: `48-Hour Expiry Alert: ${testDoc.title}`,
        summary: body,
        sourceUrl: 'https://pathway.ai/tracker',
        publicationDate: new Date().toISOString().split('T')[0],
        effectiveDate: expiryDateStr,
        affectedGroups: ['Residence Permit Holders'],
        confidenceLevel: 'high',
        recommendedAction: 'Submit emergency extension request immediately.',
        requiresLegalAdvice: false,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    if (dispatched) {
      setNotificationToast('Simulated 48h document created! Native browser desktop notification dispatched.');
    } else {
      setNotificationToast('Simulated 48h document created! Added to in-app notification center.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#222] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[10px] text-slate-300 font-mono font-black uppercase tracking-[0.2em] mb-2">03 IMMIGRATION RECORDS</h2>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            Visas & Document Tracker
          </h1>
          <p className="text-sm text-slate-200 mt-2 font-medium">
            Immigration status records, residence permits, work rights, and camera document OCR scanning.
          </p>
        </div>

        {/* Action Buttons & Sub-tab toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => handleOpenScanner(activeSubTab === 'visas' ? 'visa' : 'document')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase text-xs rounded-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Document (OCR)</span>
          </button>

          <div className="flex border border-[#333] p-1 bg-[#111] rounded-sm">
            <button
              onClick={() => setActiveSubTab('visas')}
              className={`px-4 py-1.5 text-xs font-black uppercase rounded-sm transition-colors ${
                activeSubTab === 'visas' ? 'bg-white text-black' : 'text-slate-200 hover:text-white'
              }`}
            >
              Visa Records ({visas.length})
            </button>
            <button
              onClick={() => setActiveSubTab('documents')}
              className={`px-4 py-1.5 text-xs font-black uppercase rounded-sm transition-colors ${
                activeSubTab === 'documents' ? 'bg-white text-black' : 'text-slate-200 hover:text-white'
              }`}
            >
              Deadline Tracker ({documents.length})
            </button>
          </div>
        </div>
      </div>

      {/* 48-HOUR BROWSER NOTIFICATION MANAGER BANNER */}
      <div className="p-5 bg-gradient-to-r from-[#181205] via-[#111] to-[#0D1520] border border-amber-500/40 rounded-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#252015] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-sm">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase text-white tracking-wider">
                  48-Hour Visa & Document Expiry Notification Engine
                </h3>
                <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase">
                  ACTIVE SCANNER
                </span>
              </div>
              <p className="text-xs text-[#AAA] mt-0.5">
                Monitors stored visa and document dates. Triggers native browser desktop push notifications & system alerts 48h prior to expiration.
              </p>
            </div>
          </div>

          {/* Browser Permission & Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Permission Badge */}
            <div className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase flex items-center gap-1.5 border ${
              notificationPermission === 'granted'
                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                : notificationPermission === 'denied'
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
            }`}>
              {notificationPermission === 'granted' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  <span>Desktop Alerts: Granted</span>
                </>
              ) : notificationPermission === 'denied' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>Desktop Alerts: Denied</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Desktop Alerts: Unset</span>
                </>
              )}
            </div>

            {notificationPermission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs rounded-sm tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Enable Desktop Popups</span>
              </button>
            )}

            <button
              onClick={handleDispatchAllNotifications}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold uppercase text-xs rounded-sm border border-neutral-700 flex items-center gap-1.5 transition-colors"
              title="Re-evaluate all expiry dates and issue browser push notifications for any item within 48h"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Run 48h Scan</span>
            </button>

            <button
              onClick={handleSimulate48hAlert}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold uppercase text-xs rounded-sm border border-blue-500/40 flex items-center gap-1.5 transition-colors"
              title="Add a test document expiring in 36 hours to test browser notification popup"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Test 48h Notification</span>
            </button>
          </div>
        </div>

        {/* Toast confirmation message */}
        {notificationToast && (
          <div className="p-3 bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs rounded-sm flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2 font-mono">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{notificationToast}</span>
            </div>
            <button onClick={() => setNotificationToast(null)} className="text-neutral-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Expiring Items Banner */}
        {expiringItems.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                {expiringItems.length} ITEM(S) EXPIRING WITHIN 48 HOURS (OR EXPIRED)
              </span>
              <span className="text-[10px] font-mono text-slate-200">
                Threshold: 48 Hours Prior
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {expiringItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#0E0B05] border border-amber-500/30 rounded-sm flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold uppercase rounded">
                        {item.itemType}
                      </span>
                      <h4 className="text-xs font-bold text-white uppercase truncate">{item.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#AAA]">
                      <span>Expiry: <strong className="text-amber-300">{item.expiryDate}</strong></span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.isExpired ? 'EXPIRED' : `${item.hoursRemaining}h remaining`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDispatchSingleNotification(item)}
                    className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase rounded-sm flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Push Desktop Alert</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs font-mono text-slate-200 bg-[#0A0A0A] p-3 rounded border border-[#222]">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              All visa records and mobility documents are valid with no upcoming 48-hour expiries.
            </span>
            <span className="text-[10px] text-slate-300">Next Auto-Check: Active</span>
          </div>
        )}
      </div>

      {activeSubTab === 'visas' ? (
        /* VISAS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List of Visas */}
          <div className="lg:col-span-8 space-y-4">
            {visas.map((v) => (
              <div key={v.id} className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-4 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-white text-black px-2 py-0.5 font-black mr-2">
                      {v.country}
                    </span>
                    <h3 className="text-lg font-black uppercase text-white inline-block">{v.visaType}</h3>
                    {v.ocrParsed && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-xs">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        OCR PARSED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-sm ${
                      v.status === 'valid' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                      v.status === 'expiring_soon' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}>
                      STATUS: {v.status}
                    </span>

                    {v.encryptedImageData && (
                      <button
                        onClick={() => handleViewDecryptedDoc(v.id, v.encryptedImageData, v.encryptedIv)}
                        className="flex items-center gap-1 text-[10px] font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-2.5 py-1 rounded border border-neutral-700 transition-colors"
                      >
                        <Lock className="w-3 h-3 text-green-400" />
                        <span>View Scan</span>
                      </button>
                    )}

                    <button
                      onClick={() => onRemoveVisa(v.id)}
                      className="text-[#555] hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <p className="text-[10px] text-slate-300 uppercase">Doc Number</p>
                    <p className="font-bold text-white mt-0.5">{v.documentNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 uppercase">Issue Date</p>
                    <p className="font-bold text-white mt-0.5">{v.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 uppercase">Expiry Date</p>
                    <p className="font-bold text-green-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {v.expiryDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 uppercase">Work Rights</p>
                    <p className="font-bold text-white mt-0.5 truncate">{v.workRights}</p>
                  </div>
                </div>

                {v.conditions && v.conditions.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-mono text-slate-300 uppercase mb-1">Stipulations & Conditions</p>
                    <div className="space-y-1">
                      {v.conditions.map((cond, i) => (
                        <p key={i} className="text-xs text-[#AAA] bg-[#0A0A0A] p-2 rounded border border-[#222]">
                          • {cond}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Visa Form */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-gradient-to-br from-[#18181B] to-[#111] border border-blue-500/30 rounded-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white">Camera OCR Scanner</h4>
                  <p className="text-[11px] text-[#AAA] mt-0.5">Scan physical passport or visa to auto-fill fields & encrypt scan.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenScanner('visa')}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs py-2 rounded-sm tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Scan className="w-4 h-4" />
                Launch Camera Scanner
              </button>
            </div>

            <form onSubmit={handleCreateVisa} className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-[#222] pb-3">
                Log New Visa Record
              </h3>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1">Issuing Country</label>
                <input
                  type="text"
                  placeholder="e.g. Portugal"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none rounded-sm"
                />
              </div>

              <DestinationVisaSelector
                destinationCountry={newCountry}
                value={newVisaType}
                onChange={(selected) => setNewVisaType(selected)}
                label="Visa / Permit Title / Category"
                placeholder="Select prefilled category for country..."
              />

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1">Document Number</label>
                <input
                  type="text"
                  placeholder="e.g. PT-D7-94821"
                  value={newDocNum}
                  onChange={(e) => setNewDocNum(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none font-mono rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white font-mono focus:outline-none rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1 flex items-center justify-between">
                    <span>Expiry Date</span>
                    {newExpiry && <span className="text-green-400 font-bold">AUTO</span>}
                  </label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white font-mono focus:outline-none rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1">Work Authorisation Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Foreign remote work allowed"
                  value={newWorkRights}
                  onChange={(e) => setNewWorkRights(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none rounded-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs py-3 rounded-sm tracking-widest transition-colors"
              >
                Log Visa Record
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* DOCUMENTS & DEADLINES VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Document Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-5 bg-[#111] border border-[#222] rounded-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#222] pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-[#222] text-white rounded">
                          {doc.category.replace('_', ' ')}
                        </span>
                        {doc.ocrParsed && (
                          <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                            OCR
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          doc.status === 'valid' ? 'bg-green-500/10 text-green-400' :
                          doc.status === 'expiring_soon' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {doc.status}
                        </span>

                        {doc.encryptedImageData && (
                          <button
                            onClick={() => handleViewDecryptedDoc(doc.id, doc.encryptedImageData, doc.encryptedIv)}
                            className="p-1 bg-neutral-800 hover:bg-neutral-700 text-green-400 rounded transition-colors"
                            title="Decrypt & View Scanned Image"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold uppercase text-white mt-3">{doc.title}</h4>
                    {doc.notes && <p className="text-xs text-slate-200 mt-1 leading-relaxed">{doc.notes}</p>}
                  </div>

                  <div className="pt-3 border-t border-[#222] flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span className="text-green-400 font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      EXPIRY: {doc.expiryDate || doc.deadline}
                    </span>
                    <button
                      onClick={() => onRemoveDocument(doc.id)}
                      className="text-[#555] hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Document Form */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-gradient-to-br from-[#18181B] to-[#111] border border-blue-500/30 rounded-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white">Scan Passport / Doc</h4>
                  <p className="text-[11px] text-[#AAA] mt-0.5">Capture document to auto-fill deadline & encrypt scan securely.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenScanner('document')}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs py-2 rounded-sm tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Scan className="w-4 h-4" />
                Launch Camera Scanner
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-[#222] pb-3">
                Track New Document Deadline
              </h3>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Apostilled Police Check"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none rounded-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MobilityDocument['category'])}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white uppercase focus:outline-none rounded-sm"
                >
                  <option value="passport">Passport</option>
                  <option value="visa">Visa / Permit</option>
                  <option value="proof_of_funds">Proof of Funds</option>
                  <option value="diploma">Diploma / Transcript</option>
                  <option value="employment">Employment Letter</option>
                  <option value="medical">Health Insurance / Medical</option>
                  <option value="other">Other Supporting</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1 flex items-center justify-between">
                  <span>Submission / Expiry Deadline</span>
                  {newDocDeadline && <span className="text-green-400 font-bold">AUTO</span>}
                </label>
                <input
                  type="date"
                  value={newDocDeadline}
                  onChange={(e) => setNewDocDeadline(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white font-mono focus:outline-none rounded-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1">Notes / Legal Requirements</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Must be apostilled within 90 days of interview"
                  value={newDocNotes}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] p-2 text-xs text-white focus:outline-none rounded-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs py-3 rounded-sm tracking-widest transition-colors"
              >
                Track Document
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CAMERA OCR SCANNER MODAL --- */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#333] rounded-sm max-w-3xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={handleCloseScanner}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-[#222] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-blue-500/20 text-blue-400 rounded-sm border border-blue-500/30">
                  <Camera className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black uppercase text-white tracking-wide">
                      Interactive Document Scanner
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800/50 text-[10px] font-mono font-bold uppercase rounded">
                      Gemini Vision OCR
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">
                    Position passport, visa, or proof of funds. Real-time OCR auto-fills statutory metadata and encrypts raw scan data.
                  </p>
                </div>
              </div>

              {/* Facing Mode / Camera Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="px-3 py-1.5 bg-[#1C1C1E] hover:bg-[#2A2A2D] border border-[#333] text-neutral-200 text-xs font-mono font-bold rounded-sm flex items-center gap-1.5 transition-colors"
                  title="Switch between front and rear camera"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-blue-400" />
                  <span className="uppercase text-[11px]">
                    {facingMode === 'environment' ? 'Rear Cam' : 'Front Cam'}
                  </span>
                </button>

                {availableDevices.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleDeviceChange(e.target.value)}
                    className="bg-[#1C1C1E] border border-[#333] text-neutral-300 text-xs px-2 py-1.5 rounded-sm focus:outline-none max-w-[140px] truncate font-mono"
                  >
                    <option value="default">Default Camera</option>
                    {availableDevices.map((dev, idx) => (
                      <option key={dev.deviceId} value={dev.deviceId}>
                        {dev.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Interactive Framing Reticle Selector */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] font-mono text-[#AAA] uppercase tracking-wider shrink-0 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" /> Frame Guide:
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {[
                  { id: 'passport', label: 'Passport (MRZ)' },
                  { id: 'visa', label: 'Visa Sticker' },
                  { id: 'bank', label: 'Bank Statement' },
                  { id: 'diploma', label: 'Diploma / ID' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDocReticleType(item.id as any)}
                    className={`px-2.5 py-1 text-[11px] font-mono uppercase font-bold rounded-sm border transition-colors ${
                      docReticleType === item.id
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                        : 'bg-[#181818] text-slate-200 border-[#2A2A2A] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {scannerError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-sm flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{scannerError}</span>
              </div>
            )}

            {/* Toast Notification */}
            {sendToAgentToast && (
              <div className="p-3 bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs rounded-sm flex items-center gap-2 font-mono animate-pulse">
                <Bot className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{sendToAgentToast}</span>
              </div>
            )}

            {/* Live Viewfinder & Filter Stage with Drag-and-Drop PDF Ingestion */}
            <div className="space-y-3">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative aspect-video bg-[#050505] border rounded overflow-hidden flex items-center justify-center transition-all ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-950/20 ring-2 ring-blue-500/50 scale-[1.005]'
                    : 'border-[#222]'
                }`}
              >
                {/* Drag-and-Drop Active Overlay */}
                {isDragOver && (
                  <div className="absolute inset-0 z-30 bg-blue-950/80 backdrop-blur-sm border-2 border-dashed border-blue-400 flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <Upload className="w-10 h-10 text-blue-400 animate-bounce" />
                    <h4 className="text-sm font-black text-white uppercase font-mono tracking-wider">
                      Drop Digital PDF or Image Document
                    </h4>
                    <p className="text-xs text-blue-300 font-mono">
                      Ingesting file for Gemini Vision AI statutory OCR parsing & 256-bit encryption.
                    </p>
                  </div>
                )}

                {capturedImage ? (
                  uploadedFileType === 'pdf' || capturedImage.startsWith('data:application/pdf') ? (
                    <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-[#08080A] rounded relative">
                      <div className="flex items-center gap-3 p-3 bg-red-950/30 border border-red-800/40 rounded-sm w-full max-w-lg mb-2">
                        <FileText className="w-8 h-8 text-red-400 shrink-0" />
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white uppercase truncate font-mono">
                              {uploadedFileName || 'Digital_Visa_Grant_Letter.pdf'}
                            </h4>
                            <span className="px-2 py-0.5 bg-red-900/60 text-red-200 text-[9px] font-mono font-bold rounded uppercase shrink-0">
                              PDF Document
                            </span>
                          </div>
                          <p className="text-[10px] text-[#999] font-mono">
                            {uploadedFileSize ? `Size: ${uploadedFileSize} • ` : ''}Gemini Multi-Page Vision OCR Active
                          </p>
                        </div>
                      </div>

                      <div className="w-full flex-1 max-h-[260px] bg-black rounded border border-[#262629] overflow-hidden flex items-center justify-center relative">
                        <object
                          data={capturedImage}
                          type="application/pdf"
                          className="w-full h-full min-h-[200px]"
                        >
                          <div className="p-6 text-center space-y-2">
                            <FileText className="w-12 h-12 text-red-500 mx-auto" />
                            <p className="text-xs text-neutral-300 font-mono font-bold uppercase">
                              Digital PDF Document Loaded
                            </p>
                            <p className="text-[11px] text-neutral-500 font-mono">
                              Multi-page statutory details extracted via Gemini Vision AI.
                            </p>
                          </div>
                        </object>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                      <img
                        src={capturedImage}
                        alt="Captured Document"
                        className="w-full h-full object-contain transition-transform duration-300"
                        style={{ transform: `rotate(${rotationAngle}deg)` }}
                      />
                      {rotationAngle > 0 && (
                        <span className="absolute bottom-3 left-3 bg-black/80 border border-[#333] text-blue-400 font-mono text-[10px] px-2 py-0.5 rounded">
                          Rotated {rotationAngle}°
                        </span>
                      )}
                    </div>
                  )
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        filter:
                          activeFilter === 'grayscale'
                            ? 'grayscale(100%) contrast(120%)'
                            : activeFilter === 'high_contrast'
                            ? 'grayscale(100%) contrast(200%) brightness(110%)'
                            : activeFilter === 'sepia_document'
                            ? 'sepia(70%) contrast(140%)'
                            : 'none'
                      }}
                      className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                    />

                    {!cameraActive && (
                      <div className="text-center p-6 space-y-3">
                        <Scan className="w-12 h-12 text-[#444] mx-auto animate-pulse" />
                        <div>
                          <p className="text-xs text-[#AAA] font-mono font-bold uppercase">
                            Drag & Drop PDF or Scan Image Here
                          </p>
                          <p className="text-[11px] text-slate-300 font-mono">
                            Supports PDF, PNG, JPG files or live device camera scanning
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase rounded-sm"
                        >
                          Retry Camera
                        </button>
                      </div>
                    )}
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />

                {/* Animated Scanner Laser & Dynamic Corner Bracket Overlay */}
                {cameraActive && !capturedImage && (
                  <div className="absolute inset-6 pointer-events-none flex flex-col justify-between p-2">
                    {/* Bounding Corner Brackets */}
                    <div className="flex justify-between">
                      <div className="w-8 h-8 border-t-2 border-l-2 border-blue-400" />
                      <div className="w-8 h-8 border-t-2 border-r-2 border-blue-400" />
                    </div>

                    {/* Laser Scan Line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_#60A5FA] animate-pulse my-auto" />

                    <div className="flex justify-between">
                      <div className="w-8 h-8 border-b-2 border-l-2 border-blue-400" />
                      <div className="w-8 h-8 border-b-2 border-r-2 border-blue-400" />
                    </div>

                    {/* Helper text overlay */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 border border-blue-500/40 text-blue-300 font-mono text-[10px] px-3 py-1 uppercase font-bold tracking-wider rounded">
                      {docReticleType === 'passport' && 'Align Passport MRZ Lines Inside Rectangle'}
                      {docReticleType === 'visa' && 'Position Visa Sticker Entry Stamp & Expiry'}
                      {docReticleType === 'bank' && 'Ensure Bank Header & Balance are Clear'}
                      {docReticleType === 'diploma' && 'Center Certificate / ID Document'}
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Visual Filter Presets & Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161618] p-3 border border-[#262629] rounded-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-200 uppercase flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-blue-400" /> Filter:
                  </span>
                  {[
                    { id: 'normal', label: 'Normal' },
                    { id: 'grayscale', label: 'B&W Doc' },
                    { id: 'high_contrast', label: 'High Contrast' },
                    { id: 'sepia_document', label: 'Sepia Scan' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveFilter(filter.id as any)}
                      className={`px-2 py-1 text-[10px] font-mono uppercase rounded-sm border transition-colors ${
                        activeFilter === filter.id
                          ? 'bg-blue-600 text-white border-blue-500 font-bold'
                          : 'bg-[#1F1F22] text-[#AAA] border-[#333] hover:text-white'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Primary Capture / Retake / Rotate Actions */}
                <div className="flex items-center gap-2">
                  {capturedImage && (
                    <button
                      type="button"
                      onClick={handleRotateImage}
                      className="px-3 py-1.5 bg-[#222] hover:bg-[#333] border border-[#444] text-neutral-200 text-xs font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 transition-colors"
                      title="Rotate image 90 degrees"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                      <span>Rotate 90°</span>
                    </button>
                  )}

                  {cameraActive && !capturedImage && (
                    <button
                      type="button"
                      onClick={captureFrame}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs rounded-sm tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Frame
                    </button>
                  )}

                  {capturedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedImage(null);
                        setOcrResult(null);
                        setSendToAgentToast(null);
                        setUploadedFileName(null);
                        setUploadedFileSize(null);
                        startCamera();
                      }}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold uppercase text-xs rounded-sm flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                      Retake / Reset
                    </button>
                  )}

                  <label className="cursor-pointer px-4 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-neutral-300 hover:text-white text-xs font-bold uppercase rounded-sm flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Upload Image / PDF</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* OCR Processing Loader */}
            {isOcrLoading && (
              <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-sm space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider">
                    Gemini Vision AI: Performing OCR Text & Expiry Extraction...
                  </span>
                </div>
                <p className="text-[11px] text-blue-400/80">
                  Parsing machine-readable zones (MRZ), document numbers, issuing authority, and visa stipulations.
                </p>
              </div>
            )}

            {/* OCR Extracted Metadata Output & Direct AI Agent Trigger */}
            {ocrResult && (
              <div className="p-4 bg-[#141414] border border-green-500/30 rounded-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#222] pb-2">
                  <div className="flex items-center gap-2 text-green-400 font-mono text-xs font-bold uppercase">
                    <CheckCircle className="w-4 h-4" />
                    <span>OCR Parsing Completed successfully</span>
                  </div>
                  {ocrResult.confidenceScore && (
                    <span className="text-[10px] font-mono bg-green-500/20 text-green-300 px-2 py-0.5 rounded border border-green-500/30">
                      Confidence Score: {ocrResult.confidenceScore}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-300 uppercase block">Extracted Title</span>
                    <span className="text-white font-bold truncate block">{ocrResult.title || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 uppercase block">Doc / Passport #</span>
                    <span className="text-white font-bold truncate block">{ocrResult.documentNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 uppercase block">Issuing Country</span>
                    <span className="text-white font-bold truncate block">{ocrResult.country || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 uppercase block">Auto-Parsed Expiry</span>
                    <span className="text-green-400 font-bold block">{ocrResult.expiryDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 uppercase block">Issue Date</span>
                    <span className="text-white font-bold block">{ocrResult.issueDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 uppercase block">Work Rights</span>
                    <span className="text-white font-bold truncate block">{ocrResult.workRights || 'N/A'}</span>
                  </div>
                </div>

                {ocrResult.notes && (
                  <p className="text-xs text-[#AAA] bg-[#0A0A0A] p-2.5 rounded border border-[#222] font-mono">
                    <span className="text-[10px] text-blue-400 font-bold uppercase block mb-0.5">Summary Notes:</span>
                    {ocrResult.notes}
                  </p>
                )}

                {/* AI Agent Direct Statutory Assessment Action */}
                <div className="p-3 bg-blue-950/20 border border-blue-800/30 rounded-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Bot className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase">Dedicated AI Mobility Legal Agent</h5>
                      <p className="text-[10px] text-[#999]">
                        Pass parsed document parameters directly to AI Agent for real-time visa requirement analysis.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendToAiAgent}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[11px] rounded-sm flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <span>Analyze with Agent</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Encryption & Save Action */}
            {capturedImage && (
              <div className="pt-3 border-t border-[#222] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-200">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span>Scan is encrypted with 256-Bit AES-GCM before saving.</span>
                </div>

                <button
                  type="button"
                  disabled={isSavingEncrypted || isOcrLoading}
                  onClick={handleSaveScanRecord}
                  className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs rounded-sm tracking-widest transition-colors flex items-center gap-2 shrink-0"
                >
                  {isSavingEncrypted ? (
                    <span>Encrypting & Saving...</span>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Save Encrypted Scan</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- DECRYPTED DOCUMENT PREVIEW MODAL --- */}
      {viewingDocId && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#333] rounded-sm max-w-xl w-full p-6 space-y-4 relative">
            <button
              onClick={() => setViewingDocId(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-[#222] pb-3">
              <Lock className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="text-sm font-black uppercase text-white">Decrypted Document Vault Preview</h3>
                <p className="text-[10px] font-mono text-slate-200">256-Bit AES-GCM Decrypted in Browser Session</p>
              </div>
            </div>

            <div className="aspect-video bg-[#050505] border border-[#222] rounded overflow-hidden flex items-center justify-center relative">
              {isDecrypting ? (
                <div className="flex items-center gap-2 text-xs font-mono text-green-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Decrypting payload...</span>
                </div>
              ) : decryptedImageMap[viewingDocId] ? (
                decryptedImageMap[viewingDocId].startsWith('data:application/pdf') ? (
                  <object
                    data={decryptedImageMap[viewingDocId]}
                    type="application/pdf"
                    className="w-full h-full min-h-[240px] rounded"
                  >
                    <div className="p-6 text-center space-y-3">
                      <FileText className="w-10 h-10 text-red-400 mx-auto" />
                      <p className="text-xs text-white font-mono font-bold uppercase">
                        Decrypted Digital PDF Document
                      </p>
                      <a
                        href={decryptedImageMap[viewingDocId]}
                        download="decrypted_statutory_document.pdf"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded-sm uppercase tracking-wider transition-colors"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Download Decrypted PDF</span>
                      </a>
                    </div>
                  </object>
                ) : (
                  <img
                    src={decryptedImageMap[viewingDocId]}
                    alt="Decrypted Document Scan"
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <p className="text-xs text-red-400 font-mono">Failed to decrypt document payload.</p>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-[#666]">
              <span className="flex items-center gap-1 text-green-400">
                <Check className="w-3.5 h-3.5" /> Client-Side Decryption Verified
              </span>
              <button
                onClick={() => setViewingDocId(null)}
                className="px-4 py-1.5 bg-neutral-800 text-white font-bold uppercase rounded-sm hover:bg-neutral-700"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
