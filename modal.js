        /**
         * M3Dialog API
         * スタイル注入からDOM生成まで全てJSで完結
         */
        const M3Dialog = {
            _styleInjected: false,

            /**
             * 必要なスタイルをdocumentに注入
             */
            _injectStyles: function() {
                if (this._styleInjected) return;

                const style = document.createElement('style');
                style.textContent = `
                    .m3-dialog {
                        border: none;
                        border-radius: 28px;
                        padding: 24px;
                        width: 90%;
                        max-width: 400px;
                        background-color: #e9eef6;
                        color: #1f1f1f;
                        box-shadow: 0 12px 20px 0 rgba(0,0,0,0.2);
                        
                        /* アニメーションの初期状態: 透明かつやや縮小 */
                        opacity: 0;
                        transform: scale(0.92);
                        
                        /* transitionの調整: 
                           cubic-bezier(0, 0, 0.2, 1) は Deceleration curve と呼ばれ、
                           素早く現れて最後に滑らかに減速して止まる挙動になります。
                        */
                        transition: 
                            opacity 0.2s ease-out, 
                            transform 0.25s cubic-bezier(0, 0, 0.2, 1);
                        
                        display: flex;
                        flex-direction: column;
                    }
                    
                    /* ダイアログが開いた時の状態: 等倍で静止 */
                    .m3-dialog[open] {
                        opacity: 1;
                        transform: scale(1);
                    }
                    
                    .m3-dialog::backdrop {
                        background: rgba(0, 0, 0, 0.4);
                        backdrop-filter: blur(2px);
                        opacity: 0;
                        transition: opacity 0.2s ease;
                    }
                    
                    .m3-dialog[open]::backdrop {
                        opacity: 1;
                    }

                    .m3-dialog-title {
                        font-size: 24px;
                        font-weight: 400;
                        margin: 0 0 16px 0;
                        font-family: 'Roboto', sans-serif;
                    }
                    .m3-dialog-content {
                        font-size: 14px;
                        line-height: 20px;
                        color: #444746;
                        margin-bottom: 24px;
                        font-family: 'Roboto', sans-serif;
                    }
                    .m3-dialog-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 8px;
                    }
                    .m3-btn-text {
                        background: transparent;
                        border: none;
                        color: #0b57d0;
                        padding: 10px 16px;
                        border-radius: 100px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        font-family: 'Roboto', sans-serif;
                        transition: background 0.2s;
                    }
                    .m3-btn-text:hover {
                        background: rgba(11, 87, 208, 0.08);
                    }
                `;
                document.head.appendChild(style);
                this._styleInjected = true;
            },

            /**
             * ダイアログを表示
             */
            show: function(config) {
                this._injectStyles();

                return new Promise((resolve) => {
                    const dialog = document.createElement('dialog');
                    dialog.className = 'm3-dialog';

                    const title = document.createElement('h2');
                    title.className = 'm3-dialog-title';
                    title.textContent = config.title || "確認";

                    const content = document.createElement('div');
                    content.className = 'm3-dialog-content';
                    content.textContent = config.message || "";

                    const actions = document.createElement('div');
                    actions.className = 'm3-dialog-actions';

                    const noBtn = document.createElement('button');
                    noBtn.className = 'm3-btn-text';
                    noBtn.textContent = config.noText || "キャンセル";

                    const yesBtn = document.createElement('button');
                    yesBtn.className = 'm3-btn-text';
                    yesBtn.textContent = config.yesText || "はい";

                    actions.appendChild(noBtn);
                    actions.appendChild(yesBtn);
                    dialog.appendChild(title);
                    dialog.appendChild(content);
                    dialog.appendChild(actions);
                    document.body.appendChild(dialog);

                    // 表示 (ブラウザのレンダリングを待つためリクエスト)
                    requestAnimationFrame(() => {
                        dialog.showModal();
                    });

                    const close = (result) => {
                        // 閉じる時も滑らかにフェードアウト
                        dialog.style.opacity = '0';
                        dialog.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            dialog.close();
                            dialog.remove();
                            resolve(result);
                        }, 200);
                    };

                    yesBtn.onclick = () => close(true);
                    noBtn.onclick = () => close(false);
                });
            }
        };

        // デモ実行
        document.getElementById('demoBtn').onclick = async () => {
            const result = await M3Dialog.show({
                title: "イージングの修正",
                message: "バウンス（跳ね返り）をなくし、目標のサイズへ滑らかに拡大して止まるように設定しました。",
                yesText: "OK",
                noText: "キャンセル"
            });
            console.log("選択結果:", result);
        };
