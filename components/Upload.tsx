import { PUTER_WORKER_URL, REDIRECT_DELAY_MS, PROGRESS_INTERVAL_MS, PROGRESS_STEP, MAX_FILE_SIZE, ACCEPTED_TYPES } from 'lib/constants'
import { CheckCircle2, ImageIcon, UploadIcon, XCircle } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router'

interface UploadProps {
    onComplete?: (file: string) => void
}

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [base64, setBase64] = useState<string | null>(null)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const { isSignedIn } = useOutletContext<AuthContext>();

    const processFile = (file: File) => {
        // Clear previous state
        setError(null)
        setFile(null)
        setBase64(null)
        setProgress(0)

        // Validation
        if (file.size > MAX_FILE_SIZE) {
            setError(`File is too large. Max size is 50MB.`)
            return
        }

        if (!ACCEPTED_TYPES.includes(file.type as any)) {
            setError(`Invalid file type. Only JPG and PNG are allowed.`)
            return
        }

        setFile(file)
        const reader = new FileReader();

        reader.onloadend = () => {
            setBase64(reader.result as string)
        }

        reader.readAsDataURL(file)
    }

    useEffect(() => {
        if (!base64) return;

        // Clear existing timers if any
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        let currentProgress = 0;

        intervalRef.current = setInterval(() => {
            currentProgress += PROGRESS_STEP;
            setProgress(currentProgress);

            if (currentProgress >= 100) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = null;

                timeoutRef.current = setTimeout(() => {
                    onComplete?.(base64);
                    timeoutRef.current = null;
                }, REDIRECT_DELAY_MS);
            }
        }, PROGRESS_INTERVAL_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            intervalRef.current = null;
            timeoutRef.current = null;
        }
    }, [base64, onComplete])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (!isSignedIn) return;

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;

        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    }

    return (
        <div className='upload'>
            {!file && !error ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className='drop-input'
                        accept=".jpg, .jpeg, .png"
                        disabled={!isSignedIn}
                        onChange={handleFileSelect}
                    />

                    <div className='drop-content'>
                        <div className='drop-icon'>
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ? (
                                "Click to upload or just drag and drop"
                            ) : ("Sign in or sign up with Puter to upload")}
                        </p>
                        <p className='help'>Maximum file size 50MB.</p>
                    </div>
                </div>
            ) : error ? (
                <div className='upload-status error'>
                    <div className='status-content'>
                        <div className='status-icon text-red-500'>
                            <XCircle className='icon' />
                        </div>
                        <h3 className='text-red-500'>Upload Failed</h3>
                        <p className='text-muted-foreground text-sm mt-2'>{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className='mt-4 text-sm font-medium hover:underline'
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            ) : (
                <div className='upload-status'>
                    <div className='status-content'>
                        <div className='status-icon'>
                            {progress === 100 ? (
                                <CheckCircle2 className='check' />
                            ) : (
                                <ImageIcon className='image' />
                            )}
                        </div>

                        <h3>{file?.name}</h3>
                        <div className='progress'>
                            <div className='bar' style={{ width: `${progress}%` }} />
                            <p className='status-text'>
                                {progress < 100 ? "Analysing Floor Plan..." : "Redirecting..."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Upload