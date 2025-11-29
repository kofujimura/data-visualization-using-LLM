class ItemVisualizationApp {
    constructor() {
        this.apiKey = '';
        this.fileData = null;
        this.filename = '';
        this.embeddings = [];
        this.graphData = null;

        this.init();
    }

    init() {
        this.loadApiKey();
        this.attachEventListeners();
    }

    loadApiKey() {
        const savedKey = localStorage.getItem('openai_api_key');
        if (savedKey) {
            this.apiKey = savedKey;
            document.getElementById('apiKey').value = savedKey;
            this.showStatus('APIキーを読み込みました', 'success');
        }
    }

    attachEventListeners() {
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('generateBtn').addEventListener('click', () => this.generate());
        document.getElementById('dataFile').addEventListener('change', (e) => this.handleFileUpload(e));

        document.getElementById('apiKey').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });
    }

    saveApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const key = apiKeyInput.value.trim();

        if (!key) {
            this.showStatus('APIキーを入力してください', 'error');
            return;
        }

        if (!key.startsWith('sk-')) {
            this.showStatus('有効なAPIキーを入力してください', 'error');
            return;
        }

        this.apiKey = key;
        localStorage.setItem('openai_api_key', key);
        this.showStatus('APIキーを保存しました', 'success');
    }

    showStatus(message, type) {
        const statusEl = document.getElementById('apiKeyStatus');
        statusEl.textContent = message;
        statusEl.style.color = type === 'success' ? '#28a745' : '#dc3545';

        setTimeout(() => {
            statusEl.textContent = '';
        }, 3000);
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.filename = file.name;
        const fileExtension = file.name.split('.').pop().toLowerCase();

        try {
            let data;
            if (fileExtension === 'csv') {
                data = await this.parseCSV(file);
            } else if (fileExtension === 'xlsx') {
                data = await this.parseXLSX(file);
            } else {
                this.showError('CSVまたはXLSXファイルを選択してください');
                return;
            }

            this.fileData = data;
            this.showFilePreview(data);
            document.getElementById('generateBtn').disabled = false;

        } catch (error) {
            console.error('File parsing error:', error);
            this.showError('ファイルの読み込みに失敗しました: ' + error.message);
        }
    }

    async parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split(/\r?\n/).filter(line => line.trim());

                    if (lines.length < 2) {
                        reject(new Error('CSVファイルには最低2行必要です'));
                        return;
                    }

                    const headers = this.parseCSVLine(lines[0]);
                    const rows = [];

                    for (let i = 1; i < lines.length; i++) {
                        const values = this.parseCSVLine(lines[i]);
                        if (values.length === headers.length) {
                            const row = {};
                            headers.forEach((header, index) => {
                                row[header] = values[index];
                            });
                            rows.push(row);
                        }
                    }

                    resolve({ headers, rows });
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    async parseXLSX(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    if (jsonData.length < 2) {
                        reject(new Error('XLSXファイルには最低2行必要です'));
                        return;
                    }

                    const headers = jsonData[0].map(h => String(h || ''));
                    const rows = [];

                    for (let i = 1; i < jsonData.length; i++) {
                        if (jsonData[i].some(cell => cell !== null && cell !== undefined && cell !== '')) {
                            const row = {};
                            headers.forEach((header, index) => {
                                row[header] = String(jsonData[i][index] || '');
                            });
                            rows.push(row);
                        }
                    }

                    resolve({ headers, rows });
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
            reader.readAsArrayBuffer(file);
        });
    }

    showFilePreview(data) {
        const previewDiv = document.getElementById('filePreview');
        const contentDiv = document.getElementById('previewContent');

        const maxRows = 5;
        const displayRows = data.rows.slice(0, maxRows);

        let html = '<table>';
        html += '<thead><tr>';
        data.headers.forEach(header => {
            html += `<th>${this.escapeHtml(header)}</th>`;
        });
        html += '</tr></thead>';
        html += '<tbody>';
        displayRows.forEach(row => {
            html += '<tr>';
            data.headers.forEach(header => {
                html += `<td>${this.escapeHtml(row[header] || '')}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        if (data.rows.length > maxRows) {
            html += `<p style="margin-top: 10px; color: #666; font-size: 12px;">...他 ${data.rows.length - maxRows} 行</p>`;
        }

        contentDiv.innerHTML = html;
        previewDiv.style.display = 'block';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async generate() {
        if (!this.apiKey) {
            this.showError('APIキーを保存してください');
            return;
        }

        if (!this.fileData) {
            this.showError('データファイルを選択してください');
            return;
        }

        try {
            this.hideError();
            this.setGenerateButton(false);

            await this.updateProgress(0, 'データを準備中...');
            const texts = this.buildTextsFromData(this.fileData);
            const items = this.fileData.rows.map((row, i) => {
                return row[this.fileData.headers[0]] || `アイテム${i + 1}`;
            });

            await this.updateProgress(30, 'Embeddingを生成中...');
            const embeddings = await this.generateEmbeddings(texts);
            this.embeddings = embeddings;

            await this.updateProgress(60, 'クラスタリング中...');
            const clusters = this.performClustering(embeddings, items.length);

            await this.updateProgress(80, '類似度を計算中...');
            const graphData = this.buildGraphData(items, embeddings, clusters);
            this.graphData = graphData;

            await this.updateProgress(100, '可視化中...');
            this.visualize(graphData);

            this.hideProgress();
            this.showInfo(this.filename, items.length, graphData.clusters, graphData.links.length);

        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message || '処理中にエラーが発生しました');
            this.hideProgress();
        } finally {
            this.setGenerateButton(true);
        }
    }

    buildTextsFromData(data) {
        return data.rows.map(row => {
            const parts = data.headers.map(header => {
                const value = row[header] || '';
                return `${header}:${value}`;
            });
            return parts.join(',');
        });
    }

    async generateEmbeddings(texts) {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'text-embedding-3-large',
                input: texts
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Embedding API Error: ${error.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.data.map(item => item.embedding);
    }

    performClustering(embeddings, itemCount) {
        const k = Math.min(15, Math.max(3, Math.floor(itemCount / 10)));

        const kmeans = new KMeans(k, 100);
        const clusters = kmeans.fit(embeddings);

        return clusters;
    }

    cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    buildGraphData(items, embeddings, clusters) {
        const nodes = items.map((item, i) => ({
            id: item,
            group: clusters[i]
        }));

        const similarityScores = [];
        for (let i = 0; i < embeddings.length; i++) {
            for (let j = i + 1; j < embeddings.length; j++) {
                const sim = this.cosineSimilarity(embeddings[i], embeddings[j]);
                similarityScores.push({ i, j, sim });
            }
        }

        const edgesRaw = {};
        items.forEach((_, i) => {
            edgesRaw[i] = [];
        });

        similarityScores.forEach(({ i, j, sim }) => {
            edgesRaw[i].push({ targetId: j, value: sim });
            edgesRaw[j].push({ targetId: i, value: sim });
        });

        const links = [];
        const addedEdges = new Set();

        Object.keys(edgesRaw).forEach(sourceId => {
            const sid = parseInt(sourceId);
            const connections = edgesRaw[sid];

            const topConnections = connections
                .sort((a, b) => b.value - a.value)
                .slice(0, 3);

            topConnections.forEach(conn => {
                const tid = conn.targetId;
                const edgeKey = sid < tid ? `${sid}-${tid}` : `${tid}-${sid}`;

                if (!addedEdges.has(edgeKey)) {
                    addedEdges.add(edgeKey);
                    links.push({
                        source: items[sid],
                        target: items[tid],
                        value: conn.value * 10
                    });
                }
            });
        });

        const uniqueClusters = new Set(clusters).size;

        return {
            nodes,
            links,
            clusters: uniqueClusters
        };
    }

    visualize(graphData) {
        if (window.visualizer) {
            window.visualizer.render(graphData);
        }
    }

    showInfo(filename, itemCount, clusterCount, edgeCount) {
        document.getElementById('statsFilename').textContent = filename;
        document.getElementById('statsCount').textContent = itemCount;
        document.getElementById('statsCluster').textContent = clusterCount;
        document.getElementById('statsEdges').textContent = edgeCount;
        document.getElementById('infoPanel').style.display = 'block';
    }

    async updateProgress(percent, text) {
        document.getElementById('progressContainer').style.display = 'block';
        document.getElementById('progressFill').style.width = `${percent}%`;
        document.getElementById('progressPercent').textContent = `${percent}%`;
        document.getElementById('progressText').textContent = text;

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    hideProgress() {
        document.getElementById('progressContainer').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorContainer').style.display = 'block';
    }

    hideError() {
        document.getElementById('errorContainer').style.display = 'none';
    }

    setGenerateButton(enabled) {
        const btn = document.getElementById('generateBtn');
        btn.disabled = !enabled;
        btn.textContent = enabled ? '生成して可視化' : '処理中...';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ItemVisualizationApp();
});
