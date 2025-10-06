import { useState, useRef, useEffect } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Container,
    Stack,
    Typography,
    LinearProgress
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import catDefault from './assets/cat-default.gif';
import catLow from './assets/cat-low.gif';
import catMedium from './assets/cat-medium.gif';
import catHigh from './assets/cat-high.gif';
import catMax from './assets/cat-max.gif';

const theme = createTheme({
    palette: {
        primary: { main: '#9333ea' },
        secondary: { main: '#ec4899' },
    },
});

export default function DancingCat() {
    const [danceLevel, setDanceLevel] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [currentClip, setCurrentClip] = useState(null);
    const [audioData, setAudioData] = useState(new Array(20).fill(0));
    const [uploadStatus, setUploadStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);
    const progressIntervalRef = useRef(null);
    
    const ENDPOINT_URL = 'https://irellzane-mj-cat.hf.space/predict';

    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []);

    const startProgressBar = () => {
        setProgress(0);
        setIsProcessing(true);
        const startTime = Date.now();
        const duration = 10000; // 10 seconds

        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                clearInterval(progressIntervalRef.current);
            }
        }, 50);
    };

    const captureChunk = () => {
        const mediaRecorder = new MediaRecorder(streamRef.current, {
            mimeType: 'audio/webm'
        });
        
        startProgressBar();

        mediaRecorder.ondataavailable = async (e) => {
            const url = URL.createObjectURL(e.data);
            setCurrentClip(url);
            
            // Send audio to endpoint
            try {
                setUploadStatus('Uploading & Processing...');
                const formData = new FormData();
                formData.append('file', e.data, 'recording.webm');
                formData.append('timestamp', new Date().toISOString());
                
                const response = await fetch(ENDPOINT_URL, {
                    method: 'POST',
                    body: formData,
                });
                
                if (response.ok) {
                    const result = await response.json();
                    setUploadStatus('✓ Analysis complete!');
                    // Update dance level from probability value
                    if (result.probability !== undefined) {
                        setDanceLevel(result.probability);
                    }
                    
                    // Start next recording after receiving response
                    setIsProcessing(false);
                    setTimeout(() => setUploadStatus(''), 3000);
                    
                    // Schedule next chunk capture after response
                    if (isRecording) {
                        setTimeout(() => {
                            if (streamRef.current && streamRef.current.active) {
                                captureChunk();
                            }
                        }, 10000);
                    }
                } else {
                    setUploadStatus('✗ Upload failed');
                    setIsProcessing(false);
                    setTimeout(() => setUploadStatus(''), 3000);
                }
            } catch (error) {
                console.error('Upload error:', error);
                setUploadStatus('✗ Error: ' + error.message);
                setIsProcessing(false);
                setTimeout(() => setUploadStatus(''), 3000);
            }
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 10000);
    };

    const startRecording = async () => {
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true);
            
            // Setup audio analysis
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64;
            
            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            source.connect(analyserRef.current);
            
            // Start visualization
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            const visualize = () => {
                analyserRef.current.getByteFrequencyData(dataArray);
                setAudioData([...dataArray.slice(0, 20)]);
                animationRef.current = requestAnimationFrame(visualize);
            };
            visualize();
            
            captureChunk();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setUploadStatus('✗ Microphone access denied');
        }
    };

    const stopRecording = () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        streamRef.current?.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setAudioData(new Array(20).fill(0));
        setDanceLevel(0);
        setProgress(0);
        setIsProcessing(false);
    };

    const getCatGif = () => {
        if (!isRecording || danceLevel === 0) return catDefault;
        if (danceLevel <= 0.25) return catLow;
        if (danceLevel <= 0.5) return catMedium;
        if (danceLevel <= 0.75) return catHigh;
        return catMax;
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #e9d5ff 0%, #fbcfe8 50%, #e9d5ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                }}
            >
                <Container maxWidth="sm">
                    <Card elevation={8} sx={{ borderRadius: 6, overflow: 'visible' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={3} alignItems="center">
                                {/* 🐱 Dancing Cat */}
                                <Box sx={{ position: 'relative', width: '100%' }}>
                                    <img
                                        src={getCatGif()}
                                        alt="Dancing cat"
                                        style={{
                                            width: '100%',
                                            maxHeight: '300px',
                                            objectFit: 'contain',
                                            borderRadius: '16px',
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    
                                    {/* Loading Bar */}
                                    {isProcessing && (
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            bottom: 0, 
                                            left: 0, 
                                            right: 0,
                                            p: 2,
                                        }}>
                                            <Box sx={{ 
                                                background: 'rgba(255, 255, 255, 0.95)',
                                                borderRadius: 2,
                                                p: 1.5,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            }}>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        display: 'block', 
                                                        mb: 0.5, 
                                                        fontWeight: 600,
                                                        color: '#9333ea',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    Analyzing audio... {Math.round(progress)}%
                                                </Typography>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={progress} 
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        backgroundColor: '#e9d5ff',
                                                        '& .MuiLinearProgress-bar': {
                                                            background: 'linear-gradient(90deg, #9333ea 0%, #ec4899 100%)',
                                                            borderRadius: 3,
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                </Box>

                                {/* 🎤 Audio Visualizer */}
                                <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            height: '80px',
                                            width: '100%',
                                            cursor: 'pointer',
                                            p: 2,
                                            borderRadius: 2,
                                            background: isRecording 
                                                ? 'linear-gradient(135deg, #9333ea20 0%, #ec489920 100%)'
                                                : '#f3f4f6',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'scale(1.02)',
                                            }
                                        }}
                                        onClick={isRecording ? stopRecording : startRecording}
                                    >
                                        {audioData.map((value, i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    flex: 1,
                                                    height: isRecording ? `${Math.max(10, (value / 255) * 100)}%` : '20%',
                                                    background: isRecording
                                                        ? `linear-gradient(to top, #9333ea, #ec4899)`
                                                        : '#d1d5db',
                                                    borderRadius: '4px',
                                                    transition: 'height 0.1s ease, background 0.3s ease',
                                                }}
                                            />
                                        ))}
                                    </Box>
                                    
                                    <Typography variant="caption" color="text.secondary">
                                        {isRecording ? '🔴 Click to stop recording' : '🎤 Click to start recording'}
                                    </Typography>
                                    
                                    {uploadStatus && (
                                        <Typography 
                                            variant="caption" 
                                            color={uploadStatus.includes('✓') ? 'success.main' : uploadStatus.includes('✗') ? 'error.main' : 'info.main'}
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            {uploadStatus}
                                        </Typography>
                                    )}
                                </Stack>

                                {/* 📊 Dance Level Display */}
                                {isRecording && danceLevel > 0 && (
                                    <Box sx={{ textAlign: 'center', width: '100%' }}>
                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                    Dance Level: {(danceLevel * 100).toFixed(0)}%
                                    </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
