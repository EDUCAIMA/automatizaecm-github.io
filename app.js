document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.setAttribute('aria-expanded', 'false');

    const toggleMenu = (forceState) => {
      const isOpen = !mobileMenu.hasAttribute('hidden');
      const shouldOpen = typeof forceState === 'boolean' ? forceState : !isOpen;

      if (shouldOpen === isOpen) return;

      if (shouldOpen) {
        mobileMenu.removeAttribute('hidden');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');
      } else {
        mobileMenu.setAttribute('hidden', '');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      }
    };

    // Close the mobile menu when a link is clicked or the viewport grows.
    mobileMenu.addEventListener('click', (event) => {
      if (event.target.matches('a')) {
        toggleMenu(false);
      }
    });

    hamburger.addEventListener('click', () => toggleMenu());

    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) {
        toggleMenu(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        toggleMenu(false);
      }
    });
  }

  const chatBox = document.getElementById('chatBox');
  const typing = document.getElementById('typing');

  if (chatBox && typing) {
    initDemoChat({ chatBox, typing });
  }

  const floatingChat = document.getElementById('floatingChat');
  const chatNudge = document.getElementById('chatNudge');
  const chatWidget = document.getElementById('chatWidget');
  const chatWidgetClose = document.getElementById('chatWidgetClose');
  const chatWidgetLog = document.getElementById('chatWidgetLog');
  const chatWidgetForm = document.getElementById('chatWidgetForm');
  const chatWidgetInput = document.getElementById('chatWidgetInput');

  if (
    floatingChat &&
    chatNudge &&
    chatWidget &&
    chatWidgetClose &&
    chatWidgetLog &&
    chatWidgetForm &&
    chatWidgetInput
  ) {
    initFloatingChat({
      floatingChat,
      chatNudge,
      chatWidget,
      chatWidgetClose,
      chatWidgetLog,
      chatWidgetForm,
      chatWidgetInput
    });
  }

  const leadForm = document.getElementById('leadForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

	  if (leadForm && formStatus && submitBtn) {
	    initLeadForm({ leadForm, formStatus, submitBtn });
	  }

	  initAutoplayVideos();
	  initAutoplayIframes();
	});

	function initAutoplayVideos() {
	  const videos = Array.from(document.querySelectorAll('video.autoplay-video'));
	  if (!videos.length) return;

	  const reducedMotionQuery =
	    typeof window !== 'undefined' && 'matchMedia' in window
	      ? window.matchMedia('(prefers-reduced-motion: reduce)')
	      : { matches: false };

	  const canObserve = typeof IntersectionObserver !== 'undefined';
	  if (!canObserve || reducedMotionQuery.matches) return;

	  const tryPlay = async (video) => {
	    try {
	      if (video.paused) {
	        await video.play();
	      }
	    } catch {
	      // Autoplay can be blocked; ignore silently.
	    }
	  };

	  const observer = new IntersectionObserver(
	    (entries) => {
	      entries.forEach((entry) => {
	        const video = entry.target;
	        if (!(video instanceof HTMLVideoElement)) return;

	        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
	          tryPlay(video);
	        } else {
	          if (!video.paused) video.pause();
	        }
	      });
	    },
	    { threshold: [0, 0.25, 1] }
	  );

	  videos.forEach((video) => observer.observe(video));
	}

	function initAutoplayIframes() {
	  const iframes = Array.from(document.querySelectorAll('iframe[data-autoplay-src]'));
	  if (!iframes.length) return;

	  const reducedMotionQuery =
	    typeof window !== 'undefined' && 'matchMedia' in window
	      ? window.matchMedia('(prefers-reduced-motion: reduce)')
	      : { matches: false };

	  const canObserve = typeof IntersectionObserver !== 'undefined';
	  if (!canObserve || reducedMotionQuery.matches) return;

	  const observer = new IntersectionObserver(
	    (entries) => {
	      entries.forEach((entry) => {
	        const iframe = entry.target;
	        if (!(iframe instanceof HTMLIFrameElement)) return;

	        if (!entry.isIntersecting || entry.intersectionRatio < 0.35) return;

	        const autoplaySrc = iframe.getAttribute('data-autoplay-src');
	        if (!autoplaySrc) return;

	        if (iframe.src !== autoplaySrc) {
	          iframe.src = autoplaySrc;
	        }

	        observer.unobserve(iframe);
	      });
	    },
	    { threshold: [0, 0.35, 1] }
	  );

	  iframes.forEach((iframe) => observer.observe(iframe));
	}

	function initLeadForm({ leadForm, formStatus, submitBtn }) {
	  const setStatus = (message, { isError = false } = {}) => {
	    formStatus.textContent = message || '';
	    formStatus.style.color = isError ? '#ff6b6b' : '';
  };

  const setLoading = (loading) => {
    submitBtn.disabled = Boolean(loading);
    submitBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
  };

  const params = new URLSearchParams(window.location.search);
  if (params.get('sent') === '1') {
    setStatus('¡Listo! Recibimos tu solicitud. Te contactaremos por WhatsApp.');
  }

  leadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('');

    const honey = leadForm.querySelector('input[name=\"_honey\"]');
    if (honey && honey.value.trim()) {
      leadForm.reset();
      setStatus('¡Listo! Recibimos tu solicitud. Te contactaremos por WhatsApp.');
      return;
    }

    if (!leadForm.checkValidity()) {
      leadForm.reportValidity();
      return;
    }

    const formData = new FormData(leadForm);
    const payload = Object.fromEntries(formData.entries());
    delete payload._honey;

    setLoading(true);
    setStatus('Enviando…');

    try {
      const res = await fetch('https://formsubmit.co/ajax/eduardo.caicedom@gmail.com', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      leadForm.reset();
      setStatus('¡Listo! Recibimos tu solicitud. Te contactaremos por WhatsApp.');
    } catch (err) {
      setStatus('No se pudo enviar automáticamente. Enviando por método alterno…', { isError: true });
      window.setTimeout(() => {
        leadForm.submit();
      }, 250);
    } finally {
      setLoading(false);
    }
  });
}

function initFloatingChat({
  floatingChat,
  chatNudge,
  chatWidget,
  chatWidgetClose,
  chatWidgetLog,
  chatWidgetForm,
  chatWidgetInput
}) {
  const reducedMotionQuery =
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false };

  const nudgeMessages = [
    '¿Te muestro una demo en 2 minutos?',
    'Escríbenos y te respondemos hoy.',
    '¿Quieres automatizar confirmaciones y recordatorios?',
    'Cuéntame tu especialidad y sede.'
  ];

  const botWelcome = 'Hola, soy el asistente. ¿Qué te gustaría automatizar: agenda, recordatorios o seguimiento?';

  let idx = 0;
  let intervalId = null;
  let hideTimeoutId = null;
  let autoOpenTimeoutId = null;
  let isOpen = false;
  let hasWelcomed = false;
  let hasAutoOpened = false;
  let userDismissed = false;

  const clearTimers = () => {
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;
    if (hideTimeoutId) window.clearTimeout(hideTimeoutId);
    hideTimeoutId = null;
    if (autoOpenTimeoutId) window.clearTimeout(autoOpenTimeoutId);
    autoOpenTimeoutId = null;
  };

  const hide = () => {
    chatNudge.classList.remove('is-visible');
  };

  const showNudge = (text) => {
    if (isOpen || document.hidden) return;
    if (hideTimeoutId) window.clearTimeout(hideTimeoutId);
    chatNudge.textContent = text;
    chatNudge.classList.add('is-visible');
    hideTimeoutId = window.setTimeout(() => hide(), reducedMotionQuery.matches ? 2500 : 4500);
  };

  const tickNudge = () => {
    showNudge(nudgeMessages[idx % nudgeMessages.length]);
    idx += 1;
  };

  const addBubble = (text, side) => {
    const bubble = document.createElement('div');
    bubble.className = `chat__bubble chat__bubble--${side}`;
    bubble.textContent = text;
    chatWidgetLog.appendChild(bubble);
    chatWidgetLog.scrollTop = chatWidgetLog.scrollHeight;
  };

  const addUser = (text) => addBubble(text, 'in');
  const addBot = (text) => addBubble(text, 'out');

  const botReplyFor = (rawText) => {
    const text = String(rawText || '').toLowerCase();
    if (/(precio|plan|paquete|costo|valor)/.test(text)) {
      return 'Tenemos paquetes Starter, Pro y Premium. ¿Cuántas sedes y especialidad tienes?';
    }
    if (/(agenda|cita|calend|turno)/.test(text)) {
      return 'Podemos agendar, confirmar y reprogramar por WhatsApp, conectado a calendario/CRM. ¿Qué herramienta usan hoy?';
    }
    if (/(recordatorio|confirm|inasist|ausenc)/.test(text)) {
      return 'Perfecto: automatizamos confirmación y recordatorios (24h/48h/1h). ¿Quieres que el paciente confirme con 1 toque?';
    }
    if (/(demo|prueba|muestra)/.test(text)) {
      return 'Claro. Déjame tu WhatsApp y te muestro el flujo funcionando.';
    }
    return 'Entiendo. ¿Me cuentas tu especialidad y qué problema quieres resolver primero?';
  };

  const addTyping = () => {
    const typing = document.createElement('div');
    typing.className = 'chat-widget__typing';
    typing.innerHTML =
      '<span class="typing" aria-hidden="true"><span class="typing__dot"></span><span class="typing__dot"></span><span class="typing__dot"></span></span><span class="sr-only">Escribiendo…</span>';
    chatWidgetLog.appendChild(typing);
    chatWidgetLog.scrollTop = chatWidgetLog.scrollHeight;
    return typing;
  };

  const openChat = ({ focusInput } = { focusInput: true }) => {
    if (isOpen) return;
    isOpen = true;
    hide();
    chatWidget.removeAttribute('hidden');
    if (!hasWelcomed) {
      hasWelcomed = true;
      addBot(botWelcome);
    }
    if (focusInput) chatWidgetInput.focus();
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;
  };

  const closeChat = () => {
    if (!isOpen) return;
    isOpen = false;
    chatWidget.setAttribute('hidden', '');
    userDismissed = true;
    startNudges();
  };

  const startNudges = () => {
    clearTimers();
    if (userDismissed) return;
    window.setTimeout(() => {
      tickNudge();
      intervalId = window.setInterval(tickNudge, 10000);
    }, 1200);

    if (!hasAutoOpened) {
      autoOpenTimeoutId = window.setTimeout(() => {
        if (document.hidden || userDismissed) return;
        hasAutoOpened = true;
        openChat({ focusInput: false });
      }, 10000);
    }
  };

  floatingChat.addEventListener('click', (event) => {
    event.preventDefault();
    if (isOpen) {
      chatWidgetInput.focus();
      return;
    }
    openChat({ focusInput: true });
  });

  chatWidgetClose.addEventListener('click', () => closeChat());

  chatWidgetForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = chatWidgetInput.value.trim();
    if (!text) return;
    chatWidgetInput.value = '';
    addUser(text);

    const typingEl = reducedMotionQuery.matches ? null : addTyping();
    const delay = reducedMotionQuery.matches ? 0 : 700;
    window.setTimeout(() => {
      if (typingEl) typingEl.remove();
      addBot(botReplyFor(text));
    }, delay);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeChat();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hide();
      return;
    }
    if (!isOpen) startNudges();
  });

  startNudges();
}

function initDemoChat({ chatBox, typing }) {
  const reducedMotionQuery =
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false };

  let runToken = null;
  let observer = null;
  let hasAutoStarted = false;
  const timeouts = new Set();
  let isInView = false;

  const sleep = (ms) =>
    new Promise((resolve) => {
      const delay = reducedMotionQuery.matches ? 0 : ms;
      if (delay === 0) return resolve();
      const t = window.setTimeout(() => {
        timeouts.delete(t);
        resolve();
      }, delay);
      timeouts.add(t);
    });

  const clearTimeouts = () => {
    timeouts.forEach((t) => window.clearTimeout(t));
    timeouts.clear();
  };

  const isActive = (token) => runToken === token;

  const scrollToBottom = () => {
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  const setTypingVisible = (visible) => {
    const shouldShow = Boolean(visible) && !reducedMotionQuery.matches;
    typing.classList.toggle('is-hidden', !shouldShow);
    typing.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    if (shouldShow) scrollToBottom();
  };

  const addBubble = (text, side) => {
    const bubble = document.createElement('div');
    bubble.className = `chat__bubble chat__bubble--${side}`;
    bubble.textContent = text;
    chatBox.appendChild(bubble);
    scrollToBottom();
  };

  const addUser = (text) => addBubble(text, 'in');
  const addBot = (text) => addBubble(text, 'out');

  const reset = () => {
    clearTimeouts();
    setTypingVisible(false);
    chatBox.innerHTML = '';
  };

  const script = [
    { side: 'in', text: 'Hola, ¿tienen cita para limpieza?' },
    { side: 'out', text: 'Sí. ¿Qué día te sirve: hoy o mañana?' },
    { side: 'in', text: 'Mañana en la tarde.' },
    { side: 'out', text: 'Perfecto. Tengo 3:00 pm, 4:30 pm o 5:00 pm. ¿Cuál prefieres?' },
    { side: 'in', text: '4:30 pm.' },
    {
      side: 'out',
      text: 'Listo. Quedó agendada para mañana 4:30 pm. Te llegará confirmación por WhatsApp y calendario.'
    },
    { side: 'out', text: 'También te enviamos recordatorio 1 hora antes.' },
    { side: 'in', text: 'Gracias.' }
  ];

  const stepMs = 1500;
  const typingMs = 850;

  const playOnce = async (token) => {
    reset();
    for (let i = 0; i < script.length; i += 1) {
      if (!isActive(token)) return;
      const step = script[i];

      if (i === 0) {
        addBubble(step.text, step.side);
        await sleep(stepMs);
        continue;
      }

      if (step.side === 'out' && !reducedMotionQuery.matches) {
        setTypingVisible(true);
        await sleep(Math.min(typingMs, stepMs));
        if (!isActive(token)) return;
        setTypingVisible(false);
        addBot(step.text);
        await sleep(Math.max(0, stepMs - typingMs));
        continue;
      }

      setTypingVisible(false);
      addBubble(step.text, step.side);
      await sleep(stepMs);
    }
  };

  const runLoop = async () => {
    const token = {};
    runToken = token;

    while (isInView && isActive(token)) {
      await playOnce(token);
      if (!isInView || !isActive(token)) return;
      await sleep(2500);
    }
  };

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;

      isInView = Boolean(entry.isIntersecting);
      if (!isInView) {
        runToken = {};
        reset();
        hasAutoStarted = false;
        return;
      }

      if (hasAutoStarted) return;
      hasAutoStarted = true;
      runLoop();
    },
    { threshold: 0.35 }
  );

  observer.observe(chatBox);
}

