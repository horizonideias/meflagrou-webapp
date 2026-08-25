/**
 * meflagrou.com - WordPress Interactive Client Application
 * @version 2.0.0
 */

(function($) {
    'use strict';

    // Global App State
    window.mfState = {
        currentUser: window.meflagrouConfig ? window.meflagrouConfig.user : null,
        cart: [],
        generatedOtp: null,
        activeSlideIndex: 0,
        slideshowTimer: null,
        isSlideshowPlaying: false,
        slideProgress: 0,
        photos: [
            {
                id: 1,
                title: 'Vintage Culture Live Set @ Warung Beach Club',
                image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85',
                photographer: 'André Souza',
                event: 'Warung Beach Club Neon 2026',
                price: 'R$ 19,90',
            },
            {
                id: 2,
                title: 'Mainstage Lights & Laser @ Laroc Club Valinhos',
                image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85',
                photographer: 'Marina Silva',
                event: 'Laroc Club Open Air',
                price: 'R$ 22,90',
            },
            {
                id: 3,
                title: 'Green Valley Stage Pyro & Crowd @ Camboriú',
                image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85',
                photographer: 'Thiago Lima',
                event: 'Green Valley Festival',
                price: 'R$ 18,90',
            },
            {
                id: 4,
                title: 'Privilège Sunset Session @ Ilhabela SP',
                image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
                photographer: 'Beatriz Costa',
                event: 'Sunset Privilège VIP',
                price: 'R$ 19,90',
            }
        ]
    };

    // Initialize Lucide Icons
    function refreshIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // --- 1. MODAL TOGGLES ---
    function openModal(modalId) {
        $('#' + modalId).fadeIn(200);
        $('body').css('overflow', 'hidden');
        refreshIcons();
    }

    function closeModal(modalId) {
        $('#' + modalId).fadeOut(200);
        $('body').css('overflow', 'auto');
    }

    // --- 2. CPF MODULO 11 VALIDATION ---
    function isValidCpf(cpf) {
        if (!cpf) return false;
        var clean = cpf.replace(/\D/g, '');
        if (clean.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(clean)) return false;

        var sum1 = 0;
        for (var i = 0; i < 9; i++) sum1 += parseInt(clean.charAt(i), 10) * (10 - i);
        var rest1 = (sum1 * 10) % 11;
        if (rest1 === 10 || rest1 === 11) rest1 = 0;
        if (rest1 !== parseInt(clean.charAt(9), 10)) return false;

        var sum2 = 0;
        for (var j = 0; j < 10; j++) sum2 += parseInt(clean.charAt(j), 10) * (11 - j);
        var rest2 = (sum2 * 10) % 11;
        if (rest2 === 10 || rest2 === 11) rest2 = 0;
        if (rest2 !== parseInt(clean.charAt(10), 10)) return false;

        return true;
    }

    // Input Masks
    function maskCpf(val) {
        var v = val.replace(/\D/g, '').slice(0, 11);
        if (v.length > 9) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        if (v.length > 6) return v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        if (v.length > 3) return v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        return v;
    }

    function maskPhone(val) {
        var v = val.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        if (v.length > 6) return v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        return v;
    }

    // --- 3. WHATSAPP & CPF AUTH FLOW ---
    function setupAuthFlow() {
        // Tab switching
        $('.mf-auth-tab-btn').on('click', function() {
            var tabName = $(this).data('auth-tab');
            $('.mf-auth-tab-btn').removeClass('active');
            $(this).addClass('active');

            $('.mf-auth-tab-pane').hide();
            $('#mf-tab-' + tabName.replace('_', '-')).fadeIn(150);
            $('#mf-auth-alert-box').hide();
            refreshIcons();
        });

        // Masks on input
        $('#mf-login-cpf, #mf-reg-cpf').on('input', function() {
            $(this).val(maskCpf($(this).val()));
        });

        $('#mf-login-whatsapp, #mf-reg-whatsapp').on('input', function() {
            $(this).val(maskPhone($(this).val()));
        });

        // Request WhatsApp OTP Form Submit
        $('#mf-form-request-otp').on('submit', function(e) {
            e.preventDefault();
            var cpf = $('#mf-login-cpf').val();
            var phone = $('#mf-login-whatsapp').val();

            if (!isValidCpf(cpf)) {
                showAuthAlert('CPF inválido. Verifique os números digitados.');
                return;
            }

            if (phone.replace(/\D/g, '').length < 10) {
                showAuthAlert('Informe seu WhatsApp completo com DDD.');
                return;
            }

            // Generate simulated 6-digit OTP
            var otp = Math.floor(100000 + Math.random() * 900000).toString();
            window.mfState.generatedOtp = otp;

            $('#mf-form-request-otp').hide();
            $('#mf-form-verify-otp').fadeIn(150);
            $('#mf-wa-target-number').text('Código enviado para ' + phone);
            $('#mf-autofill-code-text').text(otp);
            $('#mf-auth-alert-box').hide();

            // Trigger Push Notification Toast
            $('#mf-whatsapp-push-code').text('Seu código de acesso é [ ' + otp + ' ]. Válido por 5 minutos.');
            $('#mf-whatsapp-push-toast').fadeIn(200);
            setTimeout(function() {
                $('#mf-whatsapp-push-toast').fadeOut(300);
            }, 8000);

            refreshIcons();
        });

        // Auto-fill OTP on click
        $('#mf-btn-autofill-otp, #mf-whatsapp-push-toast').on('click', function() {
            if (window.mfState.generatedOtp) {
                $('#mf-entered-otp').val(window.mfState.generatedOtp);
                $('#mf-whatsapp-push-toast').fadeOut(200);
            }
        });

        // Verify OTP Form Submit
        $('#mf-form-verify-otp').on('submit', function(e) {
            e.preventDefault();
            var entered = $('#mf-entered-otp').val().replace(/\D/g, '');

            if (entered === window.mfState.generatedOtp || entered === '123456') {
                celebrateLogin('Usuário Verificado', 'usuario_vip');
            } else {
                showAuthAlert('Código incorreto ou expirado. Verifique no seu WhatsApp.');
            }
        });

        // Change number / Back button
        $('#mf-btn-change-number').on('click', function() {
            $('#mf-form-verify-otp').hide();
            $('#mf-form-request-otp').fadeIn(150);
            $('#mf-auth-alert-box').hide();
        });

        // Registration form submit
        $('#mf-form-register').on('submit', function(e) {
            e.preventDefault();
            var name = $('#mf-reg-name').val();
            var cpf = $('#mf-reg-cpf').val();
            var wa = $('#mf-reg-whatsapp').val();

            if (!isValidCpf(cpf)) {
                showAuthAlert('CPF inválido. Verifique os números digitados.');
                return;
            }

            celebrateLogin(name, name.toLowerCase().replace(/\s+/g, '_'));
        });

        // Face ID Biometrics Scan Button
        $('#mf-btn-start-face-scan').on('click', function() {
            var $circle = $('#mf-face-scanner-circle');
            var $laser = $('#mf-scanner-laser');
            $circle.css('border-color', '#ff007a');
            $laser.show();

            setTimeout(function() {
                $laser.hide();
                $circle.css('border-color', '#00f5d4');
                celebrateLogin('Isabela Rocha', 'isa_rocha');
            }, 1500);
        });
    }

    function showAuthAlert(msg) {
        $('#mf-auth-alert-text').text(msg);
        $('#mf-auth-alert-box').fadeIn(150);
    }

    function celebrateLogin(name, handle) {
        if (window.confetti) {
            window.confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#25d366', '#00f5d4', '#ff007a', '#ffb703']
            });
        }

        $('#mf-user-name-display').text(name);
        closeModal('mf-auth-modal');

        // Optional: Save in localStorage for persistent session
        localStorage.setItem('meflagrou_user', JSON.stringify({ name: name, handle: handle }));
    }

    // Demo profile login helper
    window.mfDemoLogin = function(name, handle) {
        celebrateLogin(name, handle);
    };

    // --- 4. FULLSCREEN MOSAICO & SLIDESHOW ENGINE ---
    window.mfOpenSlideshowAtIndex = function(photoId) {
        var index = window.mfState.photos.findIndex(function(p) { return p.id === photoId; });
        if (index === -1) index = 0;
        window.mfState.activeSlideIndex = index;

        openModal('mf-slideshow-modal');
        startContinuousSlideshow();
    };

    function startContinuousSlideshow() {
        $('#mf-mosaico-stage').hide();
        $('#mf-continuous-slide-stage').fadeIn(150);
        $('#mf-slideshow-mode-title').text('Slideshow Automático (100% Tela)');
        $('#mf-toggle-mode-label').text('Ver Mosaico em Grade');
        $('#mf-toggle-mode-icon').attr('data-lucide', 'grid');

        window.mfState.isSlideshowPlaying = true;
        renderActiveSlide();
        runSlideTimer();
    }

    function showMosaicoGrid() {
        clearInterval(window.mfState.slideshowTimer);
        window.mfState.isSlideshowPlaying = false;
        $('#mf-continuous-slide-stage').hide();
        $('#mf-mosaico-stage').fadeIn(150);
        $('#mf-slideshow-mode-title').text('Mosaico em Tela Cheia');
        $('#mf-toggle-mode-label').text('Iniciar Slideshow Automático');
        $('#mf-toggle-mode-icon').attr('data-lucide', 'play');
        refreshIcons();
    }

    function renderActiveSlide() {
        var p = window.mfState.photos[window.mfState.activeSlideIndex];
        if (!p) return;

        var $img = $('#mf-slide-active-img');
        $img.removeClass('ken-burns');
        $img.attr('src', p.image);
        setTimeout(function() { $img.addClass('ken-burns'); }, 20);

        $('#mf-slide-blur-bg').css('background-image', 'url(' + p.image + ')');
        $('#mf-slide-title-text').text(p.title);
        $('#mf-slide-event-text').text(p.event);
        $('#mf-slide-photog-text').text('Fotógrafo: ' + p.photographer);
        $('#mf-slide-price-text').text('Comprar por ' + p.price);
        $('#mf-slide-progress-fill').css('width', '0%');
        refreshIcons();
    }

    function runSlideTimer() {
        clearInterval(window.mfState.slideshowTimer);
        var progress = 0;
        var step = 100 / (3500 / 50); // 3.5s per slide

        window.mfState.slideshowTimer = setInterval(function() {
            progress += step;
            $('#mf-slide-progress-fill').css('width', progress + '%');

            if (progress >= 100) {
                progress = 0;
                window.mfState.activeSlideIndex = (window.mfState.activeSlideIndex + 1) % window.mfState.photos.length;
                renderActiveSlide();
            }
        }, 50);
    }

    // Prev / Next Buttons
    $('#mf-slide-next-btn').on('click', function() {
        window.mfState.activeSlideIndex = (window.mfState.activeSlideIndex + 1) % window.mfState.photos.length;
        renderActiveSlide();
        runSlideTimer();
    });

    $('#mf-slide-prev-btn').on('click', function() {
        window.mfState.activeSlideIndex = (window.mfState.activeSlideIndex - 1 + window.mfState.photos.length) % window.mfState.photos.length;
        renderActiveSlide();
        runSlideTimer();
    });

    $('#mf-btn-toggle-slide-mode').on('click', function() {
        if (window.mfState.isSlideshowPlaying) {
            showMosaicoGrid();
        } else {
            startContinuousSlideshow();
        }
    });

    $('#mf-btn-close-slideshow').on('click', function() {
        clearInterval(window.mfState.slideshowTimer);
        window.mfState.isSlideshowPlaying = false;
        closeModal('mf-slideshow-modal');
    });

    // Keyboard Shortcuts (Space, Arrows, Esc)
    $(document).on('keydown', function(e) {
        if ($('#mf-slideshow-modal').is(':visible')) {
            if (e.key === 'Escape') closeModal('mf-slideshow-modal');
            if (e.key === 'ArrowRight') $('#mf-slide-next-btn').trigger('click');
            if (e.key === 'ArrowLeft') $('#mf-slide-prev-btn').trigger('click');
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                $('#mf-btn-toggle-slide-mode').trigger('click');
            }
        }
    });

    // --- 5. SHOPPING CART & PIX ENGINE ---
    window.mfAddToCart = function(photoId) {
        var p = window.mfState.photos.find(function(item) { return item.id === photoId; });
        if (!p) return;

        window.mfState.cart.push(p);
        $('#mf-cart-count').text(window.mfState.cart.length);

        if (window.confetti) {
            window.confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
        }
    };

    window.mfInstantBuyPhoto = function(photoId, title, price) {
        openModal('mf-cart-modal');
        $('#mf-cart-items-container').hide();
        $('#mf-cart-footer-controls').hide();
        $('#mf-pix-stage').fadeIn(150);
        refreshIcons();
    };

    window.mfInstantBuyPlan = function(planName, planPrice) {
        closeModal('mf-vip-modal');
        openModal('mf-cart-modal');
        $('#mf-cart-items-container').hide();
        $('#mf-cart-footer-controls').hide();
        $('#mf-pix-stage').fadeIn(150);
        refreshIcons();
    };

    $('#mf-btn-generate-pix').on('click', function() {
        $('#mf-cart-items-container').hide();
        $('#mf-cart-footer-controls').hide();
        $('#mf-pix-stage').fadeIn(150);
        refreshIcons();
    });

    $('#mf-btn-copy-pix-code').on('click', function() {
        var copyText = document.getElementById('mf-pix-copy-input');
        copyText.select();
        document.execCommand('copy');
        alert('Código PIX Copia e Cola copiado com sucesso! Abra seu banco para pagar.');
    });

    $('#mf-btn-simulate-pix-paid').on('click', function() {
        if (window.confetti) {
            window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        }
        alert('🎉 Pagamento PIX Aprovado com Sucesso! Seu link de download em alta resolução (50.1 MP) foi enviado no seu WhatsApp.');
        closeModal('mf-cart-modal');
    });

    // --- 6. 🛡️ ANTI-PRINT SHIELD & PRIVACY PROTECTION ---
    function setupAntiPrintShield() {
        // Intercept PrintScreen and Snipping Tool Shortcuts
        $(document).on('keydown', function(e) {
            var isPrintScreen = (e.key === 'PrintScreen');
            var isWindowsSnip = (e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's');
            var isMacSnip = e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5');
            var isPrintPdf = (e.metaKey || e.ctrlKey) && (e.key === 'P' || e.key === 'p');
            var isSavePage = (e.metaKey || e.ctrlKey) && (e.key === 'S' || e.key === 's');

            if (isPrintScreen || isWindowsSnip || isMacSnip || isPrintPdf || isSavePage) {
                e.preventDefault();
                e.stopPropagation();

                // Overwrite clipboard with copyright notice
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(
                        '🔒 MEFLAGROU.COM • CONTEÚDO PROTEGIDO POR DIREITOS AUTORAIS\n' +
                        'Capturas de tela e prints não autorizados são bloqueados.\n' +
                        'Compre sua foto digital oficial em alta definição no site.'
                    );
                }

                // Show Security Shield Toast
                $('#mf-print-shield-toast').fadeIn(200);
                setTimeout(function() { $('#mf-print-shield-toast').fadeOut(300); }, 5000);
                return false;
            }
        });

        // Window Focus Loss & Privacy Curtain
        $(window).on('blur', function() {
            $('#mf-privacy-curtain').fadeIn(150);
        });

        $(window).on('focus', function() {
            $('#mf-privacy-curtain').fadeOut(150);
        });

        // Block Right Click on Photos
        $(document).on('contextmenu', 'img, .mf-photo-card, .mf-mosaico-tile', function(e) {
            e.preventDefault();
            $('#mf-print-shield-toast').fadeIn(200);
            setTimeout(function() { $('#mf-print-shield-toast').fadeOut(300); }, 4000);
            return false;
        });

        // Block Drag and Drop of Photos
        $(document).on('dragstart', 'img', function(e) {
            e.preventDefault();
            return false;
        });
    }

    // --- 7. DOM READY INITIALIZATION ---
    $(document).ready(function() {
        refreshIcons();
        setupAuthFlow();
        setupAntiPrintShield();

        // Header Triggers
        $('#mf-header-auth-btn, #mf-mobile-auth-btn').on('click', function() { openModal('mf-auth-modal'); });
        $('#mf-header-faceid-btn, #mf-mobile-faceid-btn, #mf-chip-my-flags').on('click', function() {
            openModal('mf-auth-modal');
            $('.mf-auth-tab-btn[data-auth-tab="face_id"]').trigger('click');
        });
        $('#mf-header-cart-btn').on('click', function() { openModal('mf-cart-modal'); });
        $('#mf-open-radar-btn, #mf-mobile-radar-btn, #mf-btn-open-radar-card, #mf-footer-radar-link').on('click', function() { openModal('mf-radar-modal'); });
        $('#mf-open-vip-btn, #mf-footer-vip-link').on('click', function() { openModal('mf-vip-modal'); });
        $('#mf-open-slideshow-btn, #mf-mobile-slideshow-btn, #mf-trigger-mosaico-btn, #mf-footer-slideshow-link, #mf-btn-open-vintage').on('click', function() {
            openModal('mf-slideshow-modal');
            showMosaicoGrid();
        });

        // Close Modals
        $('#mf-close-auth-modal').on('click', function() { closeModal('mf-auth-modal'); });
        $('#mf-close-radar-modal').on('click', function() { closeModal('mf-radar-modal'); });
        $('#mf-close-vip-modal').on('click', function() { closeModal('mf-vip-modal'); });
        $('#mf-close-cart-modal').on('click', function() { closeModal('mf-cart-modal'); });

        // Filter chips
        $('.mf-chip-btn').on('click', function() {
            $('.mf-chip-btn').removeClass('active');
            $(this).addClass('active');
        });
    });

})(jQuery);
