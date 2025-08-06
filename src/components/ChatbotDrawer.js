// src/components/ChatbotDrawer.js
import React, { useState, useRef, useEffect } from 'react';
import { Box, Drawer, Typography, TextField, IconButton, Avatar, Paper, Divider, Alert, useTheme, Chip, Button } from '@mui/material';
import { keyframes } from '@mui/system';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import LanguageIcon from '@mui/icons-material/Language';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const slideIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const dotPulse = keyframes`0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); }`;

const TypingIndicator = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: '52px', mb: 2 }}>
        <Box sx={{ width: 8, height: 8, bgcolor: 'grey.400', borderRadius: '50%', animation: `${dotPulse} 1.4s infinite ease-in-out both`, animationDelay: '0s' }} />
        <Box sx={{ width: 8, height: 8, bgcolor: 'grey.400', borderRadius: '50%', ml: 0.5, animation: `${dotPulse} 1.4s infinite ease-in-out both`, animationDelay: '0.2s' }} />
        <Box sx={{ width: 8, height: 8, bgcolor: 'grey.400', borderRadius: '50%', ml: 0.5, animation: `${dotPulse} 1.4s infinite ease-in-out both`, animationDelay: '0.4s' }} />
    </Box>
);

const MarkdownComponents = {
    p: ({ node, ...props }) => <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }} {...props} />,
    strong: ({ node, ...props }) => <Typography component="span" fontWeight="bold" {...props} />,
    li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }}><Typography variant="body2" component="span" {...props} /></li>,
    ol: ({ node, ...props }) => <ol style={{ paddingLeft: '20px', margin: 0 }} {...props} />,
    ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', margin: 0 }} {...props} />,
    code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
            <SyntaxHighlighter style={vscDarkPlus} PreTag="div" language={match[1]} {...props}>
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        ) : (
            <code style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '2px 4px', borderRadius: '4px' }} {...props}>{children}</code>
        );
    }
};

const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
];

const ChatbotDrawer = ({ open, onClose, user }) => {
    const theme = useTheme();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (open) {
            const savedLang = localStorage.getItem('krishimitra_chat_language');
            if (savedLang) {
                setLanguage(savedLang);
                setMessages([{ role: 'model', parts: [{ text: `Hello! Welcome back. How can I help you in ${supportedLanguages.find(l => l.code === savedLang)?.name || 'your selected language'}?` }] }]);
            } else {
                setMessages([{ role: 'model', parts: [{ text: 'Hello! I am KrishiMitra. Please select your preferred language to continue.' }] }]);
            }
        }
    }, [open]);

    const handleLanguageSelect = (langCode) => {
        setLanguage(langCode);
        localStorage.setItem('krishimitra_chat_language', langCode);
        const langName = supportedLanguages.find(l => l.code === langCode)?.name || 'your selected language';
        setMessages(prev => [
            ...prev,
            { role: 'model', parts: [{ text: `Great! I will now speak with you in ${langName}. How can I help you today?` }] }
        ]);
    };

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
        const userMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        setError('');
        try {
            if (!API_KEY) throw new Error("API key is not set.");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const systemPrompt = `You are KrishiMitra, a friendly and helpful AI assistant for Indian farmers. Your goal is to provide clear, concise, and practical advice on agriculture, crop management, fertilizers, weather, and government schemes. Answer in a simple and encouraging tone. IMPORTANT: You MUST respond in the language with the ISO 639-1 code: '${language}'. For example, if the code is 'hi', respond in Hindi. If the code is 'kn', respond in Kannada.`;
            
            const chat = model.startChat({ history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Yes, I understand my instructions." }] },
                ...messages.slice(1).map(msg => ({ role: msg.role, parts: msg.parts }))
            ]});
            
            const result = await chat.sendMessageStream(currentInput);
            setIsLoading(false);
            let currentResponse = "";
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: "" }] }]);
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                currentResponse += chunkText;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].parts[0].text = currentResponse;
                    return newMessages;
                });
            }
        } catch (err) {
            setIsLoading(false);
            setError('Sorry, something went wrong. Please check your API key and try again.');
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: { xs: '100vw', sm: 400 }, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', mr: 1.5 }}><EnergySavingsLeafIcon /></Avatar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>KrishiMitra AI</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                    {messages.map((msg, index) => (
                        <Box key={index} sx={{ mb: 2, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: `${slideIn} 0.4s ease-out` }}>
                            {msg.role === 'model' && <Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', mr: 1.5, mt: 0.5 }}><EnergySavingsLeafIcon fontSize="small" /></Avatar>}
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 1.5, maxWidth: '85%', borderRadius: '20px',
                                    borderTopLeftRadius: msg.role === 'model' ? '4px' : '20px',
                                    borderTopRightRadius: msg.role === 'user' ? '4px' : '20px',
                                    bgcolor: msg.role === 'user' ? 'primary.main' : (theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800]),
                                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                                }}
                            >
                                <ReactMarkdown components={MarkdownComponents}>{msg.parts[0].text}</ReactMarkdown>
                            </Paper>
                             {msg.role === 'user' && (
                                <Avatar 
                                    sx={{ width: 40, height: 40, ml: 1.5, mt: 0.5, fontSize: '1rem', bgcolor: 'secondary.main' }}
                                    src={user?.photoURL}
                                >
                                    {user?.displayName?.charAt(0).toUpperCase()}
                                </Avatar>
                            )}
                        </Box>
                    ))}

                    {!language && messages.length > 0 && (
                        <Box sx={{ animation: `${slideIn} 0.4s ease-out` }}>
                            <Divider sx={{ my: 2 }}>Select Language</Divider>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                {supportedLanguages.map(lang => (
                                    <Chip key={lang.code} label={lang.name} onClick={() => handleLanguageSelect(lang.code)} clickable color="primary" variant="outlined" />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {isLoading && <TypingIndicator />}
                    {error && <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>}
                    <div ref={messagesEndRef} />
                </Box>
                
                <Divider />
                <Box component="form" sx={{ p: 1.5, display: 'flex', alignItems: 'center', bgcolor: 'background.paper' }} onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder={language ? "Ask a question..." : "Please select a language first"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading || !language}
                        onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        multiline
                        maxRows={4}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '25px' } }}
                    />
                    <IconButton color="primary" type="submit" disabled={isLoading || !input.trim()} sx={{ml: 1}}>
                        <SendIcon />
                    </IconButton>
                </Box>
                {language && (
                    <Box sx={{bgcolor: 'background.paper', textAlign: 'center', pb: 1}}>
                         <Button
                            size="small"
                            startIcon={<LanguageIcon />}
                            onClick={() => { setLanguage(null); localStorage.removeItem('krishimitra_chat_language'); setMessages([{ role: 'model', parts: [{ text: 'Please select your preferred language to continue.' }] }]); }}
                        >
                            Change Language
                        </Button>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
};

export default ChatbotDrawer;