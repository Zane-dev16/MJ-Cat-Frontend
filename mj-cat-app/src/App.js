import { useState, useRef } from 'react';
import { 
    Box, 
    TextField, 
    Card, 
    CardContent, 
    Container,
    Stack,
    Button,
    Typography
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Mic, Stop } from '@mui/icons-material';
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
    const [danceLevel, setDanceLevel] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [currentClip, setCurrentClip] = useState(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);

    const captureChunk = () => {
        const mediaRecorder = new MediaRecorder(streamRef.current);
        
        mediaRecorder.ondataavailable = (e) => {
            const url = URL.createObjectURL(e.data);
            setCurrentClip(url);
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 10000);
    };

    const startRecording = async () => {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        
        captureChunk();
        intervalRef.current = setInterval(captureChunk, 10000);
    };

    const stopRecording = () => {
        clearInterval(intervalRef.current);
        streamRef.current?.getTracks().forEach(track => track.stop());
        setIsRecording(false);
    };

    const getCatGif = () => {
        if (danceLevel === '') return catDefault;
        const level = parseFloat(danceLevel);
        if (isNaN(level) || level < 0 || level > 1) return catDefault;
        if (level <= 0.25) return catLow;
        if (level <= 0.5) return catMedium;
        if (level <= 0.75) return catHigh;
        return catMax;
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 1)) {
            setDanceLevel(value);
        }
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
                                <img
                                    src={getCatGif()}
                                    alt="Dancing cat"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        borderRadius: '16px',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                    }}
                                />

                                {/* 🎤 Audio Recorder */}
                                <Stack spacing={1} alignItems="center">
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Live preview (hehe last 10s)
                                    </Typography>
                                    <Stack direction="row" spacing={2}>
                                        {!isRecording ? (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<Mic />}
                                                onClick={startRecording}
                                            >
                                                Start
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                startIcon={<Stop />}
                                                onClick={stopRecording}
                                            >
                                                Stop
                                            </Button>
                                        )}
                                    </Stack>

                                    {currentClip && (
                                        <Box sx={{ mt: 1 }}>
                                            <audio controls src={currentClip} />
                                        </Box>
                                    )}
                                </Stack>

                                {/* 🎚️ Intensity Input */}
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Dance Intensity"
                                    placeholder="0.0 to 1.0"
                                    value={danceLevel}
                                    onChange={handleInputChange}
                                    inputProps={{
                                        step: 0.01,
                                        min: 0,
                                        max: 1,
                                        style: { textAlign: 'center', fontSize: '1.2rem' },
                                    }}
                                    helperText="Enter a value between 0 and 1"
                                    variant="outlined"
                                    color="primary"
                                />
                            </Stack>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        </ThemeProvider>
    );
}

