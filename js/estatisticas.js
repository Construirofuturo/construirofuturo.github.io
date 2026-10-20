/*
 * CONTAGEM DE VISITAS (Google Analytics), configurado SEM COOKIES.
 * Não grava nada no browser de quem visita, por isso não precisa de aviso de consentimento.
 * Conta páginas vistas; os números veem-se em analytics.google.com.
 * Para desligar: deixe ID_ANALYTICS vazio ('').
 */
(function () {
  'use strict';
  var ID_ANALYTICS = 'G-R5F82X56NJ';
  if (!ID_ANALYTICS) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ID_ANALYTICS, {
    client_storage: 'none',                    // sem cookies nem armazenamento local
    allow_google_signals: false,               // sem ligação a contas Google
    allow_ad_personalization_signals: false    // sem publicidade
  });

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID_ANALYTICS;
  document.head.appendChild(s);
})();
