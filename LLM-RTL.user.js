// ==UserScript==
// @name         LLM RTL Fix (ChatGPT, Claude, DeepSeek, Qwen)
// @namespace    http://chat.openai.com
// @namespace    http://deepseek.com
// @namespace    http://claude.ai
// @author       Alireza Farzaneh (Edited for Claude fix)
// @version      0.1.3
// @description  Fixes the direction of RTL languages in LLM's interface without breaking code blocks
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @match        https://chat.deepseek.com/*
// @match        https://claude.ai/*
// @match        https://chat.qwen.ai/*
// @grant        none
// ==/UserScript==

;(function() {
    "use strict";
    const RTL_REGEX = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

    const styleId = 'llm-rtl-fix-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* اعمال راست‌چین به متن اصلی */
            .llm-rtl-applied {
                direction: rtl !important;
                text-align: right !important;
            }
            /* حفظ چپ‌چین برای بلوک‌های کد و کدهای درون‌خطی */
            .llm-rtl-applied pre,
            .llm-rtl-applied code,
            .llm-rtl-applied kbd,
            .llm-rtl-applied samp {
                direction: ltr !important;
                text-align: left !important;
                unicode-bidi: isolate !important;
            }
            /* حفظ ثبات لینک‌ها و عناصر فنی */
            .llm-rtl-applied a {
                unicode-bidi: isolate !important;
            }
        `;
        document.head.appendChild(style);
    }

    function applyRTLToNode(node) {
        if (!node) return;
        let elem = null;
        if (node.nodeType === Node.TEXT_NODE) {
            elem = node.parentElement;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            elem = node;
        }
        if (!elem) return;

        // اگر قبلاً اعمال شده، دوباره انجام نده
        if (elem.closest('.llm-rtl-applied')) return;

        // اگر داخل تگ‌های کد یا پیش‌فرمت‌شده است، اصلاً راست‌چین نکن
        if (elem.closest('pre') || elem.closest('code')) return;

        const txt = elem.textContent || "";
        if (RTL_REGEX.test(txt)) {
            elem.classList.add('llm-rtl-applied');
        }
    }

    function initialScan(root) {
        if (!root) root = document.body;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        let cur;
        while ((cur = walker.nextNode())) {
            applyRTLToNode(cur);
        }
    }

    initialScan(document.body);

    const observer = new MutationObserver((mutations) => {
        for (const mut of mutations) {
            if (mut.type === 'childList') {
                for (const nd of mut.addedNodes) {
                    applyRTLToNode(nd);
                    if (nd.nodeType === Node.ELEMENT_NODE) {
                        initialScan(nd);
                    }
                }
            } else if (mut.type === 'characterData') {
                applyRTLToNode(mut.target);
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

})();
