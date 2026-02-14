import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, UserPlus } from 'lucide-react';
import { faceService } from '../services/face';
import { dbService } from '../services/db';
import type { Student } from '../services/db';
import { APP_CONFIG } from '../conf/config';
import MobileCamera from '../components/mobile/MobileCamera';

const MobileAttendance = () => {
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Form State
    const [selectedSubject, setSelectedSubject] = useState(APP_CONFIG.SUBJECTS[0]);

    useEffect(() => {
        loadModels();
        return () => {
            // Cleanup if needed
        };
    }, []);

    const loadModels = async () => {
        setMessage('Loading models...');
        const loaded = await faceService.loadModels();
        if (loaded) {
            setMessage('Ready to scan');
        } else {
            console.error("Model loading failed");
            setMessage('Failed to load models. Check console for details.');
        }
    };

    const handleImageCapture = async (imageData: string) => {
        setCapturedImage(imageData);
        setScanning(true);
        setStatus('idle');
        setMessage('Scanning...');

        try {
            // Create temporary image element for face detection
            const img = new Image();
            img.src = imageData;
            
            // Wait for image to load
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const descriptor = await faceService.getFaceDescriptor(img);

            if (!descriptor) {
                setStatus('error');
                setMessage('No face detected. Try again.');
                setScanning(false);
                return;
            }

            // Match against DB
            const students = await dbService.getAllStudents();
            let bestMatch: Student | null = null;
            let minDistance = 1.0;

            for (const student of students) {
                if (student.face_descriptor && student.face_descriptor.length > 0) {
                    const dist = faceService.calculateDistance(descriptor, new Float32Array(student.face_descriptor));
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestMatch = student;
                    }
                }
            }

            if (bestMatch && minDistance < APP_CONFIG.FACE_MATCH_THRESHOLD) {
                // Success
                setStatus('success');
                setMessage(`Marked: ${bestMatch.name}`);

                await dbService.markAttendance({
                    record_id: crypto.randomUUID(),
                    student_id: bestMatch.student_id,
                    name: bestMatch.name,
                    rollNumber: bestMatch.rollNumber || 'N/A',
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
                    subject: selectedSubject,
                    status: 'present',
                    synced: false
                });

            } else {
                setStatus('error');
                setMessage('Face not recognized.');
            }

        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Error during scan');
        } finally {
            setScanning(false);
            // Reset status after delay
            setTimeout(() => {
                if (status !== 'idle') setStatus('idle');
                setCapturedImage(null);
            }, 3000);
        }
    };

    // Registration Mock (for testing)
    const handleRegister = async () => {
        const rollNumber = prompt("Enter Student Roll Number:");
        if (!rollNumber) return;

        const name = prompt("Enter Student Name:");
        if (!name) return;

        // For registration, we still need the video approach
        // This would require a more complex implementation for mobile
        alert("Registration feature coming soon for mobile!");
    };

    return (
        <div className="mobile-attendance-page p-4">
            {/* Header */}
            <motion.div 
                className="text-center mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-gradient mb-2">Attendance Scanner</h1>
                <p className="text-gray-600">AI-powered facial recognition</p>
            </motion.div>

            <div className="mobile-card">
                <div className="flex items-center gap-3 mb-6">
                    <motion.div
                        className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl"
                        whileHover={{ scale: 1.1 }}
                    >
                        <Camera className="text-white" size={24} />
                    </motion.div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Mark Attendance</h2>
                        <p className="text-gray-600">Select subject and capture photo</p>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
                    <motion.select
                        className="mobile-input w-full"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {APP_CONFIG.SUBJECTS.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </motion.select>
                </div>

                {/* Camera Component */}
                <div className="mb-6">
                    <MobileCamera 
                        onCapture={handleImageCapture}
                        isCapturing={scanning}
                    />
                </div>

                {/* Preview of captured image */}
                {capturedImage && (
                    <motion.div 
                        className="mb-6 rounded-xl overflow-hidden border-2 border-gray-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <img 
                            src={capturedImage} 
                            alt="Captured for attendance"
                            className="w-full h-64 object-cover"
                        />
                    </motion.div>
                )}

                {/* Status Display */}
                <motion.div 
                    className="text-center mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className={`text-lg font-semibold transition-all duration-300 ${
                        status === 'success' ? 'text-green-600 scale-105' :
                        status === 'error' ? 'text-red-500 scale-105' : 'text-gray-700'
                    }`}>
                        {message}
                    </p>
                    {status === 'idle' && !capturedImage && (
                        <p className="text-sm text-gray-500 mt-2">Tap the camera button to capture attendance</p>
                    )}
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <motion.button 
                        onClick={handleRegister}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl hover:from-gray-300 hover:to-gray-400 text-gray-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <UserPlus size={20} />
                        <span className="font-medium">Register</span>
                    </motion.button>
                </div>

                {/* Tips */}
                <motion.div 
                    className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Ensure good lighting and clear face visibility for best results
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default MobileAttendance;