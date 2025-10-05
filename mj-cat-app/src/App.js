import { useState } from 'react';
import { 
    Box, 
    TextField, 
    Card, 
    CardContent, 
    Container,
    Stack
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import catDefault from './assets/cat-default.gif';
import catLow from './assets/cat-low.gif';
import catMedium from './assets/cat-medium.gif';
import catHigh from './assets/cat-high.gif';
import catMax from './assets/cat-max.gif';

const theme = createTheme({
    palette: {
        primary: {
            main: '#9333ea',
        },
        secondary: {
            main: '#ec4899',
        },
    },
});

export default function DancingCat() {
    const [danceLevel, setDanceLevel] = useState('');

    const getCatGif = () => {
        if (danceLevel === '') {
            return catDefault;
        }

        const level = parseFloat(danceLevel);

        if (isNaN(level) || level < 0 || level > 1) {
            return catDefault;
        }

        if (level <= 0.25) {
            return catLow;
        } else if (level <= 0.5) {
            return catMedium;
        } else if (level <= 0.75) {
            return catHigh;
        } else {
            return catMax;
        }
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
                padding: 3,
        }}
        >
        <Container maxWidth="sm">
        <Card 
        elevation={8}
        sx={{ 
            borderRadius: 6,
                overflow: 'visible'
        }}
        >
        <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
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
                style: { textAlign: 'center', fontSize: '1.2rem' }
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
