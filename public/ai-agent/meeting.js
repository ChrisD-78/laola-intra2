// Meeting Recorder & Protocol Generator

class MeetingRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.startTime = null;
        this.timerInterval = null;
        this.audioContext = null;
        this.analyser = null;
        this.visualizerInterval = null;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.setDefaultDate();
    }

    initializeElements() {
        this.recordBtn = document.getElementById('recordBtn');
        this.timer = document.getElementById('timer');
        this.recordStatus = document.getElementById('recordStatus');
        this.visualizer = document.getElementById('visualizer');
        this.transcriptCard = document.getElementById('transcriptCard');
        this.transcriptBox = document.getElementById('transcriptBox');
        this.protocolCard = document.getElementById('protocolCard');
        this.protocolBox = document.getElementById('protocolBox');
        this.loader = document.getElementById('loader');
        this.loaderText = document.getElementById('loaderText');
        
        // Meeting Info
        this.meetingTitle = document.getElementById('meetingTitle');
        this.meetingDate = document.getElementById('meetingDate');
        this.meetingParticipants = document.getElementById('meetingParticipants');
        
        // Protocol Actions
        this.copyProtocolBtn = document.getElementById('copyProtocolBtn');
        this.editProtocolBtn = document.getElementById('editProtocolBtn');
        this.sendProtocolBtn = document.getElementById('sendProtocolBtn');
        this.protocolEmail = document.getElementById('protocolEmail');
    }

    initializeEventListeners() {
        this.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.copyProtocolBtn.addEventListener('click', () => this.copyProtocol());
        this.editProtocolBtn.addEventListener('click', () => this.editProtocol());
        this.sendProtocolBtn.addEventListener('click', () => this.sendProtocol());
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        this.meetingDate.value = today;
    }

    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.startTime = Date.now();
            
            // UI Updates
            this.recordBtn.classList.add('recording');
            this.recordBtn.innerHTML = '⏹️';
            this.recordStatus.textContent = 'Aufnahme läuft... Klicken Sie erneut zum Stoppen';
            this.visualizer.style.display = 'block';
            
            // Timer starten
            this.startTimer();
            
            // Visualizer starten
            this.startVisualizer(stream);
            
            showToast('Aufnahme gestartet', 'success');
            
        } catch (error) {
            console.error('Fehler beim Zugriff auf Mikrofon:', error);
            showToast('Mikrofonzugriff verweigert oder nicht verfügbar', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Stoppe alle Streams
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            // UI Updates
            this.recordBtn.classList.remove('recording');
            this.recordBtn.classList.add('processing');
            this.recordBtn.innerHTML = '⏳';
            this.recordBtn.disabled = true;
            this.recordStatus.textContent = 'Verarbeite Aufnahme...';
            
            // Timer stoppen
            clearInterval(this.timerInterval);
            
            // Visualizer stoppen
            this.stopVisualizer();
            
            showToast('Aufnahme gestoppt, verarbeite...', 'info');
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            this.timer.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            this.timer.classList.add('recording');
        }, 1000);
    }

    startVisualizer(stream) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);
        this.analyser.fftSize = 256;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Erstelle Bars
        this.visualizer.innerHTML = '';
        const numBars = 50;
        for (let i = 0; i < numBars; i++) {
            const bar = document.createElement('div');
            bar.className = 'audio-bar';
            bar.style.left = `${(i / numBars) * 100}%`;
            this.visualizer.appendChild(bar);
        }
        
        const bars = this.visualizer.querySelectorAll('.audio-bar');
        
        const animate = () => {
            if (!this.isRecording) return;
            
            this.analyser.getByteFrequencyData(dataArray);
            
            bars.forEach((bar, index) => {
                const dataIndex = Math.floor((index / numBars) * bufferLength);
                const value = dataArray[dataIndex];
                const height = (value / 255) * 100;
                bar.style.height = `${height}%`;
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    stopVisualizer() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.visualizer.style.display = 'none';
    }

    async processRecording() {
        this.loader.style.display = 'block';
        this.loaderText.textContent = 'Transkribiere Audio...';
        
        try {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            
            const result = await this.transcribeAndProtocol(audioBlob);
            
            this.displayResults(result);
            
            showToast('Meeting erfolgreich verarbeitet!', 'success');
            
        } catch (error) {
            console.error('Fehler bei der Verarbeitung:', error);
            showToast('Fehler bei der Verarbeitung: ' + error.message, 'error');
        } finally {
            this.loader.style.display = 'none';
            this.recordBtn.classList.remove('processing');
            this.recordBtn.innerHTML = '🎙️';
            this.recordBtn.disabled = false;
            this.timer.classList.remove('recording');
        }
    }

    async transcribeAndProtocol(audioBlob) {
        const meetingInfo = {
            title: this.meetingTitle.value || 'Meeting',
            date: this.meetingDate.value,
            participants: this.meetingParticipants.value || 'Nicht angegeben'
        };
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'meeting.webm');
        formData.append('meetingInfo', JSON.stringify(meetingInfo));
        
        const response = await fetch('/api/ai-agent/process-meeting', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Verarbeitung fehlgeschlagen');
        }
        
        return await response.json();
    }

    displayResults(result) {
        this.transcriptCard.style.display = 'block';
        this.transcriptBox.textContent = result.transcript;
        
        this.protocolCard.style.display = 'block';
        this.protocolBox.textContent = result.protocol;
        
        this.transcriptCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    copyProtocol() {
        const text = this.protocolBox.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Protokoll kopiert', 'success');
            this.copyProtocolBtn.innerHTML = '<span>✓</span> Kopiert';
            setTimeout(() => {
                this.copyProtocolBtn.innerHTML = '<span>📋</span> Protokoll kopieren';
            }, 2000);
        }).catch(() => {
            showToast('Kopieren fehlgeschlagen', 'error');
        });
    }

    editProtocol() {
        if (this.protocolBox.contentEditable === 'true') {
            this.protocolBox.contentEditable = 'false';
            this.protocolBox.style.border = '2px solid var(--primary-color)';
            this.editProtocolBtn.innerHTML = '<span>✏️</span> Bearbeiten';
            showToast('Änderungen gespeichert', 'success');
        } else {
            this.protocolBox.contentEditable = 'true';
            this.protocolBox.style.border = '2px solid var(--success-color)';
            this.protocolBox.focus();
            this.editProtocolBtn.innerHTML = '<span>💾</span> Speichern';
            showToast('Bearbeitungsmodus aktiv', 'info');
        }
    }

    async sendProtocol() {
        const email = this.protocolEmail.value.trim();
        
        if (!email) {
            showToast('Bitte E-Mail-Adresse eingeben', 'error');
            this.protocolEmail.focus();
            return;
        }
        
        const protocol = this.protocolBox.textContent;
        const meetingTitle = this.meetingTitle.value || 'Meeting';
        
        this.sendProtocolBtn.disabled = true;
        this.sendProtocolBtn.innerHTML = '<span>⏳</span> Sende...';
        
        const htmlProtocol = protocol.replace(/\n/g, '<br>');
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: email,
                    subject: `Meeting-Protokoll: ${meetingTitle}`,
                    html: htmlProtocol,
                    text: protocol
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'E-Mail-Versand fehlgeschlagen');
            }
            
            showToast(`Protokoll erfolgreich an ${email} gesendet!`, 'success');
            this.sendProtocolBtn.innerHTML = '<span>✓</span> Gesendet';
            
            setTimeout(() => {
                this.sendProtocolBtn.innerHTML = '<span>📧</span> Protokoll senden';
                this.sendProtocolBtn.disabled = false;
            }, 3000);
            
        } catch (error) {
            console.error('Fehler beim Versand:', error);
            showToast('Fehler beim Versand: ' + error.message, 'error');
            this.sendProtocolBtn.innerHTML = '<span>📧</span> Protokoll senden';
            this.sendProtocolBtn.disabled = false;
        }
    }
}

// Toast Funktion
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialisieren
const recorder = new MeetingRecorder();
