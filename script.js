/* ==========================================================================
   TANOJ PERSONAL PORTFOLIO - CLIENT-SIDE CONTROLLER
   Drawer toggle, scroll-spy, subtle scroll reveals, and EmailJS form handling
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Selectors ---
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar a');
    const sections = document.querySelectorAll('section');
    const header = document.querySelector('header');
    
    // Contact Form Selectors
    const contactForm = document.querySelector('#contact-form');
    const nameInput = document.querySelector('#contact-name');
    const emailInput = document.querySelector('#contact-email');
    const subjectInput = document.querySelector('#contact-subject');
    const messageInput = document.querySelector('#contact-message');
    const submitBtn = document.querySelector('#contact-submit');
    const statusBox = document.querySelector('#contact-status');

    const nameError = document.querySelector('#name-error');
    const emailError = document.querySelector('#email-error');
    const subjectError = document.querySelector('#subject-error');
    const messageError = document.querySelector('#message-error');

    // --- 1. Mobile Drawer Toggle ---
    if (menuIcon && navbar) {
        menuIcon.addEventListener('click', () => {
            menuIcon.classList.toggle('fa-xmark');
            menuIcon.classList.toggle('fa-bars');
            navbar.classList.toggle('active');
        });

        // Close drawer when a nav link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuIcon.classList.remove('fa-xmark');
                menuIcon.classList.add('fa-bars');
                navbar.classList.remove('active');
            });
        });
    }

    // --- 2. Window Scroll: Sticky Header & ScrollSpy ---
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;

        // Sticky Header effect
        if (header) {
            header.classList.toggle('sticky', scrollPosition > 50);
        }

        // Active link scroll-spy
        sections.forEach(sec => {
            const top = sec.offsetTop - 150;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');

            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    const targetLink = document.querySelector(`.navbar a[href*='${id}']`);
                    if (targetLink) {
                        targetLink.classList.add('active');
                    }
                });
            }
        });
    });

    // --- 3. Subtle Section Reveal & Skill Bar Animation via IntersectionObserver ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        // Section Fade-In Observer
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Animate each section only once
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        document.querySelectorAll('.reveal-section').forEach(sec => {
            sectionObserver.observe(sec);
        });

        // Skills Indicator Bar Observer
        const skillsSection = document.querySelector('#skills');
        if (skillsSection) {
            const skillsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        skillsSection.classList.add('animate-bars');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2
            });
            skillsObserver.observe(skillsSection);
        }
    } else {
        // Fallback for reduced motion or non-supporting browsers
        document.querySelectorAll('.reveal-section').forEach(sec => sec.classList.add('visible'));
        const skillsSection = document.querySelector('#skills');
        if (skillsSection) skillsSection.classList.add('animate-bars');
    }

    // --- 4. Form Input Error Clearing ---
    function clearErrors() {
        if (nameError) nameError.textContent = '';
        if (emailError) emailError.textContent = '';
        if (subjectError) subjectError.textContent = '';
        if (messageError) messageError.textContent = '';

        [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
            if (input) input.classList.remove('input-error');
        });
    }

    [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                input.classList.remove('input-error');
                const errElem = document.querySelector(`#${input.id.replace('contact-', '')}-error`);
                if (errElem) errElem.textContent = '';
            });
        }
    });

    // --- 5. EmailJS Client-Side Contact Submission ---
    let lastSubmitTime = 0;

    const initialConfig = window.EMAILJS_CONFIG || {};
    const initPub = (initialConfig.VITE_EMAILJS_PUBLIC_KEY || '').trim();
    const initSrv = (initialConfig.VITE_EMAILJS_SERVICE_ID || '').trim();
    const initTmpl = (initialConfig.VITE_EMAILJS_TEMPLATE_ID || '').trim();
    const isConfiguredOnInit = Boolean(
        initPub && initSrv && initTmpl &&
        !initPub.includes('your_') &&
        !initSrv.includes('your_') &&
        !initTmpl.includes('your_')
    );

    const isDev = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '' ||
        window.location.protocol === 'file:'
    );

    // If configuration is missing in development mode, display warning
    if (isDev && !isConfiguredOnInit && statusBox) {
        statusBox.className = 'contact-status warning';
        statusBox.innerHTML = `<strong><i class="fa-solid fa-triangle-exclamation"></i> EmailJS Configuration Missing</strong><br>Please configure <code>VITE_EMAILJS_SERVICE_ID</code>, <code>VITE_EMAILJS_TEMPLATE_ID</code>, and <code>VITE_EMAILJS_PUBLIC_KEY</code> in your <code>.env</code> file (or <code>emailjs-config.js</code>) to enable direct message delivery to <strong>cse05b8@gmail.com</strong>.`;
        statusBox.style.display = 'block';
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();

            if (statusBox) {
                statusBox.style.display = 'none';
                statusBox.className = 'contact-status';
                statusBox.textContent = '';
            }

            let isValid = true;
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const subject = subjectInput.value.trim();
            const message = messageInput.value.trim();

            // Name validation
            if (!name) {
                nameError.textContent = 'Please enter your full name.';
                nameInput.classList.add('input-error');
                isValid = false;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email) {
                emailError.textContent = 'Please enter your email address.';
                emailInput.classList.add('input-error');
                isValid = false;
            } else if (!emailRegex.test(email)) {
                emailError.textContent = 'Please enter a valid email address.';
                emailInput.classList.add('input-error');
                isValid = false;
            }

            // Subject validation
            if (!subject) {
                subjectError.textContent = 'Please enter a subject.';
                subjectInput.classList.add('input-error');
                isValid = false;
            }

            // Message validation
            if (!message) {
                messageError.textContent = 'Please enter your message.';
                messageInput.classList.add('input-error');
                isValid = false;
            }

            if (!isValid) return;

            // Rate-limiting: prevent repeated rapid submissions (30s window)
            const now = Date.now();
            if (now - lastSubmitTime < 30000) {
                statusBox.className = 'contact-status warning';
                statusBox.innerHTML = `<strong><i class="fa-solid fa-clock"></i> Please wait a moment</strong><br>A message was submitted recently. Please wait a few seconds before sending another.`;
                statusBox.style.display = 'block';
                return;
            }

            // Retrieve consolidated EmailJS configuration
            const emailjsConfig = window.EMAILJS_CONFIG || {};
            const publicKey = (emailjsConfig.VITE_EMAILJS_PUBLIC_KEY || '').trim();
            const serviceId = (emailjsConfig.VITE_EMAILJS_SERVICE_ID || '').trim();
            const templateId = (emailjsConfig.VITE_EMAILJS_TEMPLATE_ID || '').trim();
            const ackTemplateId = (emailjsConfig.VITE_EMAILJS_ACK_TEMPLATE_ID || '').trim();

            // Detect development environment
            const isDev = Boolean(
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname === '' ||
                window.location.protocol === 'file:'
            );

            // Check if valid credentials are configured (not empty and not placeholders)
            const isEmailJSConfigured = Boolean(
                publicKey &&
                serviceId &&
                templateId &&
                !publicKey.includes('your_') &&
                !serviceId.includes('your_') &&
                !templateId.includes('your_')
            );

            if (!isEmailJSConfigured) {
                // Warning must not claim integration is ready when configuration is missing
                statusBox.className = isDev ? 'contact-status warning' : 'contact-status error';
                statusBox.innerHTML = isDev
                    ? `<strong><i class="fa-solid fa-triangle-exclamation"></i> EmailJS Configuration Missing</strong><br>Please configure <code>VITE_EMAILJS_SERVICE_ID</code>, <code>VITE_EMAILJS_TEMPLATE_ID</code>, and <code>VITE_EMAILJS_PUBLIC_KEY</code> in your <code>.env</code> file (or <code>emailjs-config.js</code>) to enable direct message delivery to <strong>cse05b8@gmail.com</strong>.`
                    : `<strong><i class="fa-solid fa-circle-xmark"></i> Unable to send your message. Please try again later.</strong>`;
                statusBox.style.display = 'block';
                return;
            }

            // Ensure EmailJS SDK is loaded
            if (typeof window.emailjs === 'undefined') {
                statusBox.className = 'contact-status error';
                statusBox.innerHTML = `<strong><i class="fa-solid fa-triangle-exclamation"></i> Unable to send your message. Please try again later.</strong>`;
                statusBox.style.display = 'block';
                return;
            }

            // Disable submit button and show loading state
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'inline-block';

            try {
                // Initialize EmailJS with public key
                window.emailjs.init({ publicKey: publicKey });

                // Template parameters mapped to form fields
                const templateParams = {
                    name: name,
                    from_name: name,
                    email: email,
                    from_email: email,
                    reply_to: email,
                    subject: subject,
                    message: message,
                    to_email: 'cse05b8@gmail.com'
                };

                // Dispatch contact message
                const response = await window.emailjs.send(serviceId, templateId, templateParams);

                if (response && (response.status === 200 || response.text === 'OK')) {
                    lastSubmitTime = Date.now();
                    statusBox.className = 'contact-status success';
                    statusBox.innerHTML = `<strong><i class="fa-solid fa-circle-check"></i> Your message has been sent successfully!</strong>`;
                    statusBox.style.display = 'block';
                    contactForm.reset();

                    // Optional Auto-Reply Acknowledgement Email to Visitor
                    if (ackTemplateId && !ackTemplateId.includes('your_') && ackTemplateId.trim().length > 0) {
                        const ackParams = {
                            name: name,
                            to_name: name,
                            to_email: email,
                            email: email,
                            reply_to: 'cse05b8@gmail.com',
                            subject: 'Thanks for contacting Tanoj!',
                            message: message
                        };

                        window.emailjs.send(serviceId, ackTemplateId, ackParams).catch(ackErr => {
                            console.warn('Note: Automatic visitor acknowledgement could not be sent:', ackErr);
                        });
                    }
                } else {
                    statusBox.className = 'contact-status error';
                    statusBox.innerHTML = `<strong><i class="fa-solid fa-circle-xmark"></i> Unable to send your message. Please try again later.</strong>`;
                    statusBox.style.display = 'block';
                    // Form is not reset on failure
                }
            } catch (err) {
                console.error('EmailJS Submission Error:', err);
                statusBox.className = 'contact-status error';
                statusBox.innerHTML = `<strong><i class="fa-solid fa-circle-xmark"></i> Unable to send your message. Please try again later.</strong>`;
                statusBox.style.display = 'block';
                // Form is not reset on failure
            } finally {
                submitBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline-block';
                if (btnLoader) btnLoader.style.display = 'none';
            }
        });
    }
});
