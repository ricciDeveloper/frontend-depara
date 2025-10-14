// ===== THEME TOGGLE FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  // Theme toggle event listener
  themeToggle.addEventListener('click', function() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
  
  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // Test server connection on load
  testServerConnection();
});

// ===== SERVER CONNECTION TEST =====
async function testServerConnection() {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.HEALTH);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor conectado:', data);
      
      // Test Gemini API connection
      await testGeminiConnection();
      
      updateStatus('Sistema pronto para processamento', 'success');
    } else {
      console.warn('⚠️ Servidor respondeu com erro:', response.status);
      updateStatus('Servidor com problemas - verifique se está rodando', 'error');
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com servidor:', error);
    updateStatus('Servidor não disponível - execute: npm run dev', 'error');
  }
}

// ===== GEMINI CONNECTION TEST =====
async function testGeminiConnection() {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.GEMINI_TEST);
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('✅ Gemini API:', data.message);
      } else {
        console.warn('⚠️ Gemini API:', data.message);
        updateStatus('Sistema funcionando sem Gemini AI', 'info');
      }
    } else {
      console.warn('⚠️ Erro ao testar Gemini API');
    }
  } catch (error) {
    console.warn('⚠️ Gemini API não disponível:', error.message);
  }
}

// ===== ENHANCED STATUS UPDATES =====
function updateStatus(message, type = 'info') {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = type;
  
  // Add fade-in animation
  statusEl.classList.add('fade-in');
  setTimeout(() => statusEl.classList.remove('fade-in'), 300);
}

// ===== ENHANCED LOADING STATES =====
function setLoadingState(isLoading) {
  const processBtn = document.getElementById('process');
  const statusEl = document.getElementById('status');
  
  if (isLoading) {
    processBtn.disabled = true;
    processBtn.textContent = 'Processando...';
    statusEl.className = 'loading';
    statusEl.textContent = 'Carregando e processando planilha...';
  } else {
    processBtn.disabled = false;
    processBtn.textContent = 'Processar planilha';
    statusEl.classList.remove('loading');
  }
}

// ===== PROGRESS BAR FUNCTIONS =====
function showProgressBar() {
  const progressContainer = document.getElementById('progressContainer');
  progressContainer.style.display = 'block';
  updateProgress(0, 'Iniciando processamento...');
}

function hideProgressBar() {
  setTimeout(() => {
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.style.display = 'none';
  }, 3000);
}

function updateProgress(percentage, message, type = 'info') {
  const progressBarFill = document.getElementById('progressBarFill');
  const progressMessage = document.getElementById('progressMessage');
  const progressPercentage = document.getElementById('progressPercentage');
  const progressDetails = document.getElementById('progressDetails');
  
  // Update progress bar
  progressBarFill.style.width = `${percentage}%`;
  
  // Update text
  progressMessage.textContent = message;
  progressPercentage.textContent = `${percentage}%`;
  
  // Update details based on type
  progressDetails.textContent = '';
  progressDetails.className = 'progress-details';
  
  if (type === 'success') {
    progressDetails.classList.add('success');
    progressDetails.textContent = 'Processamento concluído com sucesso!';
  } else if (type === 'error') {
    progressDetails.classList.add('error');
    progressDetails.textContent = 'Ocorreu um erro durante o processamento';
  }
  
  console.log(`Progress: ${percentage}% - ${message}`);
}

// ===== PROCESSING WITH PROGRESS =====
async function processWithProgress(requestBody) {
  // Simulate progress steps while processing
  const progressSteps = [
    { progress: 15, message: 'Analisando arquivo Excel...' },
    { progress: 25, message: 'Normalizando dados...' },
    { progress: 40, message: 'Calculando similaridades...' },
    { progress: 60, message: 'Aplicando inteligência artificial Gemini...' },
    { progress: 85, message: 'Gerando planilha de resultado...' },
    { progress: 95, message: 'Finalizando processamento...' }
  ];

  let currentStep = 0;
  
  // Start progress simulation
  const progressInterval = setInterval(() => {
    if (currentStep < progressSteps.length) {
      const step = progressSteps[currentStep];
      updateProgress(step.progress, step.message);
      currentStep++;
    }
  }, 2000); // Update every 2 seconds

  try {
    // Start the processing request
    const response = await apiRequest(API_CONFIG.ENDPOINTS.PROCESS, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    console.log('Resposta recebida:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      // Try to parse error as JSON, fallback to text
      let errorMessage = 'Erro no servidor';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Clear progress interval
    clearInterval(progressInterval);

    // Check if response is Excel file
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      // Handle file download
      updateProgress(100, 'Baixando arquivo...');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dexpara_resultado.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      updateProgress(100, '✅ Processamento concluído com sucesso!', 'success');
    } else {
      // Handle JSON response (shouldn't happen in normal flow)
      const data = await response.json();
      console.log('Unexpected JSON response:', data);
      throw new Error('Resposta inesperada do servidor');
    }
  } catch (error) {
    // Clear progress interval on error
    clearInterval(progressInterval);
    throw error;
  }
}

// ===== FILE HANDLING =====
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:application/...;base64, prefix
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// --- Helpers ---
 function parseWeights(str){
    const parts = str.split(',').map(s=>parseFloat(s.trim()));
    if(parts.length!==4 || parts.some(isNaN)) return [0.4,0.25,0.2,0.15];
    const s = parts.reduce((a,b)=>a+b,0);
    return parts.map(p=>p/s);
  }

  // Levenshtein distance (iterative) - used to compute similarity
  function levenshtein(a,b){
    if(a===b) return 0;
    if(a.length===0) return b.length;
    if(b.length===0) return a.length;
    const v0 = new Array(b.length+1).fill(0).map((_,i)=>i);
    const v1 = new Array(b.length+1).fill(0);
    for(let i=0;i<a.length;i++){
      v1[0]=i+1;
      for(let j=0;j<b.length;j++){
        const cost = a[i]===b[j]?0:1;
        v1[j+1]=Math.min(v1[j]+1, v0[j+1]+1, v0[j]+cost);
      }
      for(let k=0;k<v0.length;k++) v0[k]=v1[k];
    }
    return v1[b.length];
  }

  function similarity(a,b){
    if(!a) a=''; if(!b) b='';
    a = String(a).toLowerCase(); b = String(b).toLowerCase();
    if(a===b) return 1;
    const d = levenshtein(a,b);
    const max = Math.max(a.length, b.length);
    if(max===0) return 1;
    return Math.max(0, 1 - d/max);
  }

  function slugFromUrl(u){
    try{
      const url = new URL(u);
      return url.pathname.replace(/(^\/|\/$)/g,'');
    }catch(e){
      // fallback: last path segment
      const parts = String(u).split('/').filter(Boolean);
      return parts.length?parts[parts.length-1]:u;
    }
  }

  // --- Main logic ---
  document.getElementById('process').addEventListener('click', async ()=>{
    const f = document.getElementById('file').files[0];
    if(!f){ 
      updateStatus('Escolha um arquivo .xlsx com as abas DE e RASTREIO', 'error');
      return; 
    }
    
    setLoadingState(true);
    showProgressBar();
    
    try {
      // Convert file to base64
      updateProgress(5, 'Convertendo arquivo...');
      const fileData = await fileToBase64(f);
      console.log('Arquivo convertido, tamanho base64:', fileData.length);
      
      // Get weights and min score
      const weights = parseWeights(document.getElementById('weights').value);
      const minScore = 0.8; // 80% minimum score
      console.log('Pesos configurados:', weights, 'Score mínimo:', minScore);
      
      updateProgress(10, 'Enviando para processamento...');
      
      // Send to backend
      const requestBody = {
        fileData,
        weights,
        minScore
      };
      console.log('Enviando requisição para /api/process');
      
      // Process with progress tracking
      await processWithProgress(requestBody);
      
      // Show success message with details
      setTimeout(() => {
        updateStatus('Processamento concluído. Verifique o arquivo baixado para ver os resultados do DE x PARA.', 'success');
        hideProgressBar();
      }, 2000);

    } catch (error) {
      console.error('Processing error:', error);
      updateProgress(0, `❌ Erro: ${error.message}`, 'error');
      updateStatus(`❌ Erro: ${error.message}`, 'error');
    } finally {
      setLoadingState(false);
    }
  });

  function renderResults(results){
    const container = document.getElementById('results');
    container.innerHTML = '';
    
    if (results.length === 0) {
      container.innerHTML = '<div class="card text-center"><p>Nenhum resultado encontrado.</p></div>';
      return;
    }
    
    results.forEach((row, idx) => {
      const card = document.createElement('div');
      card.className = 'card fade-in';
      card.style.animationDelay = `${idx * 0.1}s`;
      
      // Header section
      const header = document.createElement('div');
      header.className = 'card-header';
      header.innerHTML = `
        <h3 class="card-title">Resultado ${idx + 1}</h3>
        <div class="card-subtitle">
          <strong>DE:</strong> <a href="${row.de.url}" target="_blank">${row.de.url}</a>
          <br><span class="small">Slug: ${row.de.slug}</span>
        </div>
      `;
      card.appendChild(header);

      // Table section
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      thead.innerHTML = '<tr><th>Rank</th><th>URL</th><th>Score</th><th>Detalhes</th></tr>';
      table.appendChild(thead);
      
      const tbody = document.createElement('tbody');
      row.candidates.slice(0,7).forEach((c,i)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="rank-badge">${i+1}</span></td>
          <td><a href="${c.url}" target="_blank">${c.url}</a></td>
          <td><span class="score-badge">${(c.score*100).toFixed(1)}%</span></td>
          <td class="small">
            <div class="score-details">
              <span>Slug: ${(c.details.slugScore*100).toFixed(0)}%</span>
              <span>Title: ${(c.details.titleScore*100).toFixed(0)}%</span>
              <span>Desc: ${(c.details.descScore*100).toFixed(0)}%</span>
              <span>H1: ${(c.details.h1Score*100).toFixed(0)}%</span>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      card.appendChild(table);

      // Action button
      const actionDiv = document.createElement('div');
      actionDiv.style.marginTop = '1rem';
      actionDiv.style.paddingTop = '1rem';
      actionDiv.style.borderTop = '1px solid var(--border-color)';
      
      const askButton = document.createElement('button');
      askButton.textContent = 'Ask Gemini (re-rank top 5)';
      askButton.addEventListener('click', ()=>askGemini(row.de, row.candidates.slice(0,5), card));
      actionDiv.appendChild(askButton);
      card.appendChild(actionDiv);

      container.appendChild(card);
    });
  }

  async function askGemini(deRow, candidates, cardEl){
    // send to your server-side proxy. The proxy should call Gemini and return structured JSON ranking.
    const status = document.createElement('div'); status.className='small'; status.textContent='Enviando para Gemini...'; cardEl.appendChild(status);
    try{
        const resp = await apiRequest(API_CONFIG.ENDPOINTS.GEMINI_ENHANCE, {
        method:'POST',
        body: JSON.stringify({deRow, candidates})
      });
      if(!resp.ok){
        const txt = await resp.text();
        status.textContent = 'Erro do proxy: ' + txt;
        return;
      }
      const data = await resp.json();
      // Expecting data to be an array of {id/url/score/reason}
      const out = document.createElement('pre'); out.textContent = JSON.stringify(data, null, 2);
      cardEl.appendChild(out);
      status.textContent = 'Resposta recebida.';
    }catch(e){
      status.textContent = 'Erro: ' + e.message;
    }
  }
// API configuration is now handled by apiConfig.js module
