<?php
/**
 * Template Part: Modal Auth Gatekeeper (CPF + WhatsApp & Face ID)
 *
 * @package meflagrou
 */
?>

<div id="mf-auth-modal" class="mf-modal-backdrop" style="display: none;">
    <div class="mf-modal-dialog mf-auth-card">
        
        <!-- Modal Close Button -->
        <button type="button" class="mf-modal-close-btn" id="mf-close-auth-modal">
            <i data-lucide="x"></i>
        </button>

        <!-- Brand Header -->
        <div class="mf-auth-header">
            <div class="mf-auth-logo-badge">
                <i data-lucide="camera" class="mf-auth-logo-icon"></i>
            </div>
            <h2 class="mf-auth-title">meflagrou<span>.com</span></h2>
            <p class="mf-auth-subtitle">Acesso Exclusivo • Autenticação Segura por <strong>CPF & WhatsApp</strong></p>
            
            <div class="mf-auth-security-badge">
                <i data-lucide="shield-check"></i>
                <span>Token Criptografado WhatsApp & Face ID 128-D</span>
            </div>
        </div>

        <!-- 4 Navigation Tabs -->
        <div class="mf-auth-tabs">
            <button type="button" class="mf-auth-tab-btn active" data-auth-tab="whatsapp_cpf">
                <i data-lucide="phone"></i>
                <span>WhatsApp & CPF</span>
            </button>
            <button type="button" class="mf-auth-tab-btn" data-auth-tab="face_id">
                <i data-lucide="camera"></i>
                <span>Face ID</span>
            </button>
            <button type="button" class="mf-auth-tab-btn" data-auth-tab="register">
                <i data-lucide="user-plus"></i>
                <span>Cadastrar</span>
            </button>
            <button type="button" class="mf-auth-tab-btn" data-auth-tab="demo">
                <i data-lucide="zap"></i>
                <span>Demo</span>
            </button>
        </div>

        <!-- Error & Notification Box -->
        <div id="mf-auth-alert-box" class="mf-auth-alert" style="display: none;">
            <i data-lucide="alert-circle"></i>
            <span id="mf-auth-alert-text"></span>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 1: WHATSAPP + CPF AUTHENTICATION -->
        <!-- ========================================================================= -->
        <div class="mf-auth-tab-pane active" id="mf-tab-whatsapp-cpf">
            <!-- Step 1: Input CPF & Phone -->
            <form id="mf-form-request-otp" class="mf-auth-form">
                <div class="mf-form-group">
                    <label class="mf-form-label"><i data-lucide="file-text"></i> CPF (Módulo 11) *</label>
                    <input type="text" id="mf-login-cpf" class="mf-form-input" placeholder="000.000.000-00" maxlength="14" required />
                    <span class="mf-input-hint">Validação automática por algoritmo do Dígito Verificador.</span>
                </div>

                <div class="mf-form-group">
                    <label class="mf-form-label"><i data-lucide="message-square"></i> WhatsApp com DDD *</label>
                    <input type="tel" id="mf-login-whatsapp" class="mf-form-input" placeholder="(11) 98888-7777" maxlength="15" required />
                    <span class="mf-input-hint">Enviaremos um código PIN de 6 dígitos direto no seu WhatsApp.</span>
                </div>

                <button type="submit" class="mf-btn-submit-wa" id="mf-btn-send-otp">
                    <i data-lucide="send"></i>
                    <span>Enviar Código no WhatsApp</span>
                </button>
            </form>

            <!-- Step 2: Input 6-Digit OTP (Initially hidden) -->
            <form id="mf-form-verify-otp" class="mf-auth-form" style="display: none;">
                <div class="mf-wa-verify-banner">
                    <i data-lucide="message-square"></i>
                    <div>
                        <h4 id="mf-wa-target-number">Código enviado para o WhatsApp</h4>
                        <p>Digite o PIN de 6 dígitos que você recebeu via mensagem.</p>
                    </div>
                </div>

                <div class="mf-form-group">
                    <label class="mf-form-label"><i data-lucide="key-round"></i> Código de 6 Dígitos (Token WhatsApp) *</label>
                    <input type="text" id="mf-entered-otp" class="mf-form-input mf-otp-large-input" placeholder="000 000" maxlength="6" required />
                </div>

                <button type="button" class="mf-autofill-otp-btn" id="mf-btn-autofill-otp">
                    <i data-lucide="zap"></i>
                    <span>Auto-Preencher Código: <strong id="mf-autofill-code-text">784 921</strong></span>
                </button>

                <button type="submit" class="mf-btn-submit-wa" id="mf-btn-verify-otp">
                    <i data-lucide="check"></i>
                    <span>Validar e Entrar no meflagrou</span>
                </button>

                <div class="mf-resend-row">
                    <button type="button" class="mf-resend-btn" id="mf-btn-resend-otp">🔄 Reenviar novo código</button>
                    <button type="button" class="mf-back-btn" id="mf-btn-change-number">Alterar CPF ou WhatsApp</button>
                </div>
            </form>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 2: FACE ID BIOMETRIC SCAN -->
        <!-- ========================================================================= -->
        <div class="mf-auth-tab-pane" id="mf-tab-face-id" style="display: none;">
            <div class="mf-faceid-scanner-wrap">
                <div class="mf-scanner-circle" id="mf-face-scanner-circle">
                    <i data-lucide="camera" class="mf-scanner-cam-icon"></i>
                    <div class="mf-laser-bar" id="mf-scanner-laser" style="display: none;"></div>
                </div>
                <h3 class="mf-scanner-title">Login Instantâneo por Face ID</h3>
                <p class="mf-scanner-desc">
                    Posicione seu rosto em frente à câmera. Nossa IA biométrica busca seus flagrantes em todos os eventos.
                </p>
                <button type="button" class="mf-btn-neon-primary" id="mf-btn-start-face-scan">
                    <i data-lucide="sparkles"></i>
                    <span>Iniciar Escaneamento Facial</span>
                </button>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 3: CADASTRO COMPLETO (6+ CAMPOS) -->
        <!-- ========================================================================= -->
        <div class="mf-auth-tab-pane" id="mf-tab-register" style="display: none;">
            <form id="mf-form-register" class="mf-auth-form">
                <div class="mf-form-group">
                    <label class="mf-form-label"><i data-lucide="user"></i> Nome Completo *</label>
                    <input type="text" id="mf-reg-name" class="mf-form-input" placeholder="Ex: Gabriel Santos Silva" required />
                </div>

                <div class="mf-form-grid-2">
                    <div class="mf-form-group">
                        <label class="mf-form-label"><i data-lucide="file-text"></i> CPF (Módulo 11) *</label>
                        <input type="text" id="mf-reg-cpf" class="mf-form-input" placeholder="000.000.000-00" maxlength="14" required />
                    </div>
                    <div class="mf-form-group">
                        <label class="mf-form-label"><i data-lucide="message-square"></i> WhatsApp com DDD *</label>
                        <input type="tel" id="mf-reg-whatsapp" class="mf-form-input" placeholder="(11) 98888-7777" maxlength="15" required />
                    </div>
                </div>

                <div class="mf-form-group">
                    <label class="mf-form-label"><i data-lucide="map-pin"></i> Endereço Completo (Rua, Nº, Bairro)</label>
                    <input type="text" id="mf-reg-address" class="mf-form-input" placeholder="Ex: Av. Paulista, 1000 - Bela Vista" />
                </div>

                <div class="mf-form-grid-2">
                    <div class="mf-form-group">
                        <label class="mf-form-label"><i data-lucide="mail"></i> E-mail 1 (Principal) *</label>
                        <input type="email" id="mf-reg-email1" class="mf-form-input" placeholder="seu.email@exemplo.com" required />
                    </div>
                    <div class="mf-form-group">
                        <label class="mf-form-label"><i data-lucide="mail"></i> E-mail 2 (Secundário)</label>
                        <input type="email" id="mf-reg-email2" class="mf-form-input" placeholder="outro.email@exemplo.com" />
                    </div>
                </div>

                <div class="mf-form-grid-2">
                    <div class="mf-form-group">
                        <label class="mf-form-label"><i data-lucide="instagram"></i> @ Instagram</label>
                        <input type="text" id="mf-reg-handle" class="mf-form-input" placeholder="@seunome" />
                    </div>
                    <div class="mf-form-group">
                        <label class="mf-form-label"><i data-lucide="map-pin"></i> Cidade / UF</label>
                        <input type="text" id="mf-reg-city" class="mf-form-input" placeholder="São Paulo, SP" />
                    </div>
                </div>

                <button type="submit" class="mf-btn-submit-pink" id="mf-btn-submit-register">
                    <i data-lucide="user-plus"></i>
                    <span>Concluir Cadastro & Ativar Face ID</span>
                </button>
            </form>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 4: ACESSO RÁPIDO DEMO -->
        <!-- ========================================================================= -->
        <div class="mf-auth-tab-pane" id="mf-tab-demo" style="display: none;">
            <p class="mf-demo-desc">Selecione um perfil de demonstração para testar instantaneamente:</p>
            <div class="mf-demo-list">
                <div class="mf-demo-item" onclick="window.mfDemoLogin('DEUS Master', 'deus_official', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80')">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="DEUS Master" class="mf-demo-avatar" />
                    <div class="mf-demo-info">
                        <strong>DEUS Master</strong>
                        <span>@deus_official • 👑 Founder VIP</span>
                    </div>
                    <i data-lucide="arrow-right"></i>
                </div>

                <div class="mf-demo-item" onclick="window.mfDemoLogin('Camila Santos', 'camilasantos', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80')">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" alt="Camila Santos" class="mf-demo-avatar" />
                    <div class="mf-demo-info">
                        <strong>Camila Santos</strong>
                        <span>@camilasantos • Warung VIP</span>
                    </div>
                    <i data-lucide="arrow-right"></i>
                </div>
            </div>
        </div>

    </div>
</div>
